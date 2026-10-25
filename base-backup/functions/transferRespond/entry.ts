import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, audit, notify, requireUser } from '../../shared/security.ts';

const RESTRICTED = ["restricted", "reported_lost", "reported_stolen", "disputed", "archived"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to respond to a transfer." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const transferId = clean(body.transfer_id, 60);
    const action = clean(body.action, 20);

    let transfer;
    try {
      transfer = await base44.asServiceRole.entities.OwnershipTransfer.get(transferId);
    } catch (_error) {
      return Response.json({ error: "Transfer not found." }, { status: 404 });
    }

    const isRecipient = transfer.to_user_id === user.id || String(transfer.to_email) === String(user.email || "").toLowerCase();
    const isOwner = transfer.from_owner_id === user.id;
    if (!isRecipient && !isOwner) {
      await audit(base44, {
        actor_id: user.id, actor_name: user.full_name, action: "transfer.respond.denied",
        resource_type: "OwnershipTransfer", resource_id: transferId, outcome: "denied", reason: "Not a party to the transfer",
      });
      return Response.json({ error: "You are not a party to this transfer." }, { status: 403 });
    }

    let record;
    try {
      record = await base44.asServiceRole.entities.OwnershipRecord.get(transfer.record_id);
    } catch (_error) {
      return Response.json({ error: "Linked record is unavailable." }, { status: 404 });
    }
    const now = new Date().toISOString();
    const history = Array.isArray(record.history) ? record.history.slice(-40) : [];

    if (action === "accept") {
      if (!isRecipient) return Response.json({ error: "Only the intended recipient can accept." }, { status: 403 });
      if (transfer.status !== "pending_acceptance") return Response.json({ error: "This transfer can no longer be accepted." }, { status: 409 });
      if (RESTRICTED.includes(record.status) || record.active_report_id) {
        return Response.json({ error: "This record has an active restriction and cannot be transferred." }, { status: 409 });
      }
      if (record.active_transfer_id && record.active_transfer_id !== transfer.id) {
        return Response.json({ error: "Another transfer is already in progress for this record." }, { status: 409 });
      }

      history.push({ event: "transfer_accepted", at: now, actor_name: clean(user.full_name || user.email, 100), note: "Recipient consented to the transfer." });
      await base44.asServiceRole.entities.OwnershipTransfer.update(transferId, {
        to_user_id: user.id,
        to_user_name: clean(user.full_name || user.email, 100),
        to_consent: true,
        status: "pending_review",
      });
      await base44.asServiceRole.entities.OwnershipRecord.update(record.id, { history });
      await notify(base44, {
        user_id: transfer.from_owner_id, category: "transfer", title: "Transfer accepted",
        body: "The recipient accepted. A reviewer will complete the ownership change for " + record.public_ref + ".",
        link: "/registry/property/" + record.id,
      });
    } else if (action === "decline") {
      if (!isRecipient) return Response.json({ error: "Only the intended recipient can decline." }, { status: 403 });
      if (!["pending_acceptance", "pending_review"].includes(transfer.status)) {
        return Response.json({ error: "This transfer is already closed." }, { status: 409 });
      }
      history.push({ event: "transfer_declined", at: now, actor_name: clean(user.full_name || user.email, 100), note: "Recipient declined the transfer." });
      await base44.asServiceRole.entities.OwnershipTransfer.update(transferId, { status: "rejected" });
      await base44.asServiceRole.entities.OwnershipRecord.update(record.id, {
        status: "registered", active_transfer_id: "", history,
      });
      await notify(base44, {
        user_id: transfer.from_owner_id, category: "transfer", title: "Transfer declined",
        body: "The recipient declined the transfer of " + record.public_ref + ".",
        link: "/registry/property/" + record.id,
      });
    } else if (action === "cancel") {
      if (!isOwner) return Response.json({ error: "Only the current owner can cancel." }, { status: 403 });
      if (!["pending_acceptance", "pending_review"].includes(transfer.status)) {
        return Response.json({ error: "This transfer is already closed." }, { status: 409 });
      }
      history.push({ event: "transfer_cancelled", at: now, actor_name: clean(user.full_name, 100), note: "Owner cancelled the transfer." });
      await base44.asServiceRole.entities.OwnershipTransfer.update(transferId, { status: "cancelled" });
      await base44.asServiceRole.entities.OwnershipRecord.update(record.id, {
        status: "registered", active_transfer_id: "", history,
      });
    } else {
      return Response.json({ error: "Unsupported action." }, { status: 400 });
    }

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "user",
      action: "transfer." + action, resource_type: "OwnershipTransfer", resource_id: transferId,
      metadata: { record: record.public_ref },
    });

    return Response.json({ ok: true, action });
  } catch (error) {
    return Response.json({ error: "Could not update the transfer." }, { status: 500 });
  }
}