import PageHeader from "@/components/common/PageHeader";
import AuditLogTable from "@/components/staff/AuditLogTable";

export default function AuditorLogs() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Audit" title="Audit trail" description="Filter by actor, action or outcome. Export for review; entries cannot be edited from this console." />
      <AuditLogTable limit={300} />
    </div>
  );
}