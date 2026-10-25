import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingBlock from "@/components/common/LoadingBlock";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { formatETB } from "@/lib/format";
import { DELIVERY_FEE } from "@/lib/constants";

export default function Cart() {
  const [items, setItems] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const { items: rows } = await base44.entities.CartItem.list();
    setItems(rows);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await base44.entities.CartItem.delete(id);
    load();
  };

  if (!items) return <LoadingBlock rows={3} />;

  const subtotal = items.reduce((sum, item) => sum + Number(item.listing_price || 0), 0);
  const sellers = new Set(items.map((item) => item.seller_id));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Checkout" title="Your cart" description="Devices are reserved while they sit in your cart. Totals are recalculated on the server when you place the order." />

      {items.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Your cart is empty" description="Add a device from the marketplace to start an order." actionLabel="Browse marketplace" actionTo="/marketplace" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="surface-card divide-y divide-border/70">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4">
                <Link to={"/product/" + item.listing_id} className="shrink-0">
                  <Image src={item.listing_image} alt={item.listing_title} className="h-20 w-24 rounded-lg object-cover" fittingType="fill" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={"/product/" + item.listing_id} className="text-[14px] font-semibold text-forest hover:underline">{item.listing_title}</Link>
                  <p className="mt-1 text-[12px] text-muted-foreground">Quantity 1 · single device</p>
                  <p className="mt-2 font-display text-[18px] text-forest">{formatETB(item.listing_price)}</p>
                </div>
                <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => remove(item.id)} aria-label="Remove from cart">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </section>

          <aside className="surface-card h-fit p-5">
            <h2 className="text-[14px] font-semibold text-forest">Order summary</h2>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between"><dt className="text-muted-foreground">Items ({items.length})</dt><dd className="text-forest">{formatETB(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Delivery (per seller)</dt><dd className="text-forest">{formatETB(DELIVERY_FEE * sellers.size)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2.5 font-semibold"><dt className="text-forest">Estimated total</dt><dd className="text-forest">{formatETB(subtotal + DELIVERY_FEE * sellers.size)}</dd></div>
            </dl>
            {sellers.size > 1 && <p className="mt-3 text-[11.5px] leading-5 text-muted-foreground">Your cart contains items from {sellers.size} sellers. Checkout creates one order per seller.</p>}
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-soft/60 p-3 text-[11.5px] leading-5 text-forest">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              Online payment is not configured in this environment. Placing an order records it as pending payment — no money is taken.
            </div>
            <Button className="mt-4 w-full bg-forest text-ivory hover:bg-forest-deep" onClick={() => navigate("/buyer/checkout")}>Continue to checkout</Button>
            <Button asChild variant="ghost" className="mt-1.5 w-full text-muted-foreground"><Link to="/marketplace">Keep browsing</Link></Button>
          </aside>
        </div>
      )}
    </div>
  );
}