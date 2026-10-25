import { UserCheck, ShieldCheck, ScanSearch, FileCheck2 } from "lucide-react";

const STEPS = [
  {
    icon: ScanSearch,
    step: "01",
    title: "Check the record first",
    body: "Open any listing or run a public ownership check. You see whether a record exists and whether a warning is active — never private identifiers.",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Know who you are buying from",
    body: "Seller verification is reviewed by a person. It tells you the seller's identity was examined — it is kept separate from device ownership.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Ownership is registered, not assumed",
    body: "Sellers can link a device to an ownership record. Records are verified against proof of purchase before a certificate is issued.",
  },
  {
    icon: FileCheck2,
    step: "04",
    title: "Transfer with consent",
    body: "Ownership moves through a two-party transfer reviewed before it is committed. History is preserved at every step.",
  },
];

export default function StepsSection() {
  return (
    <section className="container-page py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">How AMANA works</p>
        <h2 className="mt-2 font-display text-[30px] leading-tight text-forest sm:text-[36px]">Four checks between a listing and a handshake</h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.step} className="relative rounded-xl border border-border/80 bg-card p-5">
            <span className="font-mono text-[11px] text-gold-deep">{step.step}</span>
            <span className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-forest text-ivory">
              <step.icon className="h-4.5 w-4.5" />
            </span>
            <h3 className="mt-4 text-[14.5px] font-semibold text-forest">{step.title}</h3>
            <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}