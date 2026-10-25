import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { notify } from '../../shared/security.ts';

async function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false;
  const parts = sigHeader.split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find((part) => part[0] === "t")?.[1];
  const signatures = parts.filter((part) => part[0] === "v1").map((part) => part[1]);
  if (!timestamp || !signatures.length) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const expected = [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => signature === expected);
}

async function markOrdersPaid(base44, sessionId, orderIds, event) {
  const now = new Date().toISOString();
  for (const orderId of orderIds) {
    try {
      const order = await base44.asServiceRole.entities.Order.get(orderId);
      if (!order || order.payment_status === "paid") continue;
      const timeline = [...(order.timeline || []), {
        at: now,
        event: "payment_confirmed",
        note: `Card payment confirmed via Stripe (${event}).`,
      }];
      await base44.asServiceRole.entities.Order.update(orderId, {
        status: "paid",
        payment_status: "paid",
        paid_at: now,
        payment_reference: sessionId,
        payment_provider: "stripe",
        timeline,
      });
      await notify(base44, {
        user_id: order.buyer_id, category: "order", title: `Payment confirmed — ${order.order_number}`,
        body: "Your card payment was received. The seller will now process your order.",
        link: "/buyer/orders/" + order.id,
      });
      await notify(base44, {
        user_id: order.seller_id, category: "order", title: `Payment received — ${order.order_number}`,
        body: `Payment for ${order.order_number} was confirmed. Process the order.`,
        link: "/seller/orders/" + order.id,
      });
    } catch (error) {
      console.error("Webhook could not update order:", orderId, error);
    }
  }
}

export default async function (req) {
  try {
    const rawBody = await req.text();
    const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!secret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set; refusing webhook.");
      return Response.json({ error: "Webhook is not configured." }, { status: 500 });
    }

    const valid = await verifyStripeSignature(rawBody, req.headers.get("Stripe-Signature") || "", secret);
    if (!valid) {
      console.error("Webhook signature verification failed.");
      return Response.json({ error: "Invalid signature." }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const session = event?.data?.object || {};
    const metadata = session.metadata || {};

    // Base44's own merchant self-test charge — not a customer order.
    if (metadata.base44_test_checkout === "true") {
      return Response.json({ received: true, ignored: "base44_test_checkout" });
    }

    if (
      (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") &&
      session.payment_status === "paid"
    ) {
      const orderIds = String(metadata.order_ids || "").split(",").filter(Boolean);
      const base44 = createClientFromRequest(req);
      await markOrdersPaid(base44, session.id, orderIds, event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("stripeWebhook error:", error);
    return Response.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}