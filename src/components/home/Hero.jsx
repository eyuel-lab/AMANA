import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, BadgeCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

const DEVICE = "https://media.base44.com/images/public/6adb71c5c87bd873c4e5434b/e9554596e_generated_image.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 -top-32 h-[460px] w-[460px] rounded-full bg-gold/12 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[320px] w-[320px] rounded-full bg-forest/8 blur-3xl" />
      <div className="container-page relative grid items-center gap-14 pb-16 pt-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Ethiopia&apos;s ownership-first marketplace
          </p>
          <h1 className="mt-6 font-display text-[42px] leading-[1.05] text-forest sm:text-[56px] lg:text-[62px]">
            Buy with confidence.
            <br />
            <span className="text-forest-mid">Own with proof.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-7 text-muted-foreground">
            Discover electronics, verify ownership records, and protect your property with AMANA — a private registry built for how Ethiopia actually buys and sells devices.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-forest px-6 text-[15px] text-ivory hover:bg-forest-deep">
              <Link to="/marketplace">Explore marketplace <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-forest/25 bg-transparent px-6 text-[15px] text-forest hover:bg-forest/5">
              <Link to="/ownership-check">Check ownership</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-muted-foreground">
            <li className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-forest" /> Registry-linked listings</li>
            <li className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-forest" /> Reviewed seller verification</li>
            <li className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4 text-forest" /> Private evidence storage</li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[470px] animate-rise [animation-delay:120ms]">
          <div className="absolute inset-x-8 top-16 h-[300px] rounded-[32px] bg-forest/12 blur-2xl" />
          <div className="relative [transform:perspective(1400px)_rotateY(-9deg)_rotateX(3deg)] [transform-style:preserve-3d]">
            <div className="surface-card overflow-hidden transition-transform duration-500 hover:-translate-y-1">
              <Image src={DEVICE} alt="A smartphone offered on the AMANA marketplace" className="h-[250px] w-full object-cover" fittingType="fill" />
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">Smartphones · Addis Ababa</p>
                  <p className="mt-1 text-[14px] font-semibold text-forest">Flagship device, verified record</p>
                </div>
                <p className="font-display text-[19px] text-forest">ETB 48,500</p>
              </div>
            </div>

            <div className="absolute -right-3 top-8 w-[196px] rounded-2xl border border-gold/35 bg-forest-deep p-4 text-ivory shadow-lift sm:-right-6">
              <div className="flex items-center justify-between">
                <p className="text-[9.5px] uppercase tracking-[0.18em] text-gold">Ownership record</p>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-pulse-ring" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
              </div>
              <p className="mt-2.5 font-mono text-[12px] tracking-wide text-ivory">AMN-7K2Q4M8X</p>
              <p className="mt-1 font-mono text-[10.5px] text-ivory/50">IMEI •••••••• 4821</p>
              <p className="mt-2.5 inline-flex items-center gap-1 text-[10.5px] text-success"><ShieldCheck className="h-3 w-3" /> Verified record</p>
            </div>

            <div className="absolute -bottom-9 -left-3 w-[240px] rounded-2xl border border-border bg-card p-4 shadow-lift sm:-left-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">Digital certificate</p>
                  <p className="mt-1.5 font-mono text-[11px] text-forest">AMN-C-92KD4QTX</p>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-deep">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-[10.5px] leading-4 text-muted-foreground">Issued by AMANA after ownership evidence review. Not a government document.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}