import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import EvidenceList from "@/components/common/EvidenceList";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export default function ProtectionReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.TheftOrLossReport.get(id).then(setReport).catch(() => setReport(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBlock rows={3} />;
  if (!report) return <p className="text-[13px] text-muted-foreground">Report not found, or you do not have access to it.</p>;

  return (
    <div className="space-y-6">
      <Link to="/protection/reports" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-forest"><ChevronLeft className="h-3.5 w-3.5" /> My reports</Link>

      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Report {report.report_number}</p>
          <h1 className="mt-1.5 text-[26px] font-semibold text-forest">{report.item_label}</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Record {report.record_ref} · filed {formatDate(report.created_date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">{report.report_type}</span>
          <StatusPill status={report.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-card p-5">
          <h2 className="text-[14px] font-semibold text-forest">What you reported</h2>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-7 text-muted-foreground">{report.description}</p>
          <div className="mt-5">
            <h3 className="text-[12.5px] font-semibold text-forest">Evidence</h3>
            <div className="mt-2"><EvidenceList uris={report.evidence_uris} emptyLabel="No evidence attached." /></div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className={`surface-card p-5 ${report.restriction_active ? "border-danger/25" : ""}`}>
            <div className="flex items-center gap-2">
              {report.restriction_active ? <ShieldAlert className="h-4 w-4 text-danger" /> : <ShieldCheck className="h-4 w-4 text-success" />}
              <h2 className="text-[14px] font-semibold text-forest">{report.restriction_active ? "Record restricted" : "Restriction cleared"}</h2>
            </div>
            <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
              {report.restriction_active
                ? "Public checks show an active warning and ordinary ownership transfers are blocked while the report is reviewed."
                : "This report is closed. The record is no longer restricted by this report."}
            </p>
            {report.decision_notes && (
              <div className="mt-3 rounded-lg border border-border bg-background p-3">
                <p className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">Reviewer note</p>
                <p className="mt-1 text-[12px] leading-5 text-forest">{report.decision_notes}</p>
              </div>
            )}
          </div>

          <div className="surface-card p-5 text-[12px] leading-6 text-muted-foreground">
            <p>A report is an allegation until reviewed. If it is rejected, the restriction is removed and you are notified with the reason.</p>
            <Button asChild size="sm" variant="outline" className="mt-3 border-forest/25 text-forest"><Link to={"/registry/property/" + report.record_id}>Open ownership record</Link></Button>
          </div>
        </aside>
      </div>
    </div>
  );
}