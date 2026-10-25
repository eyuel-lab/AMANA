import { useEffect, useState } from "react";
import { Gavel } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import DecisionDialog from "@/components/staff/DecisionDialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export default function AdminDisputes() {
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = () => base44.entities.Dispute.list({ sort: "-created_date", limit: 100 }).then((page) => setItems(page.items));
  useEffect(() => { load(); }, []);

  if (!items) return <LoadingBlock rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Disputes" description="Disputes can concern ownership, listings, orders, payments or suspected fraud. Only administrators decide them." />

      {items.length === 0 ? (
        <EmptyState icon={Gavel} title="No disputes" description="No member has opened a dispute." />
      ) : (
        <div className="space-y-3">
          {items.map((dispute) => (
            <article key={dispute.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11.5px] text-muted-foreground">{dispute.reference}{dispute.order_number ? " · " + dispute.order_number : ""}</p>
                  <p className="mt-1 text-[14px] font-semibold text-forest">{dispute.subject}</p>
                  <p className="text-[11.5px] capitalize text-muted-foreground">{dispute.category} · opened by {dispute.opened_by_name} ({dispute.party_role}) · {formatDate(dispute.created_date)}</p>
                </div>
                <StatusPill status={dispute.status} />
              </div>
              <p className="mt-2 whitespace-pre-line text-[12px] leading-6 text-muted-foreground">{dispute.description}</p>
              {dispute.resolution && <p className="mt-2 text-[11.5px] text-forest">Resolution: {dispute.resolution}</p>}
              {["open", "under_review"].includes(dispute.status) && (
                <Button size="sm" className="mt-3 bg-forest text-ivory hover:bg-forest-deep" onClick={() => setSelected(dispute)}>Record decision</Button>
              )}
            </article>
          ))}
        </div>
      )}

      <DecisionDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        subject="dispute"
        id={selected?.id}
        title={"Dispute " + (selected?.reference || "")}
        onDone={load}
        actions={[{ value: "resolve", label: "Resolve" }, { value: "reject", label: "Reject" }]}
      />
    </div>
  );
}