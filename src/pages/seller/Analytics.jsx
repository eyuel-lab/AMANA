import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Eye, ShieldAlert, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import LoadingBlock from "@/components/common/LoadingBlock";
import { Button } from "@/components/ui/button";
import { formatETB } from "@/lib/format";
import { LISTING_STATUS_LABEL } from "@/lib/constants";

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.ProductListing.filter({ seller_id: user.id }, { limit: 100 }),
      base44.entities.Order.filter({ seller_id: user.id }, { limit: 100 }),
    ]).then(([listingsPage, ordersPage]) => {
      if (!alive) return;
      const listings = listingsPage.items;
      const orders = ordersPage.items;
      const byStatus = listings.reduce((acc, listing) => {
        acc[listing.status] = (acc[listing.status] || 0) + 1;
        return acc;
      }, {});
      setData({
        listings,
        orders,
        byStatus,
        views: listings.reduce((sum, listing) => sum + Number(listing.views || 0), 0),
        flagged: listings.filter((listing) => listing.risk_level !== "low").length,
        pendingValue: orders.filter((order) => order.payment_status !== "paid").reduce((sum, order) => sum + Number(order.total || 0), 0),
        paidValue: orders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total || 0), 0),
      });
    }).catch(() => {});
    return () => { alive = false; };
  }, [user.id]);

  if (!data) return <LoadingBlock rows={4} />;

  const maxCount = Math.max(1, ...Object.values(data.byStatus));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Selling" title="Listing analytics" description="Real counts from your listings and orders. No estimated reach or invented traffic." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Listings" value={data.listings.length} hint="All statuses" icon={BarChart3} />
        <StatCard label="Recorded views" value={data.views} hint="Stored view counter" icon={Eye} />
        <StatCard label="Flagged for review" value={data.flagged} hint="Medium or high risk signal" icon={ShieldAlert} tone={data.flagged ? "warn" : "default"} />
        <StatCard label="Confirmed revenue" value={formatETB(data.paidValue)} hint={data.paidValue ? "Paid orders" : "No paid orders — provider unconfigured"} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="text-[14px] font-semibold text-forest">Listings by status</h2>
          <ul className="mt-4 space-y-3">
            {Object.keys(LISTING_STATUS_LABEL).map((status) => (
              <li key={status}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{LISTING_STATUS_LABEL[status]}</span>
                  <span className="font-medium text-forest">{data.byStatus[status] || 0}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-forest" style={{ width: ((data.byStatus[status] || 0) / maxCount) * 100 + "%" }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-[14px] font-semibold text-forest">Orders awaiting payment</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">Value of orders that are not marked paid. Payment confirmation is server-side only.</p>
          <p className="mt-4 font-display text-[30px] text-forest">{formatETB(data.pendingValue)}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">{data.orders.length} order{data.orders.length === 1 ? "" : "s"} recorded</p>
          <Button asChild size="sm" variant="outline" className="mt-4 border-forest/25 text-forest"><Link to="/seller/orders">Review orders</Link></Button>
          <p className="mt-4 border-t border-border pt-3 text-[11.5px] leading-5 text-muted-foreground">
            Views are only counted where a listing records them. This environment does not run a third-party analytics provider.
          </p>
        </section>
      </div>
    </div>
  );
}