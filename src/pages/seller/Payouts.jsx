import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, AlertTriangle, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { formatETB } from "@/lib/format";

export default function Payouts() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    base44.entities.Order.filter({ seller_id: user.id }, { sort: "-created_date", limit: 50 }).then((page) => setOrders(page.items));
  }, [user.id]);

  if (!orders) return <LoadingBlock rows={3} />;

  const paid = orders.filter((order) => order.payment_status === "paid");
  const pending = orders.filter((order) => order.payment_status !== "paid");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Selling" title="Payouts" description="Payouts require a configured and verified payment provider. Nothing here is simulated." />

      <div className="flex flex-col gap-4 rounded-xl border border-warning/25 bg-warning-soft/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
          <div>
            <p className="text-[13.5px] font-semibold text-forest">Payment provider not configured</p>
            <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
              No payment or payout provider is connected in this environment. AMANA cannot collect or pay out money, and no payout has been fabricated.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 border-forest/25 text-forest"><Link to="/admin/integrations">Integration status</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5"><p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Paid balance</p><p className="mt-2 font-display text-[26px] text-forest">{formatETB(paid.reduce((sum, order) => sum + Number(order.total || 0), 0))}</p></div>
        <div className="surface-card p-5"><p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Awaiting payment</p><p className="mt-2 font-display text-[26px] text-forest">{formatETB(pending.reduce((sum, order) => sum + Number(order.total || 0), 0))}</p></div>
        <div className="surface-card p-5"><p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Payout status</p><p className="mt-2 inline-flex items-center gap-2 text-[13px] font-medium text-warning"><Wallet className="h-4 w-4" /> Unavailable</p></div>
      </div>

      <section className="surface-card p-5">
        <h2 className="text-[14px] font-semibold text-forest">Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-muted-foreground">No orders recorded yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/70">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-mono text-[11.5px] text-muted-foreground">{order.order_number}</p>
                  <p className="text-[12.5px] text-forest">{order.buyer_name} · {formatETB(order.total)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><CreditCard className="h-3.5 w-3.5" /> {order.payment_status}</span>
                  <StatusPill status={order.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface-card p-5 text-[12px] leading-6 text-muted-foreground">
        <h2 className="text-[14px] font-semibold text-forest">What is required before payouts can go live</h2>
        <ul className="mt-2 space-y-1.5">
          <li>· A supported payment provider onboarded for the business entity in Ethiopia.</li>
          <li>· Server-side payment verification with webhook signature checks and replay protection.</li>
          <li>· A settlement account and documented payout schedule.</li>
          <li>· Reconciliation rules for refunds, disputes and cancelled orders.</li>
        </ul>
      </section>
    </div>
  );
}