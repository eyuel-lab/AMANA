import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Send, Pause, Play, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { formatETB, fromNow } from "@/lib/format";

export default function SellerListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => base44.entities.ProductListing.filter({ seller_id: user.id }, { sort: "-created_date", limit: 50 }).then((page) => setListings(page.items));
  useEffect(() => { load(); }, [user.id]);

  const act = async (listing, action) => {
    setBusyId(listing.id);
    setNotice("");
    try {
      if (action === "submit") {
        await base44.functions.invoke("listingSubmit", { listing_id: listing.id });
        setNotice("Submitted for review.");
      } else {
        await base44.functions.invoke("listingAction", { listing_id: listing.id, action });
        setNotice(action === "delete" ? "Listing removed." : "Listing " + action + "d.");
      }
      await load();
    } catch (err) {
      setNotice(err.response?.data?.error || err.message);
    } finally {
      setBusyId("");
    }
  };

  if (!listings) return <LoadingBlock rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Selling"
        title="Listings"
        description="Draft, submit, pause and reactivate. Live listings must be paused before editing, so a reviewed listing cannot change silently."
        actions={<Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/seller/listings/new"><Plus className="mr-1.5 h-4 w-4" /> New listing</Link></Button>}
      />

      {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}

      {listings.length === 0 ? (
        <EmptyState icon={Plus} title="No listings yet" description="Create your first listing with real photos and an honest condition. You need approved seller verification to submit." actionLabel="Create listing" actionTo="/seller/listings/new" />
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const busy = busyId === listing.id;
            const editable = ["draft", "rejected", "paused"].includes(listing.status);
            const submittable = ["draft", "rejected", "paused"].includes(listing.status);
            return (
              <div key={listing.id} className="surface-card flex flex-col gap-4 p-4 sm:flex-row">
                <Image src={(listing.images || [])[0]} alt={listing.title} className="h-24 w-full rounded-lg object-cover sm:w-32" fittingType="fill" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={listing.status} />
                    <StatusPill status={listing.risk_level} />
                    <span className="text-[11px] text-muted-foreground">Updated {fromNow(listing.updated_date)}</span>
                  </div>
                  <p className="mt-1.5 text-[14px] font-semibold text-forest">{listing.title}</p>
                  <p className="text-[12px] text-muted-foreground">{formatETB(listing.price)} · {listing.location} · {listing.condition}</p>
                  {listing.moderation_notes && <p className="mt-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-[11.5px] text-forest">Reviewer: {listing.moderation_notes}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editable && <Button asChild size="sm" variant="outline" className="border-forest/25 text-forest"><Link to={"/seller/listings/" + listing.id + "/edit"}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Link></Button>}
                    {submittable && <Button size="sm" onClick={() => act(listing, "submit")} disabled={busy} className="bg-forest text-ivory hover:bg-forest-deep">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />} Submit for review</Button>}
                    {listing.status === "active" && <Button size="sm" variant="outline" className="border-forest/25 text-forest" onClick={() => act(listing, "pause")} disabled={busy}><Pause className="mr-1 h-3.5 w-3.5" /> Pause</Button>}
                    {listing.status === "paused" && <Button size="sm" variant="outline" className="border-forest/25 text-forest" onClick={() => act(listing, "reactivate")} disabled={busy}><Play className="mr-1 h-3.5 w-3.5" /> Resubmit</Button>}
                    {listing.status === "active" && <Button asChild size="sm" variant="ghost" className="text-forest"><Link to={"/product/" + listing.id}><ExternalLink className="mr-1 h-3.5 w-3.5" /> Preview</Link></Button>}
                    {["draft", "rejected"].includes(listing.status) && <Button size="sm" variant="ghost" className="text-danger" onClick={() => act(listing, "delete")} disabled={busy}><Trash2 className="mr-1 h-3.5 w-3.5" /> Remove</Button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}