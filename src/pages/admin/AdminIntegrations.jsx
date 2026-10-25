import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plug, ShieldAlert, BarChart3, Fingerprint, Mail, Wallet, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";

const ICONS = { payments: Wallet, analytics: BarChart3, identity: Fingerprint, email: Mail };

export default function AdminIntegrations() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    base44.entities.IntegrationConfiguration.list({ sort: "created_date", limit: 20 }).then((page) => setItems(page.items));
  }, []);

  if (!items) return <LoadingBlock rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Integrations" description="What is actually connected. Anything unconfigured stays visibly unconfigured in the product." />

      {items.length === 0 ? (
        <div className="surface-card p-6">
          <Plug className="h-5 w-5 text-forest" />
          <h2 className="mt-2 text-[15px] font-semibold text-forest">No integration records yet</h2>
          <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">Add integration configuration entries to track provider status. Nothing is connected by default.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const Icon = ICONS[item.key] || Plug;
            return (
              <article key={item.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-forest/8 text-forest"><Icon className="h-4 w-4" /></span>
                    <div>
                      <h2 className="text-[14px] font-semibold text-forest">{item.label}</h2>
                      <p className="text-[11px] text-muted-foreground">{item.provider}</p>
                    </div>
                  </div>
                  <StatusPill status={item.status === "configured" ? "success" : item.status === "disabled" ? "neutral" : "warning"} text={item.status} />
                </div>
                <p className="mt-3 text-[12px] leading-6 text-muted-foreground">{item.required_setup}</p>
                {item.notes && <p className="mt-2 rounded-lg border border-border bg-background p-2.5 text-[11.5px] leading-5 text-forest">{item.notes}</p>}
              </article>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-warning/25 bg-warning-soft/50 p-4 text-[11.5px] leading-5 text-forest">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        Secrets are never stored in the app code or shown in this console. Provider credentials are configured by the workspace owner; until then payments, email delivery and identity checks remain disabled.
      </div>

      <section className="surface-card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-forest"><CheckCircle2 className="h-4 w-4 text-success" /> What is genuinely working</h2>
        <ul className="mt-2 space-y-1.5 text-[12px] leading-6 text-muted-foreground">
          <li>· In-app notifications and audit logging.</li>
          <li>· Private document storage with time-limited access links.</li>
          <li>· Server-side order totals and state transitions.</li>
          <li>· Role-based access enforced by database rules and backend functions.</li>
        </ul>
        <Button asChild size="sm" variant="outline" className="mt-4 border-forest/25 text-forest"><Link to="/admin/audit-logs">Review audit trail</Link></Button>
      </section>
    </div>
  );
}