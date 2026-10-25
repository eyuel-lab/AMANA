import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { formatETB, formatDate } from "@/lib/format";

export default function OrdersList({ role = "buyer" }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const query = role === "seller" ? { seller_id: user.id } : { buyer_id: user.id };
    base44.entities.Order.filter(query, { sort: "-created_date", limit: 50 }).then((page) => setOrders(page.items));
  }, [user.id, role]);

  if (!orders) return <LoadingBlock rows={4} />;

  const visible = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  const base = role === "seller" ? "/seller/orders/" : "/buyer/orders/";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={role === "seller" ? "Seller workspace" : "Buyer workspace"}
        title={role === "seller" ? "Seller orders" : "Your orders"}
        description={role === "seller" ? "Orders placed for your listings. Payment status is controlled by the platform, never by the buyer's browser." : "Every order with its payment and delivery status."}
      />

      <div className="flex flex-wrap gap-2">
        {["all", "pending_payment", "paid", "completed", "cancelled"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium capitalize transition-colors ${filter === value ? "border-forest bg-forest text-ivory" : "border-border bg-card text-muted-foreground hover:text-forest"}`}
          >
            {value.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Package}
          title={orders.length ? "No orders with that status" : "No orders yet"}
          description={orders.length ? "Try a different filter to see your other orders." : role === "seller" ? "Orders for your listings will appear here once a buyer checks out." : "Once you check out, your orders appear here with server-verified totals."}
          actionLabel={orders.length ? undefined : "Browse marketplace"}
          actionTo={orders.length ? undefined : "/marketplace"}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((order) => (
            <Link key={order.id} to={base + order.id} className="surface-card flex flex-col gap-3 p-5 transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[12px] text-muted-foreground">{order.order_number}</p>
                  <StatusPill status={order.status} />
                </div>
                <p className="mt-1.5 text-[14px] font-semibold text-forest">
                  {role === "seller" ? order.buyer_name : order.seller_name} · {formatETB(order.total)}
                </p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">Placed {formatDate(order.created_date)} · delivery to {order.delivery_city}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11.5px] text-muted-foreground">Payment: {order.payment_status}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}