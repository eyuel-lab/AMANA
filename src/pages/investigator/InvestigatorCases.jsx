import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderLock, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";

export default function InvestigatorCases() {
  const [cases, setCases] = useState(null);
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    base44.entities.InvestigationCase.list({ sort: "-created_date", limit: 100 }).then((page) => setCases(page.items));
  }, []);

  if (!cases) return <LoadingBlock rows={4} />;

  const visible = filter === "open" ? cases.filter((item) => item.status !== "closed") : filter === "all" ? cases : cases.filter((item) => item.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Investigation"
        title="Cases"
        description="Case material is restricted to assigned investigators and administrators."
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_review">In review</SelectItem>
              <SelectItem value="awaiting_info">Awaiting info</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {visible.length === 0 ? (
        <EmptyState icon={FolderLock} title="No cases" description="Cases appear when a reviewer confirms a lost or stolen report." />
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <Link key={item.id} to={"/investigator/cases/" + item.id} className="surface-card flex flex-col gap-2 p-5 transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11.5px] text-muted-foreground">{item.case_number}</span>
                  <StatusPill status={item.status} />
                  <StatusPill status={item.priority} />
                </div>
                <p className="mt-1.5 text-[14px] font-semibold text-forest">{item.record_ref} · {item.summary}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">Opened {formatDate(item.opened_at || item.created_date)}{item.assigned_name ? " · assigned to " + item.assigned_name : " · unassigned"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}