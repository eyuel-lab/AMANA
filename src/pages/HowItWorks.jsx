import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ShieldCheck, Siren, ArrowRight } from "lucide-react";

const FLOWS = [
  {
    title: "For buyers",
    icon: ShieldCheck,
    steps: [
      "Browse listings and open the product page.",
      "Check seller verification and the ownership-record panel — they are separate signals.",
      "Run a public ownership check on the reference before paying.",
      "Add to cart and check out; orders are recalculated on the server.",
    ],
  },
  {
    title: "For sellers",
    icon: BadgeCheck,
    steps: [
      "Create an account and apply for seller verification with identity documents (stored privately).",
      "Add a listing with real photos, an honest condition and your collection location.",
      "Link an ownership record you own, then submit for review.",
      "Respond to buyer questions and manage orders from the seller workspace.",
    ],
  },
  {
    title: "For ownership",
    icon: ShieldCheck,
    steps: [
      "Register a device with its identifier and proof of purchase.",
      "A reviewer examines the evidence; approved records receive a reference and certificate.",
      "Start a transfer and name the new owner; they must accept it.",
      "A reviewer checks restrictions before ownership is changed, and history is preserved.",
    ],
  },
  {
    title: "For protection",
    icon: Siren,
    steps: [
      "Report a registered device as lost or stolen with a description and evidence.",
      "The record is restricted while the report is reviewed.",
      "Public checks and transfers show the restriction; private evidence stays private.",
      "Reviewers confirm, reject or resolve the report, and you are notified.",
    ],
  },
];

export default function HowItWorks() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">How AMANA works</p>
        <h1 className="mt-2 font-display text-[38px] leading-tight text-forest sm:text-[46px]">A marketplace with an evidence trail</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
          AMANA combines a marketplace, a private ownership registry and a protection workflow. Each layer is reviewed by a person, and each keeps its limits visible.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {FLOWS.map((flow) => (
          <section key={flow.title} className="surface-card p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-ivory"><flow.icon className="h-4 w-4" /></span>
              <h2 className="text-[17px] font-semibold text-forest">{flow.title}</h2>
            </div>
            <ol className="mt-4 space-y-3">
              {flow.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-[13px] leading-6 text-muted-foreground">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[10.5px] text-forest">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-warning/25 bg-warning-soft/50 p-6">
        <h2 className="text-[15px] font-semibold text-forest">What verification does not mean</h2>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-muted-foreground">
          <li>· Seller verification is not device verification.</li>
          <li>· An AMANA record is not a government title deed and carries no legal guarantee.</li>
          <li>· A report is an allegation until a reviewer confirms it.</li>
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="rounded-full bg-forest text-ivory hover:bg-forest-deep"><Link to="/marketplace">Browse marketplace <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
        <Button asChild variant="outline" className="rounded-full border-forest/25 text-forest"><Link to="/ownership-check">Check a reference</Link></Button>
      </div>
    </div>
  );
}