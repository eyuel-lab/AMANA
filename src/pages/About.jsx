import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">About AMANA</p>
        <h1 className="mt-2 font-display text-[38px] leading-tight text-forest sm:text-[46px]">Ownership records for a market that runs on trust</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
          Buying a used phone in Ethiopia often means relying on a seller&apos;s word. AMANA adds a traceable layer: reviewed ownership records, consent-based transfers, and a protection workflow when something goes wrong. It is built in Addis Ababa, priced in birr, and designed for real connectivity.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          { title: "Evidence over assertion", body: "A record exists because a reviewer examined proof of purchase — not because someone clicked verified." },
          { title: "Privacy as a feature", body: "Full identifiers, documents and case notes stay private. Public checks return the minimum needed to decide." },
          { title: "Reversible decisions", body: "Reports restrict rather than accuse. Disputes and correction paths exist because mistakes happen." },
        ].map((item) => (
          <div key={item.title} className="surface-card p-6">
            <h2 className="text-[15px] font-semibold text-forest">{item.title}</h2>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[16px] font-semibold text-forest">What AMANA is not</h2>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-muted-foreground">
          <li>· Not an official government registry, and certificates have no legal status as title.</li>
          <li>· Not a device-tracking service — the platform does not locate phones.</li>
          <li>· Not a bank or payment provider; payments are only accepted through a configured, verified provider.</li>
          <li>· Not a law-enforcement body; investigations support authorised review, they do not replace police process.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm" className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/how-it-works">How it works</Link></Button>
          <Button asChild size="sm" variant="outline" className="border-forest/25 text-forest"><Link to="/contact">Talk to support</Link></Button>
        </div>
      </div>
    </div>
  );
}