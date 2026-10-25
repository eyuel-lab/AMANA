import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Package, ShieldCheck, Bell, ArrowRight, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import StatusPill from "@/components/common/StatusPill";
import EmptyState from "@/components/common/EmptyState";
import LoadingBlock from "@/components/common/LoadingBlock";
import { Button } from "@/components/ui/button";
import { formatETB, fromNow } from "@/lib/format";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Order.filter({ buyer_id: user.id }, { sort: "-created_date", limit: 5 }),
      base44.entities.WishlistItem.count(),
      base44.entities.OwnershipRecord.count({ owner_id: user.id }),
      base44.entities.Notification.count({ user_id: user.id, read: false }),
      base44.entities.TheftOrLossReport.filter({ reporter_id: user.id }, { sort: "-created_date", limit: 3 }),
    ]).then(([orders, wishlist, records, unread, reports]) => {
      if (alive) setData({ orders: orders.items, wishlist, records, unread, reports: reports.items });
    }).catch(() => {});
    return () => { alive = false; };
  }, [user.id]);

  if (!data) return <LoadingBlock rows={5} />;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Buyer workspace"
        title={`Welcome back${user?.full_name ? ", " + user.full_name.split(" ")[0] : ""}`}
        description="Your orders, saved devices and ownership records in one place."
        actions={<Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/marketplace"><Plus className="mr-1.5 h-4 w-4" /> Find a device</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders" value={data.orders.length} hint="Most recent first" icon={Package} />
        <StatCard label="Saved devices" value={data.wishlist} hint="Wishlist items" icon={Heart} />
        <StatCard label="Ownership records" value={data.records} hint="Registered to you" icon={ShieldCheck} />
        <StatCard label="Unread notices" value={data.unread} hint="Updates and alerts" icon={Bell} tone={data.unread ? "warn" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-forest">Recent orders</h2>
            <Link to="/buyer/orders" className="text-[12.5px] font-medium text-forest hover:underline">View all</Link>
          </div>
          <div className="mt-4">
            {data.orders.length === 0 ? (
              <EmptyState icon={Package} title="No orders yet" description="Devices you order will appear here with their payment and delivery status." actionLabel="Browse marketplace" actionTo="/marketplace" />
            ) : (
              <ul className="divide-y divide-border/70">
                {data.orders.map((order) => (
                  <li key={order.id}>
                    <Link to={"/buyer/orders/" + order.id} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                      <div>
                        <p className="font-mono text-[12px] text-muted-foreground">{order.order_number}</p>
                        <p className="mt-0.5 text-[13.5px] font-medium text-forest">{formatETB(order.total)} · {order.seller_name}</p>
                        <p className="mt-0.5 text-[11.5px] text-muted-foreground">{fromNow(order.created_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill status={order.status} />
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-[15px] font-semibold text-forest">Protection activity</h2>
          {data.reports.length === 0 ? (
            <p className="mt-3 text-[12.5px] leading-6 text-muted-foreground">
              You have no active reports. If a registered device is lost or stolen, file a report so the record is restricted.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {data.reports.map((report) => (
                <li key={report.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11.5px] text-forest">{report.report_number}</span>
                    <StatusPill status={report.status} />
                  </div>
                  <p className="mt-1 text-[12px] capitalize text-muted-foreground">{report.report_type} · {report.item_label}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="border-forest/25 text-forest"><Link to="/protection/reports">My reports</Link></Button>
            <Button asChild size="sm" variant="ghost" className="text-forest"><Link to="/ownership-check">Public check</Link></Button>
          </div>
        </section>
      </div>
    </div>
  );
}