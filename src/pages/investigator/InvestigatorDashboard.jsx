import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderLock, Flag, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { formatDate } from "@/lib/format";

export default function InvestigatorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.InvestigationCase.list({ sort: "-created_date", limit: 20 }),
      base44.entities.TheftOrLossReport.list({ sort: "-created_date", limit: 20 }),
    ]).then(([casesPage, reportsPage]) => {
      if (!alive) return;
      const cases = casesPage.items;
      const reports = reportsPage.items;
      setData({
        cases,
        assigned: cases.filter((item) => item.assigned_to === user.id && item.status !== "closed"),
        open: cases.filter((item) => item.status !== "closed").length,
        high: cases.filter((item) => item.priority === "high" && item.status !== "closed").length,
        reports: reports.filter((item) => ["submitted", "under_review", "more_info"].includes(item.status)),
      });
    }).catch(() => {});
    return () => { alive = false; };
  }, [user.id]);

  if (!data) return <LoadingBlock rows={4} />;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Investigation"
        title="Case overview"
        description="Protection reports and confirmed cases. Access is limited to assigned investigators and administrators; every decision is logged."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open cases" value={data.open} hint="Not yet closed" icon={FolderLock} />
        <StatCard label="Assigned to me" value={data.assigned.length} hint="Your active assignments" icon={ShieldCheck} />
        <StatCard label="High priority" value={data.high} hint="Requires attention first" icon={AlertTriangle} tone={data.high ? "danger" : "default"} />
        <StatCard label="Reports to review" value={data.reports.length} hint="Submitted or awaiting information" icon={Flag} tone={data.reports.length ? "warn" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-forest">Your cases</h2>
            <Link to="/investigator/cases" className="text-[12px] font-medium text-forest hover:underline">All cases</Link>
          </div>
          {data.assigned.length === 0 ? (
            <p className="mt-3 text-[12.5px] leading-6 text-muted-foreground">No cases are assigned to you. Cases are created when a reviewer confirms a protection report.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.assigned.map((item) => (
                <li key={item.id}>
                  <Link to={"/investigator/cases/" + item.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-[12.5px] hover:border-forest/25">
                    <div>
                      <p className="font-mono text-[11px] text-muted-foreground">{item.case_number}</p>
                      <p className="text-forest">{item.record_ref} · {item.priority} priority</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-forest">Reports awaiting review</h2>
            <Link to="/investigator/reports" className="text-[12px] font-medium text-forest hover:underline">Open queue</Link>
          </div>
          {data.reports.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-muted-foreground">No reports are waiting for a decision.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border/70">
              {data.reports.slice(0, 5).map((report) => (
                <li key={report.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div>
                    <p className="font-mono text-[11px] text-muted-foreground">{report.report_number}</p>
                    <p className="text-[12.5px] capitalize text-forest">{report.report_type} · {report.item_label}</p>
                    <p className="text-[10.5px] text-muted-foreground">{formatDate(report.created_date)}</p>
                  </div>
                  <StatusPill status={report.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}