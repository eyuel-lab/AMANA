import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, ShieldCheck, FileBadge, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeClosing() {
  return (
    <>
      <section className="container-page pb-16">
        <div className="rounded-2xl border border-forest/15 bg-card p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Three different signals</p>
            <h2 className="mt-2 font-display text-[26px] leading-tight text-forest sm:text-[30px]">We never blur these together</h2>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {[
              { icon: BadgeCheck, title: "Seller verified", body: "We reviewed the seller's identity or business documents. Nothing is implied about a specific device." },
              { icon: ShieldCheck, title: "Record exists", body: "An AMANA ownership record exists for this identifier. Its status and verification state are shown separately." },
              { icon: FileBadge, title: "Ownership verified", body: "Proof of purchase was reviewed for this record and a certificate was issued. Still not a legal title deed." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-background p-5">
                <item.icon className="h-5 w-5 text-forest" />
                <h3 className="mt-3 text-[14px] font-semibold text-forest">{item.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[12px] leading-5 text-muted-foreground">
            AMANA is a private platform, not a government registry. Certificates support verification; they do not replace legal title or a police report.
          </p>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-forest-deep px-6 py-12 text-ivory sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold"><Store className="h-3.5 w-3.5" /> For sellers</p>
              <h2 className="mt-3 font-display text-[30px] leading-tight sm:text-[36px]">Sell electronics without the suspicion tax</h2>
              <p className="mt-3 max-w-xl text-[14px] leading-7 text-ivory/70">
                Apply for seller verification, publish listings with real product photos, and link ownership records so serious buyers can check before they commit.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col lg:items-stretch">
              <Button asChild className="h-11 rounded-full bg-gold text-forest-deep hover:bg-gold-soft">
                <Link to="/seller/verification">Apply for verification <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10">
                <Link to="/how-it-works">See the seller flow</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <h2 className="max-w-2xl font-display text-[30px] leading-tight text-forest sm:text-[36px]">Start with a check, not a promise</h2>
          <p className="max-w-xl text-[14px] leading-7 text-muted-foreground">
            Look up a reference, browse listings that show their record status, and register the devices you already own.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full bg-forest px-6 text-ivory hover:bg-forest-deep"><Link to="/ownership-check">Check a record</Link></Button>
            <Button asChild variant="outline" className="rounded-full border-forest/25 text-forest"><Link to="/registry/register-property">Register a device</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}