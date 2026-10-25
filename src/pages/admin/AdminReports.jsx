import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import DecisionDialog from "@/components/staff/DecisionDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";

function actionsFor(status) {
  if (["submitted", "under_review"].includes(status)) return [
    { value: "confirm", label: "Confirm report" },
    { value: "more_info", label: "Request information" },
    { value: "reject", label: "Reject report" },
  ];
  if (status === "more_info") return [
    { value: "confirm", label: "Confirm report" },
    { value: "reject", label: "Reject report" },
  ];
  if (status === "confirmed") return [{ value: "resolve", label: "Resolve & clear restriction" }];
  return [];
}

export default function AdminReports() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("open");
  const [selected, setSelected] = useState(null);

  const load = () => base44.entities.TheftOrLossReport.list({ sort: "-created_date", limit: 100 }).then((page) => setItems(page.items));
  useEffect(() => { load(); }, []);

  if (!items) return <LoadingBlock rows={4} />;

  const openStatuses = ["submitted", "under_review", "more_info", "confirmed"];
  const visible = filter === "open" ? items.filter((item) => openStatuses.includes(item.status)) : filter === "all" ? items : items.filter((item) => item.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Protection"
        title="Lost and stolen reports"
        description="A report is an allegation until reviewed. Confirming one keeps the record restricted; resolving or rejecting clears the restriction."
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {visible.length === 0 ? (
        <EmptyState icon={Flag} title="No reports in this view" description="Nothing matches the selected status." />
      ) : (
        <div className="space-y-3">
          {visible.map((report) => (
            <article key={report.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11.5px] text-muted-foreground">{report.report_number} · {report.record_ref}</p>
                  <p className="mt-1 text-[14px] font-semibold capitalize text-forest">{report.report_type} · {report.item_label}</p>
                  <p className="text-[11.5px] text-muted-foreground">Reported by {report.reporter_name} · {formatDate(report.created_date)}</p>
                </div>
                <StatusPill status={report.status} />
              </div>
              <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-muted-foreground">{report.description}</p>
              {report.decision_notes && <p className="mt-2 text-[11.5px] text-forest">Decision: {report.decision_notes}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {actionsFor(report.status).length > 0 && <Button size="sm" className="bg-forest text-ivory hover:bg-forest-deep" onClick={() => setSelected(report)}>Record decision</Button>}
                <span className="self-center text-[11px] text-muted-foreground">Restriction {report.restriction_active ? "active" : "cleared"}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <DecisionDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        subject="report"
        id={selected?.id}
        title={"Report " + (selected?.report_number || "")}
        description="Confirming keeps the record restricted and opens a case. Resolving or rejecting clears the restriction."
        onDone={load}
        actions={selected ? actionsFor(selected.status) : []}
      />
    </div>
  );
}