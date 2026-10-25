import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clean, refCode, riskFrom, audit, notify, requireUser } from '../../shared/security.ts';

const TYPES = ["lost", "stolen"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    if (!user) return Response.json({ error: "Sign in to file a report." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const recordId = clean(body.record_id, 60);
    const reportType = clean(body.report_type, 20);
    const description = clean(body.description, 2000);
    const evidence = Array.isArray(body.evidence_uris)
      ? body.evidence_uris.filter((uri) => typeof uri === "string" && uri.startsWith("private/")).slice(0, 5)
      : [];

    if (!TYPES.includes(reportType)) return Response.json({ error: "Choose lost or stolen." }, { status: 400 });
    if (description.length < 30) return Response.json({ error: "Describe the circumstances in at least 30 characters." }, { status: 400 });
    if (body.accuracy_confirmed !== true) return Response.json({ error: "Confirm that the information is accurate." }, { status: 400 });

    let record;
    try {
      record = await base44.asServiceRole.entities.OwnershipRecord.get(recordId);
    } catch (_error) {
      return Response.json({ error: "Ownership record not found." }, { status: 404 });
    }
    if (record.owner_id !== user.id) {
      await audit(base44, {
        actor_id: user.id, actor_name: user.full_name, action: "protection.report.denied",
        resource_type: "OwnershipRecord", resource_id: recordId, outcome: "denied", reason: "Not the record owner",
      });
      return Response.json({ error: "You can only report a record you own." }, { status: 403 });
    }
    if (record.status !== "registered" || record.active_report_id) {
      return Response.json({ error: "This record already has an open report or is not currently registered." }, { status: 409 });
    }

    const { items: priorReports } = await base44.asServiceRole.entities.TheftOrLossReport.filter(
      { record_id: recordId },
      { sort: "-created_date", limit: 10 }
    );
    const signals = [];
    if (priorReports.some((item) => item.status === "rejected")) {
      signals.push({ id: "R-PRIOR-REJECTED-REPORT", level: "medium", note: "This record had a previously rejected report" });
    }
    if (record.certificate_issued_at && Date.now() - new Date(record.certificate_issued_at).getTime() < 7 * 86400000) {
      signals.push({ id: "R-RECENT-REGISTRATION", level: "low", note: "Report filed within 7 days of registration" });
    }
    const risk = riskFrom(signals);
    const now = new Date().toISOString();
    const reportNumber = refCode("AMN-R", 6);

    const report = await base44.asServiceRole.entities.TheftOrLossReport.create({
      record_id: record.id,
      record_ref: record.public_ref,
      item_label: [record.brand, record.model].filter(Boolean).join(" "),
      reporter_id: user.id,
      reporter_name: clean(user.full_name || user.email, 100),
      report_number: reportNumber,
      report_type: reportType,
      description,
      evidence_uris: evidence,
      status: "submitted",
      restriction_active: true,
    });

    const history = Array.isArray(record.history) ? record.history.slice(-40) : [];
    history.push({ event: reportType === "stolen" ? "reported_stolen" : "reported_lost", at: now, actor_name: clean(user.full_name, 100), note: "Report " + reportNumber + " submitted (allegation pending review)." });

    await base44.asServiceRole.entities.OwnershipRecord.update(record.id, {
      status: reportType === "stolen" ? "reported_stolen" : "reported_lost",
      restriction_reason: "Pending review of " + reportType + " report " + reportNumber,
      active_report_id: report.id,
      history,
    });

    await base44.asServiceRole.entities.RiskAssessment.create({
      subject_type: "report", subject_id: report.id, subject_label: record.public_ref,
      level: risk.level, score: risk.score, rules: risk.rules, explanation: risk.explanation, review_state: "auto",
    });

    await audit(base44, {
      actor_id: user.id, actor_name: user.full_name, actor_role: "user",
      action: "protection.report", resource_type: "TheftOrLossReport", resource_id: report.id,
      metadata: { record: record.public_ref, type: reportType },
    });

    await notify(base44, {
      user_id: user.id, category: "protection", title: "Report " + reportNumber + " received",
      body: "The record is restricted while the report is reviewed. Keep this reference for follow-up.",
      link: "/protection/report/" + report.id,
      is_security: true,
    });

    return Response.json({ report: { id: report.id, report_number: reportNumber, status: report.status } });
  } catch (error) {
    return Response.json({ error: "Could not file the report." }, { status: 500 });
  }
}