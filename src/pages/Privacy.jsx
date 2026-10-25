export default function Privacy() {
  return (
    <div className="container-page max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 font-display text-[36px] leading-tight text-forest">Privacy policy</h1>
      <p className="mt-2 text-[12.5px] text-muted-foreground">Last updated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · Draft for legal review</p>

      <div className="prose-legal mt-8">
        <p>
          This policy explains what AMANA collects and why. It is a development draft and must be reviewed against Ethiopian data-protection requirements before public launch.
        </p>

        <h2>1. Data we collect</h2>
        <ul>
          <li><strong>Account data:</strong> name, email, phone, city and region.</li>
          <li><strong>Verification data:</strong> identity or business documents you upload for seller verification, stored privately.</li>
          <li><strong>Registry data:</strong> device category, brand, model, a masked identifier, and a one-way hash of the full identifier used only for duplicate matching.</li>
          <li><strong>Evidence:</strong> proof-of-purchase files and report attachments, stored privately.</li>
          <li><strong>Activity data:</strong> orders, transfers, reports, review decisions, and security audit entries.</li>
        </ul>

        <h2>2. What is public</h2>
        <p>A public ownership check returns only: whether a record exists, the device category/brand/model, a masked identifier, the record status, the certificate reference and whether a warning is active. It never returns owner identity, documents, full identifiers, or case notes.</p>

        <h2>3. What is private</h2>
        <p>Identity documents, proof of purchase, report evidence, investigation notes, and risk assessments are restricted to their owner and to staff whose role requires access. Files are stored in private storage and shared through time-limited links.</p>

        <h2>4. Why we process data</h2>
        <ul>
          <li>To operate the marketplace and ownership registry you asked for.</li>
          <li>To review seller verification and ownership evidence.</li>
          <li>To restrict records affected by a lost or stolen report.</li>
          <li>To prevent fraud, abuse, and unauthorised access.</li>
          <li>To meet documented legal, tax, or law-enforcement obligations where applicable.</li>
        </ul>

        <h2>5. Retention</h2>
        <p>Record history and audit entries are retained to preserve the integrity of ownership and review decisions. Deactivation removes access but may not immediately erase entries we must keep for dispute resolution, fraud prevention, or legal obligations.</p>

        <h2>6. Your choices</h2>
        <ul>
          <li>Edit your profile and notification preferences in Settings.</li>
          <li>Request account deactivation from Settings; you can ask for correction of inaccurate data through support.</li>
          <li>Withdraw consent for future optional processing, understanding that some features require it.</li>
        </ul>

        <h2>7. Security</h2>
        <p>Access is enforced on the server, not only in the interface. Sensitive files are private, identifiers are stored masked with a one-way hash for matching, and administrative actions are logged. No system is perfectly secure; report a concern through support.</p>

        <h2>8. Analytics</h2>
        <p>No third-party analytics provider is configured in this environment. If one is added, it will be documented here and will never receive passwords, documents, full identifiers, or case data.</p>

        <h2>9. Contact</h2>
        <p>Privacy questions can be raised through the in-app support form. Formal legal notices require a registered business address, which is not yet published.</p>
      </div>
    </div>
  );
}