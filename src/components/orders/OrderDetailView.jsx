import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Package, ShieldAlert, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatETB, formatDate } from "@/lib/format";

export default function OrderDetailView({ orderId, role = "buyer" }) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [dispute, setDispute] = useState({ category: "order", subject: "", description: "" });
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const record = await base44.entities.Order.get(orderId);
      setOrder(record);
      const { items: rows } = await base44.entities.OrderItem.filter({ order_id: orderId }, { limit: 20 });
      setItems(rows);
    } catch (err) {
      setError("Order not found or you do not have access to it.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [orderId]);

  const cancel = async () => {
    setBusy(true);
    try {
      await base44.functions.invoke("orderAction", { order_id: orderId, action: "cancel", reason: "Cancelled from the " + role + " workspace." });
      setNotice("Order cancelled. Any reserved listing is available again.");
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitDispute = async () => {
    setBusy(true);
    try {
      const response = await base44.functions.invoke("disputeOpen", {
        order_id: orderId,
        category: dispute.category,
        subject: dispute.subject,
        description: dispute.description,
      });
      setDisputeOpen(false);
      setNotice("Dispute " + response.data.dispute.reference + " opened. A reviewer will examine it.");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingBlock rows={4} />;
  if (!order) return <p className="rounded-xl border border-danger/20 bg-danger-soft p-4 text-[13px] text-danger">{error}</p>;

  const base = role === "seller" ? "/seller/orders" : "/buyer/orders";

  return (
    <div className="space-y-6">
      <Link to={base} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-forest"><ChevronLeft className="h-3.5 w-3.5" /> All orders</Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Order {order.order_number}</p>
          <h1 className="mt-1.5 font-display text-[30px] text-forest">{formatETB(order.total)}</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Placed {formatDate(order.created_date)} · {role === "seller" ? order.buyer_name : order.seller_name}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}
      {error && <p className="rounded-lg border border-danger/20 bg-danger-soft p-3 text-[12.5px] text-danger">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-card p-5">
          <h2 className="text-[14px] font-semibold text-forest">Items</h2>
          <ul className="mt-3 divide-y divide-border/70">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <Image src={item.image} alt={item.title} className="h-14 w-16 rounded-md object-cover" fittingType="fill" />
                <div className="min-w-0 flex-1">
                  <Link to={"/product/" + item.listing_id} className="line-clamp-1 text-[13px] font-medium text-forest hover:underline">{item.title}</Link>
                  <p className="text-[11.5px] text-muted-foreground">Quantity {item.quantity}</p>
                </div>
                <span className="text-[13px] text-forest">{formatETB(item.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-3 text-[12.5px]">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-forest">{formatETB(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="text-forest">{formatETB(order.delivery_fee)}</dd></div>
            <div className="flex justify-between font-semibold"><dt className="text-forest">Total</dt><dd className="text-forest">{formatETB(order.total)}</dd></div>
          </dl>

          <div className="mt-5 rounded-lg border border-border bg-background p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Delivery</p>
            <p className="mt-1 text-[12.5px] text-forest">{order.delivery_name} · {order.delivery_phone}</p>
            <p className="text-[12px] text-muted-foreground">{order.delivery_city}{order.delivery_notes ? " · " + order.delivery_notes : ""}</p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="text-[13px] font-semibold text-forest">Payment</h2>
            <p className="mt-2 flex items-center gap-2 text-[12.5px] text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-warning" />
              Status: {order.payment_status}
            </p>
            <p className="mt-2 text-[11.5px] leading-5 text-muted-foreground">
              Provider: {order.payment_provider}. No payment provider is configured, so no charge was made. Payment state only changes after a verified server-side confirmation.
            </p>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-[13px] font-semibold text-forest">Activity</h2>
            <ol className="mt-3 space-y-3">
              {(order.timeline || []).slice(-6).map((entry, index) => (
                <li key={index} className="flex gap-2.5 text-[12px]">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium capitalize text-forest">{String(entry.event || "").replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-muted-foreground">{entry.note}</p>
                    <p className="text-[10.5px] text-muted-foreground">{formatDate(entry.at, "d MMM yyyy, HH:mm")}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-2">
            {order.status === "pending_payment" && (
              <Button variant="outline" onClick={cancel} disabled={busy} className="border-danger/30 text-danger hover:bg-danger-soft">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Cancel order
              </Button>
            )}
            <Button variant="outline" onClick={() => setDisputeOpen(true)} className="border-forest/25 text-forest">Open a dispute</Button>
            <Button asChild variant="ghost" className="text-muted-foreground" onClick={() => navigate(base)}><span><Package className="mr-1.5 inline h-3.5 w-3.5" /> Back to orders</span></Button>
          </div>
        </aside>
      </div>

      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open a dispute</DialogTitle>
            <DialogDescription>Describe the issue. Only you and authorised reviewers can see this.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={dispute.category} onValueChange={(value) => setDispute((current) => ({ ...current, category: value }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["order", "payment", "ownership", "listing", "fraud"].map((value) => <SelectItem key={value} value={value} className="capitalize">{value}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="subject">Subject</Label><Input id="subject" value={dispute.subject} onChange={(event) => setDispute((current) => ({ ...current, subject: event.target.value }))} className="mt-1.5" /></div>
            <div><Label htmlFor="details">What happened</Label><Textarea id="details" rows={5} value={dispute.description} onChange={(event) => setDispute((current) => ({ ...current, description: event.target.value }))} className="mt-1.5" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>Cancel</Button>
            <Button onClick={submitDispute} disabled={busy} className="bg-forest text-ivory hover:bg-forest-deep">{busy ? "Sending…" : "Submit dispute"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}