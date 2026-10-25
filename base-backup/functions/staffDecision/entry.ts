import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, refCode, audit, notify, requireUser, hasRole, roleOf } from '../../shared/security.ts';

const PERMISSIONS = {
  listing: ["reviewer", "admin"],
  verification: ["reviewer", "admin"],
  record: ["reviewer", "admin"],
  report: ["reviewer", "investigator", "admin"],
  transfer: ["reviewer", "admin"],
  dispute: ["admin"],
  case: ["investigator", "admin"],
};

const RESTRICTING = ["restricted", "reported_lost", "reported_stolen"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const subject = clean(body.subject, 30);
    const id = clean(body.id, 60);
    const action = clean(body.action, 30);
    const notes = clean(body.notes, 1000);
    const allowed = PERMISSIONS[subject];

    if (!allowed) return Response.json({ error: "Unknown review subject." }, { status: 400 });
    if (!hasRole(user, allowed)) {
      await audit(base44, {
        actor_id: user.id, actor_name: user.full_name, actor_role: roleOf(user),
        action: subject + "." + action + ".denied", resource_type: subject, resource_id: id,
        outcome: "denied", reason: "Insufficient role",
      });
      return Response.json({ error: "Your role cannot perform this decision." }, { status: 403 });
    }
    if (["reject", "more_info", "resolve"].includes(action) && notes.length < 5) {
      return Response.json({ error: "Add a short note explaining the decision." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const actorName = clean(user.full_name || user.email, 100);
    let outcomeNote = "";

    if (subject === "listing") {
      const listing = await base44.asServiceRole.entities.ProductListing.get(id);
      if (listing.status !== "pending") return Response.json({ error: "Listing is not awaiting review." }, { status: 409 });
      if (action === "approve") {
        await base44.asServiceRole.entities.ProductListing.update(id, {
          status: "active", published_at: now, moderation_notes: notes || "Approved",
        });
        outcomeNote = "Your listing is now live.";
      } else if (action === "reject") {
        await base44.asServiceRole.entities.ProductListing.update(id, {
          status: "rejected", moderation_notes: notes,
        });
        outcomeNote = "Your listing was not approved: " + notes;
      } else {
        return Response.json({ error: "Unsupported action." }, { status: 400 });
      }
      await notify(base44, {
        user_id: listing.seller_id, category: "listing", title: "Listing review complete",
        body: outcomeNote, link: "/seller/listings",
      });
    } else if (subject === "verification") {
      const verification = await base44.asServiceRole.entities.SellerVerification.get(id);
      if (!["pending", "more_info"].includes(verification.status)) return Response.json({ error: "This request is already decided." }, { status: 409 });
      const nextStatus = action === "approve" ? "verified" : action === "reject" ? "rejected" : action === "more_info" ? "more_info" : null;
      if (!nextStatus) return Response.json({ error: "Unsupported action." }, { status: 400 });
      await base44.asServiceRole.entities.SellerVerification.update(id, {
        status: nextStatus, review_notes: notes, reviewer_id: user.id, decided_at: now,
      });
      await notify(base44, {
        user_id: verification.user_id, category: "verification", title: "Seller verification " + nextStatus.replace("_", " "),
        body: notes || "Your verification status changed.", link: "/seller/verification", is_security: true,
      });
    } else if (subject === "record") {
      const record = await base44.asServiceRole.entities.OwnershipRecord.get(id);
      if (record.status !== "pending_review") return Response.json({ error: "Record is not awaiting review." }, { status: 409 });
      const history = Array.isArray(record.history) ? record.history.slice(-40) : [];
      if (action === "approve") {
        const certificate = refCode("AMN-C", 8);
        history.push({ event: "verified", at: now, actor_name: actorName, note: "Ownership evidence reviewed and verified." });
        await base44.asServiceRole.entities.OwnershipRecord.update(id, {
          status: "registered", verification_state: "verified", certificate_serial: certificate,
          certificate_issued_at: now, history,
        });
        await notify(base44, {
          user_id: record.owner_id, category: "registry", title: "Ownership record verified",
          body: "Record " + record.public_ref + " is verified. Certificate " + certificate + " is available.",
          link: "/registry/certificate/" + id,
        });
      } else if (action === "reject") {
        history.push({ event: "rejected", at: now, actor_name: actorName, note: notes });
        await base44.asServiceRole.entities.OwnershipRecord.update(id, {
          status: "archived", verification_state: "unverified", history,
        });
        await notify(base44, {
          user_id: record.owner_id, category: "registry", title: "Ownership record not verified",
          body: notes, link: "/buyer/registry",
        });
      } else {
        return Response.json({ error: "Unsupported action." }, { status: 400 });
      }
    } else if (subject === "report") {
      const report = await base44.asServiceRole.entities.TheftOrLossReport.get(id);
      const record = await base44.asServiceRole.entities.OwnershipRecord.get(report.record_id);
      const history = Array.isArray(record.history) ? record.history.slice(-40) : [];
      if (action === "confirm" || action === "more_info") {
        if (!["submitted", "under_review"].includes(report.status)) return Response.json({ error: "Report already decided." }, { status: 409 });
        const nextStatus = action === "confirm" ? "confirmed" : "more_info";
        await base44.asServiceRole.entities.TheftOrLossReport.update(id, {
          status: nextStatus, decision_notes: notes, reviewer_id: user.id, reviewed_at: now, restriction_active: true,
        });
        history.push({ event: action === "confirm" ? "report_confirmed" : "report_more_info", at: now, actor_name: actorName, note: notes });
        await base44.asServiceRole.entities.OwnershipRecord.update(record.id, {
          status: report.report_type === "stolen" ? "reported_stolen" : "reported_lost",
          restriction_reason: action === "confirm" ? "Confirmed " + report.report_type + " report " + report.report_number : "Report " + report.report_number + " needs more information",
          history,
        });
        if (action === "confirm") {
          const { items: cases } = await base44.asServiceRole.entities.InvestigationCase.filter({ report_id: id }, { limit: 1 });
          if (!cases.length) {
            await base44.asServiceRole.entities.InvestigationCase.create({
              case_number: refCode("AMN-CASE", 6), report_id: id, record_id: record.id, record_ref: record.public_ref,
              status: "open", priority: report.report_type === "stolen" ? "high" : "medium",
              summary: report.report_type + " report " + report.report_number + " confirmed by " + actorName,
              opened_at: now, opened_by: user.id,
            });
          }
        }
        await notify(base44, {
          user_id: report.reporter_id, category: "protection", title: "Report " + report.report_number + " " + nextStatus,
          body: notes, link: "/protection/report/" + id, is_security: true,
        });
      } else if (action === "reject" || action === "resolve") {
        if (!["submitted", "under_review", "more_info", "confirmed"].includes(report.status)) {
          return Response.json({ error: "Report already closed." }, { status: 409 });
        }
        const nextStatus = action === "reject" ? "rejected" : "resolved";
        await base44.asServiceRole.entities.TheftOrLossReport.update(id, {
          status: nextStatus, decision_notes: notes, reviewer_id: user.id, reviewed_at: now, restriction_active: false,
        });
        history.push({ event: action === "reject" ? "report_rejected" : "report_resolved", at: now, actor_name: actorName, note: notes });
        const stillRestricted = RESTRICTING.includes(record.status) && record.active_report_id !== id;
        if (!stillRestricted) {
          await base44.asServiceRole.entities.OwnershipRecord.update(record.id, {
            status: "registered", restriction_reason: "", active_report_id: "", history,
          });
        }
        const { items: cases } = await base44.asServiceRole.entities.InvestigationCase.filter({ report_id: id }, { limit: 1 });
        if (cases.length) {
          await base44.asServiceRole.entities.InvestigationCase.update(cases[0].id, { status: "closed", closed_at: now, findings: notes });
        }
        await notify(base44, {
          user_id: report.reporter_id, category: "protection", title: "Report " + report.report_number + " " + nextStatus,
          body: notes, link: "/protection/report/" + id, is_security: true,
        });
      } else {
        return Response.json({ error: "Unsupported action." }, { status: 400 });
      }
    } else if (subject === "transfer") {
      const transfer = await base44.asServiceRole.entities.OwnershipTransfer.get(id);
      const record = await base44.asServiceRole.entities.OwnershipRecord.get(transfer.record_id);
      const history = Array.isArray(record.history) ? record.history.slice(-40) : [];
      if (transfer.status !== "pending_review") return Response.json({ error: "Transfer is not awaiting review." }, { status: 409 });
      if (action === "approve") {
        if (RESTRICTING.includes(record.status) || record.active_report_id || record.status === "disputed") {
          return Response.json({ error: "Record has an active restriction. The transfer cannot be committed." }, { status: 409 });
        }
        history.push({ event: "transfer_completed", at: now, actor_name: actorName, note: "Ownership moved to " + transfer.to_email });
        await base44.asServiceRole.entities.OwnershipRecord.update(record.id, {
          owner_id: transfer.to_user_id, owner_name: transfer.to_user_name || transfer.to_email,
          status: "registered", active_transfer_id: "", history,
        });
        await base44.asServiceRole.entities.OwnershipTransfer.update(id, {
          status: "completed", decided_by: user.id, decided_at: now, review_notes: notes,
        });
      } else if (action === "reject") {
        history.push({ event: "transfer_rejected", at: now, actor_name: actorName, note: notes });
        await base44.asServiceRole.entities.OwnershipRecord.update(record.id, {
          status: "registered", active_transfer_id: "", history,
        });
        await base44.asServiceRole.entities.OwnershipTransfer.update(id, {
          status: "rejected", decided_by: user.id, decided_at: now, review_notes: notes,
        });
      } else {
        return Response.json({ error: "Unsupported action." }, { status: 400 });
      }
      for (const recipient of [transfer.from_owner_id, transfer.to_user_id]) {
        if (recipient) {
          await notify(base44, {
            user_id: recipient, category: "transfer", title: "Transfer " + action + "d",
            body: record.public_ref + " — " + (notes || "Decision recorded by " + actorName),
            link: "/registry/property/" + record.id, is_security: true,
          });
        }
      }
    } else if (subject === "dispute") {
      if (!["resolve", "reject"].includes(action)) return Response.json({ error: "Unsupported action." }, { status: 400 });
      const dispute = await base44.asServiceRole.entities.Dispute.get(id);
      await base44.asServiceRole.entities.Dispute.update(id, {
        status: action === "resolve" ? "resolved" : "rejected", resolution: notes, assigned_to: user.id,
      });
      await notify(base44, {
        user_id: dispute.opened_by_id, category: "dispute", title: "Dispute " + dispute.reference + " " + action + "d",
        body: notes, link: "/buyer/notifications",
      });
    } else if (subject === "case") {
      if (!["update", "close"].includes(action)) return Response.json({ error: "Unsupported action." }, { status: 400 });
      if (action === "close") {
        await base44.asServiceRole.entities.InvestigationCase.update(id, { status: "closed", closed_at: now, findings: notes });
      } else {
        await base44.asServiceRole.entities.InvestigationCase.update(id, { findings: notes });
      }
    }

    await audit(base44, {
      actor_id: user.id, actor_name: actorName, actor_role: roleOf(user),
      action: subject + "." + action, resource_type: subject, resource_id: id, reason: notes,
    });

    return Response.json({ ok: true, subject, action });
  } catch (error) {
    return Response.json({ error: "The decision could not be recorded." }, { status: 500 });
  }
}