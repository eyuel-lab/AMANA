import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, BadgeCheck, ShieldAlert, ShieldCheck, Flag, Truck, ChevronLeft, PackageX } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { formatETB, fromNow } from "@/lib/format";
import { CONDITIONS } from "@/lib/constants";
import StatusPill from "@/components/common/StatusPill";
import AddToCartButton from "@/components/product/AddToCartButton";
import WishlistButton from "@/components/product/WishlistButton";
import ListingCard from "@/components/marketplace/ListingCard";

const RESTRICTED = ["restricted", "reported_stolen", "reported_lost", "disputed"];

export default function ProductDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    base44.entities.ProductListing.get(id)
      .then(async (record) => {
        if (!alive) return;
        setListing(record);
        if (record?.status === "active") {
          const page = await base44.entities.ProductListing.filter(
            { status: "active", category: record.category },
            { sort: "-created_date", limit: 4 }
          );
          if (alive) setSimilar(page.items.filter((item) => item.id !== id).slice(0, 3));
        }
      })
      .catch(() => { if (alive) setListing(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  useEffect(() => { setActive(0); }, [id]);

  if (loading) {
    return (
      <div className="container-page grid gap-8 py-12 lg:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-secondary" />
        <div className="space-y-4">
          <div className="h-6 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="h-10 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="h-24 animate-pulse rounded bg-secondary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <PackageX className="h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-semibold text-forest">This listing is not available</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          It may have been paused, sold, or is awaiting review. Browse the marketplace for available devices.
        </p>
        <Button asChild className="mt-6"><Link to="/marketplace">Back to marketplace</Link></Button>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [""];
  const restricted = RESTRICTED.includes(listing.registry_status);
  const condition = CONDITIONS.find((item) => item.value === listing.condition)?.label || listing.condition;

  return (
    <div className="container-page py-8 lg:py-12">
      <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-forest">
        <ChevronLeft className="h-3.5 w-3.5" /> Back to marketplace
      </Link>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="surface-card overflow-hidden">
            <Image src={images[active]} alt={listing.title} className="aspect-[4/3] w-full object-cover" fittingType="fill" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {images.map((image, index) => (
                <button
                  key={image + index}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`overflow-hidden rounded-lg border-2 transition-colors ${index === active ? "border-forest" : "border-transparent opacity-70 hover:opacity-100"}`}
                  aria-label={"View image " + (index + 1)}
                >
                  <Image src={image} alt="" className="h-16 w-20 object-cover" fittingType="fill" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {[listing.brand, listing.model].filter(Boolean).join(" · ") || "Electronics"}
              </p>
              <h1 className="mt-2 text-[26px] font-semibold leading-tight text-forest sm:text-[30px]">{listing.title}</h1>
              {listing.is_demo && <p className="mt-1.5 inline-block rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Demonstration listing</p>}
            </div>
            <WishlistButton listingId={listing.id} title={listing.title} className="border-border bg-card" />
          </div>

          <p className="mt-4 font-display text-[34px] leading-none text-forest">{formatETB(listing.price)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {listing.location || "Ethiopia"}</span>
            <span>{condition}</span>
            <span>Listed {fromNow(listing.published_at || listing.created_date)}</span>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">Ownership record</p>
                <p className="mt-1 text-[14px] font-semibold text-forest">
                  {restricted ? "Warning active on linked record" : listing.registry_status === "registered" ? "AMANA record on file" : "No record linked to this listing"}
                </p>
              </div>
              {restricted ? <ShieldAlert className="h-5 w-5 text-danger" /> : <ShieldCheck className={`h-5 w-5 ${listing.registry_status === "registered" ? "text-success" : "text-muted-foreground"}`} />}
            </div>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
              {restricted
                ? "This device is linked to a record with an active restriction. Do not complete a transfer until AMANA clears it."
                : listing.registry_status === "registered"
                  ? "Proof of purchase was reviewed for this identifier. Check the reference on the public ownership page before paying."
                  : "The seller has not linked an ownership record. Ask for proof of purchase and use the public check before paying."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="border-border text-forest">
                <Link to="/ownership-check">Run a public check</Link>
              </Button>
              {listing.registry_record_id && (
                <Button asChild size="sm" variant="ghost" className="text-forest">
                  <Link to={"/registry/property/" + listing.registry_record_id}>View record</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <AddToCartButton listing={listing} className="h-11 flex-1 rounded-full" />
            <Button asChild variant="outline" className="h-11 rounded-full border-border text-forest">
              <Link to={"/contact?ref=" + encodeURIComponent(listing.id) + "&category=listing"}><Flag className="mr-1.5 h-3.5 w-3.5" /> Report listing</Link>
            </Button>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-forest">{listing.seller_name || "AMANA seller"}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {listing.seller_verified ? "Identity reviewed by AMANA. Seller verification does not verify this device." : "Seller is not verification-approved. Proceed carefully."}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4 text-[12.5px] text-muted-foreground">
            <p className="flex items-center gap-2 text-forest"><Truck className="h-4 w-4" /> Collection in {listing.location || "Ethiopia"} · delivery arranged with the seller</p>
            <p>Never send a deposit before you have seen the device and checked its ownership reference.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-[15px] font-semibold text-forest">Description</h2>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-7 text-muted-foreground">{listing.description || "No description supplied."}</p>
        </section>
        <section>
          <h2 className="text-[15px] font-semibold text-forest">Specifications</h2>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-7 text-muted-foreground">{listing.specifications || "No specifications supplied."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill status={listing.condition} text={condition} />
            <StatusPill status={listing.status} />
          </div>
        </section>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-[24px] text-forest">Similar listings</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => <ListingCard key={item.id} listing={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}