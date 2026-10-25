import { ShieldCheck, ScanSearch, FileBadge, ArrowLeftRight, Siren, LockKeyhole } from "lucide-react";

const FEATURES = [
  {
    icon: ScanSearch,
    title: "Check before you buy",
    body: "Look up an AMANA reference and see whether an ownership record exists and whether a warning is active.",
  },
  {
    icon: ShieldCheck,
    title: "Reviewed ownership records",
    body: "Proof of purchase is examined before a record becomes verified. Evidence files stay private.",
  },
  {
    icon: FileBadge,
    title: "Digital record certificates",
    body: "Verified records receive a unique reference and certificate you can share for verification.",
  },
  {
    icon: ArrowLeftRight,
    title: "Consent-based transfers",
    body: "Both parties consent, restrictions are checked, and ownership history is preserved rather than overwritten.",
  },
  {
    icon: Siren,
    title: "Lost and stolen reporting",
    body: "File a report to restrict a record while it is reviewed — and block ordinary transfers in the meantime.",
  },
  {
    icon: LockKeyhole,
    title: "Private by design",
    body: "Full identifiers, documents and investigation notes are never published on public listing pages.",
  },
];

export default function TrustGrid() {
  return (
    <section className="border-y border-border/70 bg-card/60 py-16">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">One platform, three layers of trust</p>
          <h2 className="mt-2 font-display text-[30px] leading-tight text-forest sm:text-[36px]">
            A marketplace that can show its work
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            AMANA connects listings, ownership records and protection workflows so a device is never just a photograph and a price.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div key={feature.title} className="rounded-xl border border-border/80 bg-background p-5 transition-shadow hover:shadow-card">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-forest/8 text-forest">
                  <feature.icon className="h-4 w-4" />
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-forest">{feature.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}