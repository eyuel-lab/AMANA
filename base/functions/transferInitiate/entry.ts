import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, riskFrom, audit, notify, requireUser } from '../../shared/security.ts';

const BLOCKED = ["restricted", "reported_lost", "reported_stolen", "disputed", "transfer_pending", "archived"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to transfer ownership." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const recordId = clean(body.record_id, 60);
    const toEmail = clean(body.to_email, 120).toLowerCase();
    const notes = clean(body.notes, 500);

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toEmail)) return Response.json({ error: "Enter a valid email for the new owner." }, { status: 400 });

    let record;
    try {
      record = await base44.asServiceRole.entities.OwnershipRecord.get(recordId);
    } catch (_error) {
      return Response.json({ error: "Ownership record not found." }, { status: 404 });
    }
    if (record.owner_id !== user.id) {
      await audit(base44, {
        actor_id: user.id, actor_name: user.full_name, action: "transfer.initiate.denied",
        resource_type: "OwnershipRecord", resource_id: recordId, outcome: "denied", reason: "Not the current owner",
      });
      return Response.json({ error: "Only the current owner can start a transfer." }, { status: 403 });
    }
    if (record.status !== "registered" || record.verification_state !== "verified") {
      return Response.json({ error: "This record is not in a transferable state. Resolve any open report or transfer first." }, { status: 409 });
    }
    if (BLOCKED.includes(record.status)) return Response.json({ error: "Record is restricted." }, { status: 409 });
    if (toEmail === String(user.email || "").toLowerCase()) {
      return Response.json({ error: "You cannot transfer a record to yourself." }, { status: 400 });
    }

    const found = await base44.asServiceRole.entities.User.filter({ email: toEmail });
    const matches = Array.isArray(found) ? found : found.items || [];
    const target = matches[0] || null;

    const signals = [];
    if (!target) signals.push({ id: "R-RECIPIENT-UNREGISTERED", level: "medium", note: "Recipient does not have an AMANA account yet" });
    if (target && target.created_date && Date.now() - new Date(target.created_date).getTime() < 7 * 86400000) {
      signals.push({ id: "R-RECIPIENT-NEW-ACCOUNT", level: "medium", note: "Recipient account is less than 7 days old" });
    }
    if (record.risk_level === "high") signals.push({ id: "R-RECORD-HIGH-RISK", level: "high", note: "Record already carries high-risk signals" });
    const risk = riskFrom(signals);
    const now = new Date().toISOString();

    const transfer = await base44.asServiceRole.entities.OwnershipTransfer.create({
      record_id: recordId,
      record_ref: record.public_ref,
      item_label: [record.brand, record.model].filter(Boolean).join(" "),
      from_owner_id: user.id,
      from_owner_name: record.owner_name || clean(user.full_name, 100),
      from_owner_email: user.email || "",
      to_email: toEmail,
      to_user_id: target ? target.id : "",
      to_user_name: target ? clean(target.full_name || target.email, 100) : "",
      from_consent: true,
      to_consent: false,
      status: "pending_acceptance",
      notes,
      risk_level: risk.level,
      risk_rules: risk.rules,
    });

    const history = Array.isArray(record.history) ? record.history.slice(-40) : [];
    history.push({ event: "transfer_initiated", at: now, actor_name: clean(user.full_name, 100), note: "Transfer started to " + toEmail });

    await base44.asServiceRole.entities.OwnershipRecord.update(recordId, {
      status: "transfer_pending",
      active_transfer_id: transfer.id,
      history,
    });

    await base44.asServiceRole.entities.RiskAssessment.create({
      subject_type: "transfer", subject_id: transfer.id, subject_label: record.public_ref,
      level: risk.level, score: risk.score, rules: risk.rules, explanation: risk.explanation, review_state: "auto",
    });

    if (target) {
      await notify(base44, {
        user_id: target.id, category: "transfer", title: "Ownership transfer waiting for you",
        body: record.owner_name + " wants to transfer " + transfer.item_label + " (" + record.public_ref + ") to you.",
        link: "/protection/reports",
      });
    }

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "user",
      action: "transfer.initiate", resource_type: "OwnershipTransfer", resource_id: transfer.id,
      metadata: { record: record.public_ref, to: toEmail, risk: risk.level },
    });

    return Response.json({ transfer: { id: transfer.id, status: transfer.status, risk_level: risk.level } });
  } catch (error) {
    return Response.json({ error: "Could not start the transfer." }, { status: 500 });
  }
}