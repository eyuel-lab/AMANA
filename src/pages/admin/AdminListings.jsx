import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import DecisionDialog from "@/components/staff/DecisionDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image } from "@/components/ui/image";
import { formatETB, formatDate } from "@/lib/format";

export default function AdminListings() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);

  const load = () => base44.entities.ProductListing.list({ sort: "-created_date", limit: 100 }).then((page) => setItems(page.items));
  useEffect(() => { load(); }, []);

  if (!items) return <LoadingBlock rows={4} />;

  const visible = filter === "all" ? items : items.filter((item) => item.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review desk"
        title="Listing moderation"
        description="Approve only listings that match their photos and descriptions. Risk signals are review prompts, not proof of wrongdoing."
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Live</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {visible.length === 0 ? (
        <EmptyState icon={Layers} title="No listings in this queue" description="Nothing matches the selected status." />
      ) : (
        <div className="space-y-3">
          {visible.map((listing) => (
            <article key={listing.id} className="surface-card flex flex-col gap-4 p-4 sm:flex-row">
              <Image src={(listing.images || [])[0]} alt={listing.title} className="h-24 w-full rounded-lg object-cover sm:w-32" fittingType="fill" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={listing.status} />
                  <StatusPill status={listing.risk_level} />
                  <span className="text-[11px] text-muted-foreground">{formatDate(listing.submitted_at || listing.created_date)}</span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold text-forest">{listing.title}</p>
                <p className="text-[11.5px] text-muted-foreground">{listing.seller_name} · {formatETB(listing.price)} · {listing.category} · {listing.location}</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">Record status: {listing.registry_status || "none"} · Seller verified: {listing.seller_verified ? "yes" : "no"}</p>
                {listing.moderation_notes && <p className="mt-1 text-[11.5px] text-forest">Note: {listing.moderation_notes}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.status === "pending" && <Button size="sm" className="bg-forest text-ivory hover:bg-forest-deep" onClick={() => setSelected(listing)}>Record decision</Button>}
                  {listing.status === "active" && <Button asChild size="sm" variant="outline" className="border-forest/25 text-forest"><Link to={"/product/" + listing.id}><ExternalLink className="mr-1 h-3.5 w-3.5" /> View listing</Link></Button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <DecisionDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        subject="listing"
        id={selected?.id}
        title={"Moderation — " + (selected?.title || "")}
        onDone={load}
        actions={[{ value: "approve", label: "Approve listing" }, { value: "reject", label: "Reject listing" }]}
      />
    </div>
  );
}