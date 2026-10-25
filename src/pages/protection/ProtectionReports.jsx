import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Siren, ArrowRight, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export default function ProtectionReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState(null);

  useEffect(() => {
    base44.entities.TheftOrLossReport.filter({ reporter_id: user.id }, { sort: "-created_date", limit: 50 })
      .then((page) => setReports(page.items));
  }, [user.id]);

  if (!reports) return <LoadingBlock rows={3} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Protection"
        title="My reports"
        description="Lost and stolen reports you filed, with their review status."
        actions={<Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/protection/report">File a report</Link></Button>}
      />

      {reports.length === 0 ? (
        <EmptyState icon={Siren} title="No reports filed" description="If a registered device is lost or stolen, file a report so the record is restricted while it is reviewed." actionLabel="File a report" actionTo="/protection/report" />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link key={report.id} to={"/protection/report/" + report.id} className="surface-card flex flex-col gap-2 p-5 transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-muted-foreground">{report.report_number}</span>
                  <StatusPill status={report.status} />
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{report.report_type}</span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold text-forest">{report.item_label} · {report.record_ref}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">Filed {formatDate(report.created_date)} · restriction {report.restriction_active ? "active" : "cleared"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4 text-[12px] leading-5 text-muted-foreground">
        <ShieldCheck className="mb-1.5 h-4 w-4 text-forest" />
        Reports are allegations until a reviewer confirms them. Private evidence and reviewer notes are never shown publicly.
      </div>
    </div>
  );
}