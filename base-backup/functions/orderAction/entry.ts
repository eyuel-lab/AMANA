import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, audit, notify, requireUser, hasRole } from '../../shared/security.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to manage orders." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const orderId = clean(body.order_id, 60);
    const action = clean(body.action, 30);
    const reason = clean(body.reason, 300);

    let order;
    try {
      order = await base44.asServiceRole.entities.Order.get(orderId);
    } catch (_error) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;
    const isAdmin = hasRole(user, ["admin"]);
    if (!isBuyer && !isSeller && !isAdmin) {
      await audit(base44, {
        actor_id: user.id, actor_name: user.full_name, action: "order." + action + ".denied",
        resource_type: "Order", resource_id: orderId, outcome: "denied", reason: "Not a party to the order",
      });
      return Response.json({ error: "You are not a party to this order." }, { status: 403 });
    }

    if (action !== "cancel") return Response.json({ error: "Unsupported action." }, { status: 400 });
    if (!["pending_payment", "paid"].includes(order.status)) {
      return Response.json({ error: "This order can no longer be cancelled online." }, { status: 409 });
    }
    if (order.payment_status === "paid" && !isAdmin) {
      return Response.json({ error: "Paid orders can only be cancelled by AMANA support." }, { status: 403 });
    }

    const now = new Date().toISOString();
    const timeline = Array.isArray(order.timeline) ? order.timeline.slice(-30) : [];
    timeline.push({ at: now, event: "cancelled", note: reason || "Cancelled by " + (isAdmin ? "administrator" : isBuyer ? "buyer" : "seller") });

    await base44.asServiceRole.entities.Order.update(orderId, { status: "cancelled", timeline });

    const { items: orderItems } = await base44.asServiceRole.entities.OrderItem.filter({ order_id: orderId }, { limit: 20 });
    if (orderItems.length) {
      await base44.asServiceRole.entities.ProductListing.updateMany(
        { id: { $in: orderItems.map((item) => item.listing_id) }, status: "reserved" },
        { $set: { status: "active" } }
      );
    }

    await notify(base44, {
      user_id: isBuyer ? order.seller_id : order.buyer_id,
      category: "order",
      title: "Order " + order.order_number + " cancelled",
      body: reason || "The order was cancelled and the listing is available again.",
      link: "/buyer/orders",
    });

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: user.role || "user",
      action: "order.cancel", resource_type: "Order", resource_id: orderId, reason,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: "Could not update the order." }, { status: 500 });
  }
}