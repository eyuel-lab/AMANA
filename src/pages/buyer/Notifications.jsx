import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingBlock from "@/components/common/LoadingBlock";
import { Button } from "@/components/ui/button";
import { fromNow } from "@/lib/format";

export default function Notifications() {
  const [items, setItems] = useState(null);

  const load = () => base44.entities.Notification.list({ sort: "-created_date", limit: 50 }).then((page) => setItems(page.items));

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await base44.entities.Notification.updateMany({ read: false }, { $set: { read: true } });
    load();
  };

  const markOne = async (notification) => {
    if (!notification.read) {
      await base44.entities.Notification.update(notification.id, { read: true });
      load();
    }
    if (notification.link) window.location.assign(notification.link);
  };

  if (!items) return <LoadingBlock rows={4} />;
  const unread = items.filter((item) => !item.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Updates and security alerts"
        description={unread ? `${unread} unread notification${unread === 1 ? "" : "s"}.` : "You are up to date."}
        actions={unread ? <Button variant="outline" size="sm" className="border-forest/25 text-forest" onClick={markAll}><CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read</Button> : null}
      />

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Review decisions, transfers and security alerts will appear here." />
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => markOne(item)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${item.read ? "border-border bg-card" : "border-forest/20 bg-forest/5"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-semibold text-forest">{item.title}</p>
                    <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">{item.body}</p>
                  </div>
                  <span className="shrink-0 text-[10.5px] text-muted-foreground">{fromNow(item.created_date)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{item.category}</span>
                  {item.is_security && <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">Security</span>}
                  {!item.read && <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-label="Unread" />}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11.5px] text-muted-foreground">
        Email and SMS delivery require a configured provider and are not enabled in this environment. <Link to="/contact" className="text-forest underline underline-offset-4">Contact support</Link>
      </p>
    </div>
  );
}