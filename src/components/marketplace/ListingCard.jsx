import { Link } from "react-router-dom";
import { MapPin, BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";
import { formatETB } from "@/lib/format";
import { CONDITIONS } from "@/lib/constants";
import WishlistButton from "@/components/product/WishlistButton";

const RESTRICTED = ["restricted", "reported_stolen", "reported_lost", "disputed"];

export default function ListingCard({ listing }) {
  const restricted = RESTRICTED.includes(listing.registry_status);
  const condition = CONDITIONS.find((item) => item.value === listing.condition)?.label || listing.condition;
  const href = "/product/" + listing.id;

  return (
    <article className="group surface-card overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Link to={href} tabIndex={-1} aria-hidden="true">
          <Image
            src={(listing.images || [])[0]}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            fittingType="fill"
          />
        </Link>
        <div className="absolute right-3 top-3">
          <WishlistButton listingId={listing.id} title={listing.title} />
        </div>
        {restricted && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-danger px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-white">
            <ShieldAlert className="h-3 w-3" /> Ownership warning
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {[listing.brand, listing.model].filter(Boolean).join(" · ") || "AMANA listing"}
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground">{condition}</span>
        </div>
        <Link to={href}>
          <h3 className="mt-1.5 line-clamp-2 min-h-[42px] text-[15px] font-semibold leading-snug text-forest group-hover:underline">
            {listing.title}
          </h3>
        </Link>
        <p className="mt-2 font-display text-[21px] leading-none text-forest">{formatETB(listing.price)}</p>
        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-[11.5px]">
          <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{listing.location || "Ethiopia"}</span>
          </span>
          {listing.seller_verified ? (
            <span className="inline-flex shrink-0 items-center gap-1 font-medium text-success">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified seller
            </span>
          ) : (
            <span className="shrink-0 text-muted-foreground">Unverified seller</span>
          )}
        </div>
        {listing.is_demo && (
          <span className="mt-1 inline-block rounded-full border border-border px-2 py-0.5 text-[9.5px] uppercase tracking-wide text-muted-foreground">Demonstration data</span>
        )}
        <p className="mt-2 flex items-center gap-1 text-[11px]">
          {restricted ? (
            <span className="inline-flex items-center gap-1 font-medium text-danger"><ShieldAlert className="h-3 w-3" /> Restricted record — not safely transferable</span>
          ) : listing.registry_status === "registered" ? (
            <span className="inline-flex items-center gap-1 font-medium text-success"><ShieldCheck className="h-3 w-3" /> AMANA record on file</span>
          ) : (
            <span className="text-muted-foreground">No ownership record linked</span>
          )}
        </p>
      </div>
    </article>
  );
}