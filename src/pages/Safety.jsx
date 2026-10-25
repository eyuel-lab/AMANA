import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ShieldCheck, MapPin, HandCoins, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

const RULES = [
  { icon: ShieldCheck, title: "Check the reference in the app", body: "Do not rely on a screenshot of a certificate. Open the public ownership check yourself and read the status." },
  { icon: MapPin, title: "Meet in a safe, public place", body: "Choose a busy location in daylight. Tell someone where you are going and bring a second person for high-value devices." },
  { icon: HandCoins, title: "Pay only when the device is in your hands", body: "Inspect the device, confirm the identifier, and only then pay. Never send a deposit to hold an unverified listing." },
  { icon: MessageSquareWarning, title: "Keep the conversation in writing", body: "Save the listing link and messages. If something goes wrong, a dispute needs evidence." },
  { icon: AlertTriangle, title: "Walk away from pressure", body: "A price far below market value, a seller who refuses to meet, or a request to move the deal off-platform are all reasons to stop." },
  { icon: CheckCircle2, title: "Ask for proof of purchase", body: "A receipt or invoice with a matching identifier is the strongest evidence. A device without any record is not automatically stolen — but it is unverified." },
];

export default function Safety() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">Buyer & seller safety</p>
        <h1 className="mt-2 font-display text-[38px] leading-tight text-forest sm:text-[46px]">Practical protection, not guarantees</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
          AMANA reduces risk by making ownership status visible and reviewed. It cannot physically inspect a device or guarantee a person&apos;s intentions, so these habits still matter.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RULES.map((rule) => (
          <div key={rule.title} className="surface-card p-5">
            <rule.icon className="h-5 w-5 text-forest" />
            <h2 className="mt-3 text-[14.5px] font-semibold text-forest">{rule.title}</h2>
            <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{rule.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="text-[16px] font-semibold text-forest">If you think a listing is fraudulent</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            Report the listing from its product page. Include the listing link, what happened, and any screenshots you can describe. Reports create a tracked support reference.
          </p>
          <Button asChild size="sm" className="mt-4 bg-forest text-ivory hover:bg-forest-deep"><Link to="/contact?category=listing">Report a listing</Link></Button>
        </section>
        <section className="surface-card p-6">
          <h2 className="text-[16px] font-semibold text-forest">If your device is lost or stolen</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            File a report against the registered record. The record is restricted while it is reviewed, which blocks ordinary ownership transfers. Also report to the police — AMANA is not a law-enforcement channel.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-4 border-forest/25 text-forest"><Link to="/protection/report">File a lost or stolen report</Link></Button>
        </section>
      </div>
    </div>
  );
}