export default function Terms() {
  return (
    <div className="container-page max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 font-display text-[36px] leading-tight text-forest">Terms of service</h1>
      <p className="mt-2 text-[12.5px] text-muted-foreground">Last updated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · Draft for legal review</p>

      <div className="prose-legal mt-8">
        <p>
          These terms describe how AMANA may be used. They are a working draft prepared during product development and have not been reviewed by a qualified Ethiopian lawyer. Do not treat them as legal advice or as a final contract.
        </p>

        <h2>1. What AMANA provides</h2>
        <p>AMANA operates a private electronics marketplace, a private ownership-record registry, and a lost-and-stolen reporting workflow. AMANA is not a government body, a court, a bank, or a law-enforcement agency.</p>

        <h2>2. Accounts</h2>
        <ul>
          <li>You must provide accurate information and keep your account credentials secure.</li>
          <li>You may hold a buyer, seller, or combined account. Seller privileges require an approved verification review.</li>
          <li>Privileged staff roles (reviewer, investigator, auditor, administrator) are granted only by AMANA administrators and may be removed.</li>
        </ul>

        <h2>3. Listings and marketplace conduct</h2>
        <ul>
          <li>List only devices you lawfully possess and may sell.</li>
          <li>Use photographs of the actual device and describe its condition honestly.</li>
          <li>Do not manipulate prices, identifiers, or record links to mislead buyers.</li>
          <li>AMANA may pause or reject listings that fail review, and records the decision with a reason.</li>
        </ul>

        <h2>4. Ownership records and certificates</h2>
        <p>An AMANA record reflects our review of the evidence you submitted. A certificate is an AMANA-issued record document. It is not a title deed, not a government document, and does not by itself establish legal ownership in a dispute.</p>

        <h2>5. Reports and restrictions</h2>
        <p>A lost or stolen report is an allegation. While it is reviewed, the record is restricted and ordinary transfers are blocked. Deliberately false reports may lead to account restriction. A correction and dispute process is available.</p>

        <h2>6. Payments</h2>
        <p>Orders are recorded with totals calculated on our servers. No payment is collected unless a payment provider has been configured and verified. A client-side claim of payment success is never treated as payment.</p>

        <h2>7. Prohibited conduct</h2>
        <ul>
          <li>Attempting to access another member&apos;s records, files, or cases without authorisation.</li>
          <li>Attempting to grant yourself a staff role or bypass a review step.</li>
          <li>Uploading malicious files, scraping identifying data, or probing public endpoints.</li>
          <li>Using AMANA to sell stolen property or to harass another person.</li>
        </ul>

        <h2>8. Suspension</h2>
        <p>We may restrict accounts or listings to protect members, comply with lawful requests, or investigate abuse. Where appropriate we record the reason and notify the affected member.</p>

        <h2>9. Liability and disputes</h2>
        <p>AMANA is provided as-is during this development phase. We do not guarantee uninterrupted service, and we do not guarantee the conduct of buyers or sellers. Disputes may be raised in-app for review; legal questions should be referred to a qualified professional.</p>

        <h2>10. Changes</h2>
        <p>We will publish material changes to these terms in the app. Continued use after a change constitutes acceptance of the updated draft.</p>
      </div>
    </div>
  );
}