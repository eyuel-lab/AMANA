import { Link } from "react-router-dom";
import { LifeBuoy, Package, ShieldCheck, Wallet, Store, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const TOPICS = [
  { icon: Package, title: "Orders & delivery", body: "Track an order, understand its status, or cancel before payment is confirmed.", to: "/buyer/orders" },
  { icon: ShieldCheck, title: "Ownership records", body: "Register a device, understand review states, or start a transfer.", to: "/buyer/registry" },
  { icon: Store, title: "Selling on AMANA", body: "Verification requirements, listing reviews and seller orders.", to: "/seller/dashboard" },
  { icon: Wallet, title: "Payments & refunds", body: "What happens while no payment provider is configured.", to: "/contact?category=payment" },
];

const FAQS = [
  { q: "Why is my listing still pending?", a: "Every submitted listing is reviewed by a moderator. Listings with risk signals (for example a price far below market or no linked record for a used device) take longer. You will be notified with the decision." },
  { q: "Why can't I edit a live listing?", a: "Live listings can be paused, then edited and resubmitted. This prevents a reviewed listing from being changed into something else after approval." },
  { q: "Why is my ownership record not verified yet?", a: "A reviewer examines the proof of purchase you supplied. If the document is unclear you will be asked for more information or the record will be rejected with a reason." },
  { q: "Can I transfer a device under an open report?", a: "No. Records with an active report or dispute are restricted. A reviewer must resolve the report before the transfer can be committed." },
  { q: "Why can't I pay online?", a: "This environment has no payment provider configured. Orders are recorded with server-calculated totals and marked pending payment — no money is taken and no payment is faked." },
  { q: "How do I delete my account data?", a: "Use Settings to request deactivation. Records tied to legal or fraud-prevention obligations may be retained as described in the privacy policy." },
];

export default function Help() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">Help centre</p>
        <h1 className="mt-2 font-display text-[36px] leading-tight text-forest sm:text-[42px]">Find the answer, or open a tracked request</h1>
        <p className="mt-3 text-[14px] leading-7 text-muted-foreground">Support requests receive a reference you can follow up with.</p>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map((topic) => (
          <Link key={topic.title} to={topic.to} className="group surface-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
            <topic.icon className="h-5 w-5 text-forest" />
            <h2 className="mt-3 text-[14px] font-semibold text-forest">{topic.title}</h2>
            <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">{topic.body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-forest">Open <ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <Accordion type="single" collapsible>
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.q} value={"faq-" + index} className="border-border/80">
              <AccordionTrigger className="text-left text-[14px] font-medium text-forest hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-[13px] leading-6 text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <aside className="surface-card h-fit p-6">
          <LifeBuoy className="h-6 w-6 text-forest" />
          <h2 className="mt-3 text-[15px] font-semibold text-forest">Still stuck?</h2>
          <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">Send us the details and we will reply with a reference.</p>
          <Button asChild className="mt-4 w-full bg-forest text-ivory hover:bg-forest-deep"><Link to="/contact">Contact support</Link></Button>
        </aside>
      </div>
    </div>
  );
}