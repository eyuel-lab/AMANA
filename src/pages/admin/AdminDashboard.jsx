import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Layers, BadgeCheck, ShieldCheck, Flag, Gavel, Package, ArrowRight, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { formatDate } from "@/lib/format";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.User.list(),
      base44.entities.ProductListing.count({ status: "active" }),
      base44.entities.ProductListing.count({ status: "pending" }),
      base44.entities.SellerVerification.count({ status: "pending" }),
      base44.entities.OwnershipRecord.count({ status: "pending_review" }),
      base44.entities.OwnershipRecord.count({ status: "restricted" }),
      base44.entities.Order.count(),
      base44.entities.Dispute.count({ status: "open" }),
      base44.entities.AuditLog.list({ sort: "-created_date", limit: 8 }),
    ]).then(([users, activeListings, pendingListings, pendingVerification, pendingRecords, restricted, orders, disputes, audits]) => {
      if (alive) setData({ users: users.length, activeListings, pendingListings, pendingVerification, pendingRecords, restricted, orders, disputes, audits: audits.items });
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!data) return <LoadingBlock rows={6} />;

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Administration" title="Command centre" description="Live counts from the database. Review queues link directly to the decision workflow." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Members" value={data.users} hint="Registered accounts" icon={Users} />
        <StatCard label="Live listings" value={data.activeListings} hint={`${data.pendingListings} awaiting review`} icon={Layers} />
        <StatCard label="Verification queue" value={data.pendingVerification} hint="Seller requests pending" icon={BadgeCheck} tone={data.pendingVerification ? "warn" : "default"} />
        <StatCard label="Record reviews" value={data.pendingRecords} hint={`${data.restricted} restricted records`} icon={ShieldCheck} tone={data.pendingRecords ? "warn" : "default"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Orders" value={data.orders} hint="All recorded orders" icon={Package} />
        <StatCard label="Open disputes" value={data.disputes} hint="Awaiting a decision" icon={Gavel} tone={data.disputes ? "warn" : "default"} />
        <StatCard label="Restricted properties" value={data.restricted} hint="Blocks ordinary transfers" icon={Flag} tone={data.restricted ? "danger" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-forest">Queues</h2>
            <Link to="/admin/listings" className="text-[12px] font-medium text-forest hover:underline">Listings</Link>
          </div>
          <ul className="mt-3 space-y-2">
            {[
              { to: "/admin/verification", label: "Seller verification", count: data.pendingVerification },
              { to: "/admin/listings", label: "Listing moderation", count: data.pendingListings },
              { to: "/admin/registry", label: "Ownership record review", count: data.pendingRecords },
              { to: "/admin/disputes", label: "Open disputes", count: data.disputes },
            ].map((queue) => (
              <li key={queue.to}>
                <Link to={queue.to} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-[12.5px] hover:border-forest/25">
                  <span className="text-forest">{queue.label}</span>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">{queue.count} <ArrowRight className="h-3.5 w-3.5" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-forest">Recent audit activity</h2>
            <Link to="/admin/audit-logs" className="text-[12px] font-medium text-forest hover:underline">Full trail</Link>
          </div>
          <ul className="mt-3 divide-y divide-border/70">
            {data.audits.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <p className="font-mono text-[11px] text-forest">{entry.action}</p>
                  <p className="text-[11px] text-muted-foreground">{entry.actor_name || "System"} · {formatDate(entry.created_date, "d MMM, HH:mm")}</p>
                </div>
                <StatusPill status={entry.outcome} />
              </li>
            ))}
            {data.audits.length === 0 && <li className="py-3 text-[12px] text-muted-foreground">No activity recorded yet.</li>}
          </ul>
        </section>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-warning/25 bg-warning-soft/50 p-4 text-[11.5px] leading-5 text-forest">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        Payments, email delivery and identity verification providers are not configured in this environment. Dashboards show only data the app actually holds.
      </div>
    </div>
  );
}