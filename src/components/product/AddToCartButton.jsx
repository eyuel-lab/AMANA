import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function AddToCartButton({ listing, className }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState("idle");

  const ownListing = listing?.seller_id && user?.id === listing.seller_id;
  const restricted = ["restricted", "reported_stolen", "reported_lost", "disputed"].includes(listing?.registry_status);
  const unavailable = listing?.status !== "active";

  const add = async () => {
    if (!isAuthenticated) {
      navigate("/login?returnTo=" + encodeURIComponent("/product/" + listing.id));
      return;
    }
    setState("busy");
    try {
      const { items } = await base44.entities.CartItem.filter({ listing_id: listing.id }, { limit: 1 });
      if (!items.length) {
        await base44.entities.CartItem.create({
          listing_id: listing.id,
          quantity: 1,
          listing_title: listing.title,
          listing_price: listing.price,
          listing_image: (listing.images || [])[0] || "",
          seller_id: listing.seller_id,
        });
      }
      setState("added");
      toast({ title: "Added to cart", description: "This device is reserved in your cart while you check out." });
    } catch (error) {
      setState("idle");
      toast({ title: "Could not add to cart", description: error.message, variant: "destructive" });
    }
  };

  if (ownListing) {
    return <Button disabled variant="outline" className={className}>This is your listing</Button>;
  }

  if (restricted) {
    return <Button disabled variant="outline" className={`border-danger/30 text-danger ${className || ""}`}>Ownership restricted — cannot purchase</Button>;
  }

  return (
    <Button
      onClick={add}
      disabled={unavailable || state === "busy" || state === "added"}
      className={`bg-forest text-ivory hover:bg-forest-deep ${className || ""}`}
    >
      {state === "busy" && <Loader2 className="h-4 w-4 animate-spin" />}
      {state === "added" && <Check className="h-4 w-4" />}
      {state === "idle" && <ShoppingCart className="h-4 w-4" />}
      {unavailable ? "Not available" : state === "added" ? "In cart" : "Add to cart"}
    </Button>
  );
}