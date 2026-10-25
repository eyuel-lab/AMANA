import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, refCode, audit, notify, requireUser } from '../../shared/security.ts';

const CATEGORIES = ["ownership", "listing", "order", "payment", "fraud"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to open a dispute." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const orderId = clean(body.order_id, 60);
    const recordId = clean(body.record_id, 60);
    const category = clean(body.category, 30);
    const subject = clean(body.subject, 140);
    const description = clean(body.description, 2000);

    if (!CATEGORIES.includes(category)) return Response.json({ error: "Choose a dispute category." }, { status: 400 });
    if (subject.length < 6) return Response.json({ error: "Add a short subject." }, { status: 400 });
    if (description.length < 30) return Response.json({ error: "Describe the issue in at least 30 characters." }, { status: 400 });
    if (!orderId && !recordId) return Response.json({ error: "Link the dispute to an order or ownership record." }, { status: 400 });

    let orderNumber = "";
    let partyRole = "";
    if (orderId) {
      const order = await base44.asServiceRole.entities.Order.get(orderId);
      if (order.buyer_id !== user.id && order.seller_id !== user.id) {
        return Response.json({ error: "You are not a party to that order." }, { status: 403 });
      }
      orderNumber = order.order_number;
      partyRole = order.buyer_id === user.id ? "buyer" : "seller";
    }
    if (recordId) {
      const record = await base44.asServiceRole.entities.OwnershipRecord.get(recordId);
      if (record.owner_id !== user.id) {
        return Response.json({ error: "You can only dispute a record you own." }, { status: 403 });
      }
      partyRole = partyRole || "owner";
    }

    const dispute = await base44.asServiceRole.entities.Dispute.create({
      reference: refCode("AMN-D", 6),
      order_id: orderId,
      order_number: orderNumber,
      record_id: recordId,
      opened_by_id: user.id,
      opened_by_name: clean(user.full_name || user.email, 100),
      party_role: partyRole,
      category,
      subject,
      description,
      status: "open",
    });

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "user",
      action: "dispute.open", resource_type: "Dispute", resource_id: dispute.id,
      metadata: { reference: dispute.reference, category },
    });

    await notify(base44, {
      user_id: user.id, category: "dispute", title: "Dispute " + dispute.reference + " opened",
      body: "An AMANA reviewer will examine your dispute. Keep this reference for follow-up.",
      link: "/buyer/notifications",
    });

    return Response.json({ dispute: { id: dispute.id, reference: dispute.reference } });
  } catch (error) {
    return Response.json({ error: "Could not open the dispute." }, { status: 500 });
  }
}