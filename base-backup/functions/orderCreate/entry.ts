import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, refCode, riskFrom, audit, notify, requireUser } from '../../shared/security.ts';

const DELIVERY_FEE = 250;

async function createStripeCheckout({ itemLines, deliveryLines, orderIds, buyerId, appUrl }) {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) throw new Error("Stripe is not configured for this app.");

  const params = new URLSearchParams();
  let index = 0;
  for (const line of itemLines) {
    params.set(`line_items[${index}][quantity]`, "1");
    params.set(`line_items[${index}][price_data][currency]`, "etb");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(Math.round(Number(line.price) * 100)));
    params.set(`line_items[${index}][price_data][product_data][name]`, String(line.title).slice(0, 120));
    index += 1;
  }
  for (const line of deliveryLines) {
    params.set(`line_items[${index}][quantity]`, "1");
    params.set(`line_items[${index}][price_data][currency]`, "etb");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(DELIVERY_FEE * 100));
    params.set(`line_items[${index}][price_data][product_data][name]`, `Delivery — ${String(line.label).slice(0, 80)}`);
    index += 1;
  }
  params.set("mode", "payment");
  params.set("success_url", `${appUrl}/buyer/orders?paid=1`);
  params.set("cancel_url", `${appUrl}/buyer/cart`);
  params.set("client_reference_id", orderIds[0] || "");
  params.set("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
  params.set("metadata[order_ids]", orderIds.join(","));
  params.set("metadata[buyer_id]", buyerId);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: params.toString(),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Stripe checkout create failed:", data?.error?.message || data);
    throw new Error(data?.error?.message || "Stripe checkout could not be created.");
  }
  return data;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to check out." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.cart_item_ids) ? body.cart_item_ids.filter((id) => typeof id === "string").slice(0, 10) : [];
    const deliveryName = clean(body.delivery_name, 100);
    const deliveryPhone = clean(body.delivery_phone, 30);
    const deliveryCity = clean(body.delivery_city, 80);
    const deliveryNotes = clean(body.delivery_notes, 300);

    if (!ids.length) return Response.json({ error: "Your cart is empty." }, { status: 400 });
    if (deliveryName.length < 2) return Response.json({ error: "Enter the recipient's name." }, { status: 400 });
    if (!/^[0-9+\s()-]{7,20}$/.test(deliveryPhone)) return Response.json({ error: "Enter a valid contact phone." }, { status: 400 });
    if (!deliveryCity) return Response.json({ error: "Enter a delivery city." }, { status: 400 });

    const appUrl = req.headers.get("X-Base44-App-Url");
    if (!appUrl) {
      console.error("Missing X-Base44-App-Url header; cannot build checkout return URLs.");
      return Response.json({ error: "Checkout is unavailable right now." }, { status: 500 });
    }

    const { items: cartItems } = await base44.entities.CartItem.filter({ id: { $in: ids } }, { limit: 10 });
    if (!cartItems.length) return Response.json({ error: "Those cart items could not be found." }, { status: 400 });

    const listingIds = cartItems.map((item) => item.listing_id);
    const { items: listings } = await base44.asServiceRole.entities.ProductListing.filter({ id: { $in: listingIds } }, { limit: 10 });
    const available = listings.filter((listing) => listing.status === "active" && listing.seller_id !== user.id);
    if (available.length !== cartItems.length) {
      return Response.json({ error: "One or more items are no longer available. Review your cart." }, { status: 409 });
    }

    const bySeller = {};
    available.forEach((listing) => {
      bySeller[listing.seller_id] = bySeller[listing.seller_id] || [];
      bySeller[listing.seller_id].push(listing);
    });

    const created = [];
    const now = new Date().toISOString();
    for (const sellerId of Object.keys(bySeller)) {
      const items = bySeller[sellerId];
      const subtotal = items.reduce((sum, listing) => sum + Number(listing.price || 0), 0);
      const total = subtotal + DELIVERY_FEE;
      const sellerName = items[0].seller_name || "AMANA seller";
      const signals = [];
      if (!items[0].seller_verified) signals.push({ id: "R-SELLER-UNVERIFIED", level: "medium", note: "Seller is not verification-approved" });
      if (total > 200000) signals.push({ id: "R-HIGH-VALUE-ORDER", level: "medium", note: "Order total above ETB 200,000" });
      if (items.some((listing) => ["restricted", "reported_stolen", "reported_lost", "disputed"].includes(listing.registry_status))) {
        signals.push({ id: "R-LINKED-RESTRICTED-RECORD", level: "high", note: "A linked ownership record is restricted" });
      }
      const risk = riskFrom(signals);

      const order = await base44.asServiceRole.entities.Order.create({
        order_number: refCode("AMN-O", 6),
        buyer_id: user.id,
        buyer_name: clean(user.full_name || user.email, 100),
        buyer_email: user.email || "",
        seller_id: sellerId,
        seller_name: sellerName,
        subtotal,
        delivery_fee: DELIVERY_FEE,
        total,
        currency: "ETB",
        status: "pending_payment",
        payment_status: "unpaid",
        payment_provider: "stripe",
        delivery_name: deliveryName,
        delivery_phone: deliveryPhone,
        delivery_city: deliveryCity,
        delivery_notes: deliveryNotes,
        timeline: [{ at: now, event: "order_created", note: "Order created. Awaiting card payment via Stripe." }],
        is_demo: false,
      });

      await base44.asServiceRole.entities.OrderItem.bulkCreate(
        items.map((listing) => ({
          order_id: order.id,
          buyer_id: user.id,
          seller_id: sellerId,
          listing_id: listing.id,
          title: listing.title,
          image: (listing.images || [])[0] || "",
          price: Number(listing.price || 0),
          quantity: 1,
        }))
      );

      await base44.asServiceRole.entities.ProductListing.updateMany(
        { id: { $in: items.map((listing) => listing.id) } },
        { $set: { status: "reserved" } }
      );

      await base44.asServiceRole.entities.RiskAssessment.create({
        subject_type: "order", subject_id: order.id, subject_label: order.order_number,
        level: risk.level, score: risk.score, rules: risk.rules, explanation: risk.explanation, review_state: "auto",
      });

      await notify(base44, {
        user_id: sellerId, category: "order", title: "New order " + order.order_number,
        body: clean(user.full_name || user.email, 60) + " placed an order awaiting card payment.",
        link: "/seller/orders/" + order.id,
      });

      created.push({ id: order.id, order_number: order.order_number, total: order.total });
    }

    // Rollback helper: if the Stripe session cannot be created, undo everything above.
    const rollback = async () => {
      const orderIds = created.map((order) => order.id);
      if (orderIds.length) {
        await base44.asServiceRole.entities.OrderItem.deleteMany({ order_id: { $in: orderIds } });
        await base44.asServiceRole.entities.Order.deleteMany({ id: { $in: orderIds } });
      }
      await base44.asServiceRole.entities.ProductListing.updateMany(
        { id: { $in: listingIds } },
        { $set: { status: "active" } }
      );
    };

    let session;
    try {
      session = await createStripeCheckout({
        itemLines: available.map((listing) => ({ price: listing.price, title: listing.title })),
        deliveryLines: Object.keys(bySeller).map((sellerId) => ({ label: bySeller[sellerId][0]?.seller_name || "seller" })),
        orderIds: created.map((order) => order.id),
        buyerId: user.id,
        appUrl,
      });
    } catch (stripeError) {
      console.error("Checkout session creation failed:", stripeError);
      await rollback();
      return Response.json({ error: "Payment could not be started: " + (stripeError.message || "unknown error") }, { status: 502 });
    }

    await base44.asServiceRole.entities.Order.updateMany(
      { id: { $in: created.map((order) => order.id) } },
      { $set: { payment_reference: session.id } }
    );

    await base44.asServiceRole.entities.CartItem.deleteMany({ id: { $in: cartItems.map((item) => item.id) } });

    await notify(base44, {
      user_id: user.id, category: "order", title: "Order created — complete your payment",
      body: "Complete your card payment on the Stripe checkout page to confirm your order.",
      link: "/buyer/orders",
    });

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "user",
      action: "order.create", resource_type: "Order", resource_id: created.map((order) => order.id).join(","),
      metadata: { orders: created.length, provider: "stripe" },
    });

    return Response.json({
      orders: created,
      checkout: { session_id: session.id, url: session.url },
      payment: { status: "stripe_checkout", message: "Complete your payment on the Stripe checkout page to confirm the order." },
    });
  } catch (error) {
    console.error("orderCreate error:", error);
    return Response.json({ error: "Checkout could not be completed." }, { status: 500 });
  }
}