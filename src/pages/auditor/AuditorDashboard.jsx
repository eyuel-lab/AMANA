import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollText, ShieldAlert, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import LoadingBlock from "@/components/common/LoadingBlock";
import AuditLogTable from "@/components/staff/AuditLogTable";
import { Button } from "@/components/ui/button";

export default function AuditorDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    base44.entities.AuditLog.list({ sort: "-created_date", limit: 200 }).then((page) => {
      const entries = page.items;
      setStats({
        total: entries.length,
        denied: entries.filter((entry) => entry.outcome === "denied").length,
        failed: entries.filter((entry) => entry.outcome === "failed").length,
        recent: entries.slice(0, 5),
      });
    });
  }, []);

  if (!stats) return <LoadingBlock rows={4} />;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Audit"
        title="Audit overview"
        description="Read-only visibility of security-relevant actions. Auditors cannot alter the records they review."
        actions={<Button asChild variant="outline" className="border-forest/25 text-forest"><Link to="/auditor/logs">Open full trail</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Entries sampled" value={stats.total} hint="Most recent 200" icon={ScrollText} />
        <StatCard label="Denied actions" value={stats.denied} hint="Authorisation refusals" icon={ShieldAlert} tone={stats.denied ? "warn" : "default"} />
        <StatCard label="Failures" value={stats.failed} hint="Operations that errored" icon={CheckCircle2} tone={stats.failed ? "danger" : "default"} />
      </div>

      <section>
        <h2 className="mb-3 text-[15px] font-semibold text-forest">Latest activity</h2>
        <AuditLogTable limit={20} compact />
      </section>

      <div className="rounded-xl border border-border bg-card p-4 text-[11.5px] leading-5 text-muted-foreground">
        Audit entries are append-only for app users. Administrators can correct a record, and each correction is itself logged. This log is not described as cryptographically tamper-proof.
      </div>
    </div>
  );
}