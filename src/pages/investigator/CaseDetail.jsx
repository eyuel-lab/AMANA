import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, ShieldAlert, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import EvidenceList from "@/components/common/EvidenceList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";

export default function CaseDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      const item = await base44.entities.InvestigationCase.get(id);
      const report = item.report_id ? await base44.entities.TheftOrLossReport.get(item.report_id).catch(() => null) : null;
      const record = item.record_id ? await base44.entities.OwnershipRecord.get(item.record_id).catch(() => null) : null;
      const risks = report ? await base44.entities.RiskAssessment.filter({ subject_type: "report", subject_id: report.id }, { limit: 5 }).then((page) => page.items).catch(() => []) : [];
      setData({ item, report, record, risks });
      setNotes(item.findings || "");
    } catch (error) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const act = async (action) => {
    setBusy(action);
    setNotice("");
    try {
      await base44.functions.invoke("staffDecision", { subject: "case", id, action, notes });
      setNotice(action === "close" ? "Case closed. Findings recorded." : "Findings saved.");
      await load();
    } catch (err) {
      setNotice(err.response?.data?.error || err.message);
    } finally {
      setBusy("");
    }
  };

  if (loading) return <LoadingBlock rows={4} />;
  if (!data) return <p className="text-[13px] text-muted-foreground">Case not found, or you are not assigned to it.</p>;

  const { item, report, record, risks } = data;

  return (
    <div className="space-y-6">
      <Link to="/investigator/cases" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-forest"><ChevronLeft className="h-3.5 w-3.5" /> All cases</Link>

      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{item.case_number}</p>
          <h1 className="mt-1.5 text-[26px] font-semibold text-forest">{item.record_ref}</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Opened {formatDate(item.opened_at || item.created_date)} · {item.assigned_name || "unassigned"}</p>
        </div>
        <div className="flex items-center gap-2"><StatusPill status={item.status} /><StatusPill status={item.priority} /></div>
      </div>

      {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="text-[14px] font-semibold text-forest">Summary</h2>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{item.summary || "No summary recorded."}</p>
            {report && (
              <div className="mt-4 rounded-lg border border-border bg-background p-3">
                <p className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">Report {report.report_number} · {report.report_type}</p>
                <p className="mt-1 text-[12.5px] leading-5 text-forest">{report.description}</p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">Reporter: {report.reporter_name} · status {report.status}</p>
              </div>
            )}
            {record && (
              <div className="mt-3 grid gap-2 text-[11.5px] sm:grid-cols-2">
                <p><span className="text-muted-foreground">Device:</span> <span className="text-forest">{[record.brand, record.model].filter(Boolean).join(" ")}</span></p>
                <p><span className="text-muted-foreground">Identifier:</span> <span className="font-mono text-forest">{record.identifier_masked}</span></p>
                <p><span className="text-muted-foreground">Record status:</span> <span className="capitalize text-forest">{record.status.replace(/_/g, " ")}</span></p>
                <p><span className="text-muted-foreground">Owner:</span> <span className="text-forest">{record.owner_name}</span></p>
              </div>
            )}
          </div>

          <div className="surface-card p-5">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-forest"><FileText className="h-4 w-4" /> Evidence</h2>
            <div className="mt-3"><EvidenceList uris={report?.evidence_uris || []} emptyLabel="No evidence attached to the report." /></div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-[14px] font-semibold text-forest">Risk assessment</h2>
            <p className="mt-1 text-[11.5px] text-muted-foreground">Rule-based signals. A score is a review prompt, never proof of wrongdoing.</p>
            <ul className="mt-3 space-y-2">
              {risks.map((risk) => (
                <li key={risk.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2"><StatusPill status={risk.level} /><span className="text-[10.5px] text-muted-foreground">score {risk.score}</span></div>
                  <p className="mt-1.5 text-[11.5px] leading-5 text-muted-foreground">{risk.explanation}</p>
                </li>
              ))}
              {risks.length === 0 && <li className="text-[12px] text-muted-foreground">No risk assessment recorded for this report.</li>}
            </ul>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="text-[14px] font-semibold text-forest">Findings</h2>
            <Textarea rows={6} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record what you verified, who you contacted, and your conclusion." className="mt-3" />
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => act("update")} disabled={Boolean(busy)} className="flex-1 bg-forest text-ivory hover:bg-forest-deep">{busy === "update" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save findings"}</Button>
              <Button size="sm" variant="outline" onClick={() => act("close")} disabled={Boolean(busy) || item.status === "closed"} className="flex-1 border-forest/25 text-forest">{busy === "close" ? "Closing…" : "Close case"}</Button>
            </div>
          </div>

          <div className="surface-card p-5 text-[11.5px] leading-5 text-muted-foreground">
            <ShieldAlert className="mb-1.5 h-4 w-4 text-warning" />
            Access to this case is limited by role and assignment, and your access is recorded. Do not copy evidence outside the permitted workflow.
          </div>
        </aside>
      </div>
    </div>
  );
}