import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";

export default function AuditLogTable({ limit = 150, compact = false }) {
  const [entries, setEntries] = useState(null);
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");

  useEffect(() => {
    base44.entities.AuditLog.list({ sort: "-created_date", limit }).then((page) => setEntries(page.items));
  }, [limit]);

  if (!entries) return <LoadingBlock rows={5} />;

  const filtered = entries.filter((entry) => {
    const matchOutcome = outcome === "all" || entry.outcome === outcome;
    const text = [entry.action, entry.actor_name, entry.resource_type, entry.reason, entry.resource_id].join(" ").toLowerCase();
    return matchOutcome && (!query || text.includes(query.toLowerCase()));
  });

  const exportCsv = () => {
    const header = "timestamp,actor,role,action,resource,outcome,reason\n";
    const rows = filtered.map((entry) =>
      [entry.created_date, entry.actor_name, entry.actor_role, entry.action, entry.resource_type + ":" + (entry.resource_id || ""), entry.outcome, entry.reason]
        .map((value) => `"${String(value || "").replace(/"/g, "'")}"`).join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "amana-audit-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by action, actor or resource" className="pl-9" />
          </div>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="border-forest/25 text-forest"><Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-[12px]">
          <thead className="bg-secondary/60 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-medium">When</th>
              <th className="px-3 py-2.5 font-medium">Actor</th>
              <th className="px-3 py-2.5 font-medium">Action</th>
              <th className="px-3 py-2.5 font-medium">Resource</th>
              <th className="px-3 py-2.5 font-medium">Outcome</th>
              {!compact && <th className="px-3 py-2.5 font-medium">Reason</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filtered.map((entry) => (
              <tr key={entry.id} className="align-top">
                <td className="px-3 py-2.5 text-muted-foreground">{formatDate(entry.created_date, "d MMM, HH:mm")}</td>
                <td className="px-3 py-2.5">
                  <p className="text-forest">{entry.actor_name || "System"}</p>
                  <p className="text-[10.5px] capitalize text-muted-foreground">{entry.actor_role}</p>
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-forest">{entry.action}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {entry.resource_type}
                  {entry.resource_id && <span className="block font-mono text-[10px]">{String(entry.resource_id).slice(0, 14)}</span>}
                </td>
                <td className="px-3 py-2.5"><StatusPill status={entry.outcome} /></td>
                {!compact && <td className="max-w-[220px] px-3 py-2.5 text-muted-foreground">{entry.reason || "—"}</td>}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={compact ? 5 : 6} className="px-3 py-8 text-center text-muted-foreground">No audit entries match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Audit entries are append-only for app users; only administrators can correct a record, and every correction is itself logged. This is not described as cryptographically tamper-proof.
      </p>
    </div>
  );
}