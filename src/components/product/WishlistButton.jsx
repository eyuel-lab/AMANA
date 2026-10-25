import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

export default function WishlistButton({ listingId, title = "", className }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setSaved(false);
      return undefined;
    }
    base44.entities.WishlistItem.filter({ listing_id: listingId }, { limit: 1 })
      .then(({ items }) => { if (active) setSaved(items.length > 0); })
      .catch(() => {});
    return () => { active = false; };
  }, [isAuthenticated, listingId]);

  const toggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login?returnTo=" + encodeURIComponent("/product/" + listingId));
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        const { items } = await base44.entities.WishlistItem.filter({ listing_id: listingId });
        await Promise.all(items.map((item) => base44.entities.WishlistItem.delete(item.id)));
        setSaved(false);
      } else {
        await base44.entities.WishlistItem.create({ listing_id: listingId, listing_title: title });
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-forest shadow-sm backdrop-blur transition-all hover:scale-105",
        saved && "border-gold/50 bg-gold/15 text-gold-deep",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}