import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is AMANA an official government registry?",
    a: "No. AMANA is a private platform. Records and certificates are issued by AMANA and are not government documents and carry no legal guarantee. They are evidence that our reviewers examined the material a member supplied.",
  },
  {
    q: "Does a 'verified seller' badge mean the device is verified?",
    a: "No. Seller verification confirms that we reviewed a seller's identity and business information. It says nothing about a specific device. A device's status comes from its ownership record, which is shown separately.",
  },
  {
    q: "What does an ownership record prove?",
    a: "A verified record shows that AMANA reviewed supplied proof of purchase for that identifier and that no conflicting active record existed at that time. It is not a title deed, and it cannot resolve a legal ownership dispute.",
  },
  {
    q: "Can I be tracked through AMANA?",
    a: "No. AMANA does not locate devices. Recovery is a case-management workflow for reports and evidence. Any future location feature would require explicit enrolment, operating-system permission and lawful integration.",
  },
  {
    q: "What happens when a device is reported stolen?",
    a: "The record is restricted while the report is reviewed. Public checks show that a warning is active, and ordinary transfers are blocked. Reports are allegations until confirmed, and there is a correction process.",
  },
  {
    q: "How are payments handled?",
    a: "Orders are recorded with server-calculated totals. AMANA does not accept payment until a provider is configured and verified — the current environment shows payment as unconfigured rather than pretending a charge occurred.",
  },
];

export default function FaqSection() {
  return (
    <section className="container-page py-16">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Questions, answered plainly</p>
          <h2 className="mt-2 font-display text-[30px] leading-tight text-forest sm:text-[34px]">What AMANA can and cannot claim</h2>
          <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
            Trust depends on precision. We separate identity verification, record existence and reviewed ownership so you always know which one you are looking at.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.q} value={"item-" + index} className="border-border/80">
              <AccordionTrigger className="text-left text-[14.5px] font-medium text-forest hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-[13.5px] leading-6 text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}