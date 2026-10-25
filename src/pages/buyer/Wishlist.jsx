import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingBlock from "@/components/common/LoadingBlock";
import ListingCard from "@/components/marketplace/ListingCard";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const [state, setState] = useState({ loading: true, saved: [], listings: [] });

  const load = async () => {
    setState((current) => ({ ...current, loading: true }));
    const { items: saved } = await base44.entities.WishlistItem.list();
    let listings = [];
    if (saved.length) {
      const page = await base44.entities.ProductListing.filter({ id: { $in: saved.map((item) => item.listing_id) }, status: "active" }, { limit: 50 });
      listings = page.items;
    }
    setState({ loading: false, saved, listings });
  };

  useEffect(() => { load(); }, []);

  const remove = async (item) => {
    await base44.entities.WishlistItem.delete(item.id);
    load();
  };

  if (state.loading) return <LoadingBlock rows={4} />;

  const availableIds = new Set(state.listings.map((listing) => listing.id));
  const unavailable = state.saved.filter((item) => !availableIds.has(item.listing_id));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Saved" title="Wishlist" description="Devices you are watching. Availability is checked each time you open this page." />

      {state.saved.length === 0 ? (
        <EmptyState icon={Heart} title="Nothing saved yet" description="Use the heart on any listing to keep it here while you decide." actionLabel="Browse marketplace" actionTo="/marketplace" />
      ) : (
        <>
          {state.listings.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {state.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}

          {unavailable.length > 0 && (
            <section className="surface-card p-5">
              <h2 className="text-[14px] font-semibold text-forest">No longer available</h2>
              <ul className="mt-3 divide-y divide-border/70">
                {unavailable.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-[13px] text-forest">{item.listing_title || "Saved device"}</p>
                      <p className="text-[11.5px] text-muted-foreground">Sold, paused or under review</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => remove(item)}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex justify-end">
            <Button asChild variant="outline" className="border-forest/25 text-forest"><Link to="/marketplace">Continue browsing</Link></Button>
          </div>
        </>
      )}
    </div>
  );
}