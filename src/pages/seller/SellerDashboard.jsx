import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Store, Package, BadgeCheck, ClipboardList, ArrowRight, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { myVerification } from "@/lib/profile";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { formatETB, fromNow } from "@/lib/format";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      myVerification(),
      base44.entities.ProductListing.filter({ seller_id: user.id }, { sort: "-created_date", limit: 6 }),
      base44.entities.ProductListing.count({ seller_id: user.id, status: "active" }),
      base44.entities.Order.filter({ seller_id: user.id }, { sort: "-created_date", limit: 5 }),
      base44.entities.Order.count({ seller_id: user.id }),
    ]).then(([verification, listings, active, orders, orderCount]) => {
      if (alive) setData({ verification, listings: listings.items, active, orders: orders.items, orderCount });
    }).catch(() => {});
    return () => { alive = false; };
  }, [user.id]);

  if (!data) return <LoadingBlock rows={5} />;

  const status = data.verification?.status || "not_started";

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Seller workspace"
        title="Your shop"
        description="Verification, listings and orders for your AMANA shop."
        actions={<Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/seller/listings/new"><Plus className="mr-1.5 h-4 w-4" /> New listing</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Live listings" value={data.active} hint="Visible in the marketplace" icon={Store} />
        <StatCard label="Orders" value={data.orderCount} hint="All time" icon={Package} />
        <StatCard label="Verification" value={status === "verified" ? "Verified" : status === "pending" ? "In review" : status === "not_started" ? "Not started" : status.replace("_", " ")} hint="Account-level review" icon={BadgeCheck} tone={status === "verified" ? "default" : "warn"} />
        <StatCard label="Drafts & pending" value={data.listings.filter((item) => ["draft", "pending", "rejected"].includes(item.status)).length} hint="Awaiting your action or review" icon={ClipboardList} />
      </div>

      {status !== "verified" && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/25 bg-warning-soft/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="text-[13.5px] font-semibold text-forest">Seller verification is required before listings can go live</p>
              <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">Submit identity and business details for review. Documents are stored privately.</p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0 bg-forest text-ivory hover:bg-forest-deep"><Link to="/seller/verification">Continue verification</Link></Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-forest">Recent listings</h2>
            <Link to="/seller/listings" className="text-[12.5px] font-medium text-forest hover:underline">View all</Link>
          </div>
          {data.listings.length === 0 ? (
            <p className="mt-4 text-[12.5px] leading-6 text-muted-foreground">No listings yet. Create a draft, add photos, and submit it for review.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border/70">
              {data.listings.map((listing) => (
                <li key={listing.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-forest">{listing.title}</p>
                    <p className="text-[11.5px] text-muted-foreground">{formatETB(listing.price)} · updated {fromNow(listing.updated_date)}</p>
                  </div>
                  <StatusPill status={listing.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-forest">Recent orders</h2>
            <Link to="/seller/orders" className="text-[12.5px] font-medium text-forest hover:underline">View all</Link>
          </div>
          {data.orders.length === 0 ? (
            <p className="mt-4 text-[12.5px] leading-6 text-muted-foreground">No orders yet. Buyers see your live listings in the marketplace.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {data.orders.map((order) => (
                <li key={order.id}>
                  <Link to={"/seller/orders/" + order.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-3 hover:border-forest/25">
                    <div>
                      <p className="font-mono text-[11px] text-muted-foreground">{order.order_number}</p>
                      <p className="text-[12.5px] text-forest">{order.buyer_name} · {formatETB(order.total)}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}