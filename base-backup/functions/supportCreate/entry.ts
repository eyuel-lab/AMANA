import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, refCode, audit, requireUser } from '../../shared/security.ts';

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = clean(body.name, 80);
    const email = clean(body.email, 120).toLowerCase();
    const category = clean(body.category, 40) || "general";
    const subject = clean(body.subject, 140);
    const message = clean(body.message, 3000);
    const relatedRef = clean(body.related_ref, 40);

    if (name.length < 2) return Response.json({ error: "Enter your name." }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    if (subject.length < 4) return Response.json({ error: "Add a subject." }, { status: 400 });
    if (message.length < 20) return Response.json({ error: "Describe your request in at least 20 characters." }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    const reference = refCode("AMN-S", 6);

    const ticket = await base44.asServiceRole.entities.SupportTicket.create({
      reference,
      user_id: user ? user.id : "",
      name,
      email,
      category,
      subject,
      message,
      related_ref: relatedRef,
      status: "open",
    });

    await audit(base44, {
      actor_id: user ? user.id : "",
      actor_name: name,
      actor_role: user ? "user" : "guest",
      action: "support.create",
      resource_type: "SupportTicket",
      resource_id: ticket.id,
      metadata: { reference, category },
    });

    return Response.json({ reference });
  } catch (error) {
    return Response.json({ error: "Could not submit your request." }, { status: 500 });
  }
}