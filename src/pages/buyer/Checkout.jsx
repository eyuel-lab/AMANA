import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Lock, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatETB } from "@/lib/format";
import { DELIVERY_FEE, REGIONS } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Checkout() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ delivery_name: "", delivery_phone: "", delivery_city: "Addis Ababa", delivery_notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.CartItem.list().then(({ items: rows }) => setItems(rows));
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const placeOrder = async () => {
    setBusy(true);
    setError("");
    const isFramed = window.self !== window.top;
    const checkoutTab = isFramed ? window.open("", "_blank") : null;
    if (isFramed && !checkoutTab) {
      setBusy(false);
      setError("Allow popups to continue to checkout.");
      return;
    }
    if (checkoutTab) checkoutTab.opener = null;
    try {
      const response = await base44.functions.invoke("orderCreate", {
        cart_item_ids: items.map((item) => item.id),
        delivery_name: form.delivery_name,
        delivery_phone: form.delivery_phone,
        delivery_city: form.delivery_city,
        delivery_notes: form.delivery_notes,
      });
      const url = response.data?.checkout?.url;
      if (url) {
        if (checkoutTab) checkoutTab.location.replace(url);
        else window.location.assign(url);
        return;
      }
      checkoutTab?.close();
      setResult(response.data);
    } catch (err) {
      checkoutTab?.close();
      setError(err.response?.data?.error || err.message || "Checkout could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  if (!items) return <LoadingBlock rows={3} />;

  if (result) {
    return (
      <div className="mx-auto max-w-xl space-y-5 py-10 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success"><CheckCircle2 className="h-6 w-6" /></span>
        <h1 className="text-2xl font-semibold text-forest">Order recorded</h1>
        <p className="text-[13.5px] leading-6 text-muted-foreground">{result.payment?.message}</p>
        <div className="surface-card p-4 text-left">
          {result.orders?.map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b border-border/70 py-2 text-[13px] last:border-0">
              <span className="font-mono text-forest">{order.order_number}</span>
              <span className="text-forest">{formatETB(order.total)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/buyer/orders">View my orders</Link></Button>
          <Button variant="outline" className="border-forest/25 text-forest" onClick={() => navigate("/marketplace")}>Keep shopping</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState icon={Lock} title="Nothing to check out" description="Your cart is empty, so there is no order to place." actionLabel="Browse marketplace" actionTo="/marketplace" />;
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.listing_price || 0), 0);
  const sellers = new Set(items.map((item) => item.seller_id));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Secure checkout" title="Review and place your order" description="Totals are recalculated on the server from current listing prices. Delivery details are shared only with the seller." />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="surface-card p-5">
          <h2 className="text-[14px] font-semibold text-forest">Delivery details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="d-name">Recipient name</Label><Input id="d-name" value={form.delivery_name} onChange={(event) => update("delivery_name", event.target.value)} className="mt-1.5 bg-background" /></div>
            <div><Label htmlFor="d-phone">Phone</Label><Input id="d-phone" value={form.delivery_phone} onChange={(event) => update("delivery_phone", event.target.value)} placeholder="+251 …" className="mt-1.5 bg-background" /></div>
          </div>
          <div className="mt-4">
            <Label>City / region</Label>
            <Select value={form.delivery_city} onValueChange={(value) => update("delivery_city", value)}>
              <SelectTrigger className="mt-1.5 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>{REGIONS.map((region) => <SelectItem key={region} value={region}>{region}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="mt-4"><Label htmlFor="d-notes">Notes for the seller (optional)</Label><Textarea id="d-notes" rows={3} value={form.delivery_notes} onChange={(event) => update("delivery_notes", event.target.value)} className="mt-1.5 bg-background" /></div>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-success/25 bg-success-soft/60 p-3 text-[11.5px] leading-5 text-forest">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            You will pay securely on Stripe Checkout in Ethiopian Birr (ETB). Stripe is currently in test mode — use card 4242 4242 4242 4242, any future expiry and any CVC.
          </div>

          {error && <p className="mt-4 rounded-lg border border-danger/20 bg-danger-soft p-3 text-[12.5px] text-danger">{error}</p>}

          <Button onClick={placeOrder} disabled={busy} className="mt-4 w-full bg-forest text-ivory hover:bg-forest-deep">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="mr-1.5 h-4 w-4" />} Pay securely with card
          </Button>
        </section>

        <aside className="surface-card h-fit p-5">
          <h2 className="text-[14px] font-semibold text-forest">Order summary</h2>
          <ul className="mt-3 divide-y divide-border/70">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-[12.5px]">
                <span className="min-w-0 truncate text-muted-foreground">{item.listing_title}</span>
                <span className="shrink-0 text-forest">{formatETB(item.listing_price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-border pt-3 text-[13px]">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-forest">{formatETB(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery ({sellers.size} seller{sellers.size > 1 ? "s" : ""})</dt><dd className="text-forest">{formatETB(DELIVERY_FEE * sellers.size)}</dd></div>
            <div className="flex justify-between font-semibold"><dt className="text-forest">Total</dt><dd className="text-forest">{formatETB(subtotal + DELIVERY_FEE * sellers.size)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}