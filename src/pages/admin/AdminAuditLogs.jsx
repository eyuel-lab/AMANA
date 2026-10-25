import PageHeader from "@/components/common/PageHeader";
import AuditLogTable from "@/components/staff/AuditLogTable";

export default function AdminAuditLogs() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Audit logs" description="Security-relevant actions with actor, resource and outcome. Export is limited to administrators." />
      <AuditLogTable limit={200} />
    </div>
  );
}