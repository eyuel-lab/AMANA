import { Link } from "react-router-dom";
import { SlidersHorizontal, ShieldCheck, Database, Plug, ScrollText, Users } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

const SETTINGS = [
  { icon: ShieldCheck, title: "Registry rules", body: "A record is issued a certificate only after reviewer approval. Duplicate identifiers are rejected while any record is active. Transfers require two-party consent and a reviewer." },
  { icon: SlidersHorizontal, title: "Risk thresholds", body: "Low adds safeguards, medium requests review, high blocks the operation. Signals include active restrictions, implausible prices, duplicate identifiers and repeated submissions." },
  { icon: Database, title: "Data retention", body: "Ownership history and audit entries are retained to preserve decision integrity. Identity documents are private and shared only through expiring links." },
  { icon: Plug, title: "Integrations", body: "Payments, email delivery and identity verification are unconfigured. The product shows that state instead of simulating success." },
];

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Platform settings"
        description="Operational rules currently enforced by the backend. These are documented here rather than presented as editable switches that would not take effect."
        actions={<Button asChild variant="outline" className="border-forest/25 text-forest"><Link to="/admin/integrations">Integration status</Link></Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {SETTINGS.map((item) => (
          <div key={item.title} className="surface-card p-5">
            <item.icon className="h-5 w-5 text-forest" />
            <h2 className="mt-3 text-[14px] font-semibold text-forest">{item.title}</h2>
            <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/users" className="surface-card flex items-center justify-between p-5 hover:border-forest/25">
          <div className="flex items-center gap-2.5"><Users className="h-4 w-4 text-forest" /><span className="text-[13px] font-medium text-forest">Users and roles</span></div>
          <span className="text-[11.5px] text-muted-foreground">Manage</span>
        </Link>
        <Link to="/admin/audit-logs" className="surface-card flex items-center justify-between p-5 hover:border-forest/25">
          <div className="flex items-center gap-2.5"><ScrollText className="h-4 w-4 text-forest" /><span className="text-[13px] font-medium text-forest">Audit trail</span></div>
          <span className="text-[11.5px] text-muted-foreground">Review</span>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 text-[11.5px] leading-6 text-muted-foreground">
        <p className="text-[13px] font-semibold text-forest">Demonstration data</p>
        <p className="mt-1">Sample listings and records are labelled as demonstration data and can be removed without touching real member data. No testimonials, completed sales or government verification are fabricated anywhere in the app.</p>
      </div>
    </div>
  );
}