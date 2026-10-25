import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";

export default function AdminRegistry() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("pending_review");

  useEffect(() => {
    base44.entities.OwnershipRecord.list({ sort: "-created_date", limit: 100 }).then((page) => setItems(page.items));
  }, []);

  if (!items) return <LoadingBlock rows={4} />;

  const visible = filter === "all" ? items : items.filter((item) => item.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry operations"
        title="Ownership records"
        description="Review requests, restrictions and transferred records. Decisions are recorded with your account and a reason."
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending_review">Pending review</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="transfer_pending">Transfer pending</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="reported_stolen">Reported stolen</SelectItem>
              <SelectItem value="reported_lost">Reported lost</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {visible.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nothing in this queue" description="No ownership records match the selected status." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-[12.5px]">
            <thead className="bg-secondary/60 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Reference</th>
                <th className="px-3 py-2.5 font-medium">Device</th>
                <th className="px-3 py-2.5 font-medium">Owner</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Created</th>
                <th className="px-3 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {visible.map((record) => (
                <tr key={record.id}>
                  <td className="px-3 py-3 font-mono text-[11.5px] text-forest">{record.public_ref}</td>
                  <td className="px-3 py-3 text-forest">{[record.brand, record.model].filter(Boolean).join(" ")}<span className="block text-[10.5px] text-muted-foreground">{record.category} · {record.identifier_masked}</span></td>
                  <td className="px-3 py-3 text-muted-foreground">{record.owner_name}</td>
                  <td className="px-3 py-3"><StatusPill status={record.status} /></td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(record.created_date)}</td>
                  <td className="px-3 py-3 text-right"><Link to={"/registry/property/" + record.id} className="inline-flex items-center gap-1 text-forest hover:underline">Open <ArrowRight className="h-3.5 w-3.5" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}