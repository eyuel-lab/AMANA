import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import EvidenceList from "@/components/common/EvidenceList";
import DecisionDialog from "@/components/staff/DecisionDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";

export default function AdminVerification() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);

  const load = () => base44.entities.SellerVerification.list({ sort: "-created_date", limit: 100 }).then((page) => setItems(page.items));
  useEffect(() => { load(); }, []);

  if (!items) return <LoadingBlock rows={4} />;

  const visible = filter === "all" ? items : items.filter((item) => item.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review desk"
        title="Seller verification"
        description="Review identity and business documents. Verification is never granted automatically by an upload."
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="more_info">More information</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {visible.length === 0 ? (
        <EmptyState icon={BadgeCheck} title="Nothing in this queue" description="No verification requests match this filter." />
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <article key={item.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-forest">{item.legal_name}{item.business_name ? " · " + item.business_name : ""}</p>
                  <p className="text-[11.5px] text-muted-foreground">{item.user_email} · {item.city}, {item.region} · {item.phone}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Submitted {formatDate(item.submitted_at || item.created_date)}</p>
                </div>
                <StatusPill status={item.status} />
              </div>
              {item.review_notes && <p className="mt-2 text-[12px] text-muted-foreground">Note: {item.review_notes}</p>}
              <div className="mt-3">
                <EvidenceList uris={[item.id_document_uri, item.business_document_uri].filter(Boolean)} emptyLabel="No documents attached." />
              </div>
              {["pending", "more_info"].includes(item.status) && (
                <Button size="sm" className="mt-3 bg-forest text-ivory hover:bg-forest-deep" onClick={() => setSelected(item)}>Record decision</Button>
              )}
            </article>
          ))}
        </div>
      )}

      <DecisionDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        subject="verification"
        id={selected?.id}
        title={"Verification decision — " + (selected?.legal_name || "")}
        onDone={load}
        actions={[
          { value: "approve", label: "Approve" },
          { value: "more_info", label: "Request more info" },
          { value: "reject", label: "Reject" },
        ]}
      />
    </div>
  );
}