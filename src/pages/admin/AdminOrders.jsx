import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import { formatETB, formatDate } from "@/lib/format";

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    base44.entities.Order.list({ sort: "-created_date", limit: 100 }).then((page) => setOrders(page.items));
  }, []);

  if (!orders) return <LoadingBlock rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Orders" description="All recorded orders. Payment status only changes after a server-verified provider confirmation — never from the browser." />

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders" description="No orders have been placed yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[800px] text-left text-[12.5px]">
            <thead className="bg-secondary/60 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Order</th>
                <th className="px-3 py-2.5 font-medium">Buyer</th>
                <th className="px-3 py-2.5 font-medium">Seller</th>
                <th className="px-3 py-2.5 font-medium">Total</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Payment</th>
                <th className="px-3 py-2.5 font-medium">Placed</th>
                <th className="px-3 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-3 py-3 font-mono text-[11.5px] text-forest">{order.order_number}</td>
                  <td className="px-3 py-3 text-muted-foreground">{order.buyer_name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{order.seller_name}</td>
                  <td className="px-3 py-3 text-forest">{formatETB(order.total)}</td>
                  <td className="px-3 py-3"><StatusPill status={order.status} /></td>
                  <td className="px-3 py-3 text-[11.5px] capitalize text-muted-foreground">{order.payment_status} · {order.payment_provider}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(order.created_date)}</td>
                  <td className="px-3 py-3 text-right"><Link to={"/buyer/orders/" + order.id} className="inline-flex items-center gap-1 text-forest hover:underline">Open <ArrowRight className="h-3.5 w-3.5" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}