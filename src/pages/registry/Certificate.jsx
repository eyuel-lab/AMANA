import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Printer, ShieldCheck, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingBlock from "@/components/common/LoadingBlock";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import Logo from "@/components/brand/Logo";

export default function Certificate() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.OwnershipRecord.get(id).then(setRecord).catch(() => setRecord(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBlock rows={3} />;
  if (!record) return <p className="text-[13px] text-muted-foreground">Certificate not available.</p>;
  if (record.verification_state !== "verified") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-semibold text-forest">Certificate not issued yet</h1>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">A certificate is issued only after a reviewer verifies the ownership evidence for this record.</p>
        <Button asChild variant="outline" className="mt-5 border-forest/25 text-forest"><Link to={"/registry/property/" + record.id}>Back to record</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" className="text-muted-foreground"><Link to={"/registry/property/" + record.id}><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to record</Link></Button>
        <Button variant="outline" className="border-forest/25 text-forest" onClick={() => window.print()}><Printer className="mr-1.5 h-4 w-4" /> Print certificate</Button>
      </div>

      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gold/40 bg-card shadow-lift">
        <div className="h-2 bg-forest" />
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Logo />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Digital ownership record</p>
              <p className="mt-1 font-mono text-[13px] text-forest">{record.certificate_serial}</p>
            </div>
          </div>

          <div className="mt-10 border-y border-border py-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">This certifies that</p>
            <h1 className="mt-3 font-display text-[30px] leading-tight text-forest sm:text-[38px]">{record.owner_name}</h1>
            <p className="mt-2 text-[13px] text-muted-foreground">is the registered owner on AMANA of</p>
            <p className="mt-4 font-display text-[24px] text-forest sm:text-[28px]">{[record.brand, record.model].filter(Boolean).join(" ")}</p>
            <p className="mt-2 font-mono text-[12px] text-muted-foreground">Identifier {record.identifier_masked} · {record.identifier_type.toUpperCase()}</p>
          </div>

          <dl className="mt-8 grid gap-5 sm:grid-cols-3">
            <div><dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Record reference</dt><dd className="mt-1 font-mono text-[12.5px] text-forest">{record.public_ref}</dd></div>
            <div><dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Issued</dt><dd className="mt-1 text-[12.5px] text-forest">{formatDate(record.certificate_issued_at)}</dd></div>
            <div><dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Status at issue</dt><dd className="mt-1 text-[12.5px] capitalize text-forest">{record.status.replace(/_/g, " ")}</dd></div>
          </dl>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-border bg-background p-4">
            <div className="max-w-sm">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-forest">Verify this certificate</p>
              <p className="mt-1 break-all font-mono text-[11.5px] text-muted-foreground">/ownership-check · {record.public_ref}</p>
              <p className="mt-2 text-[10.5px] leading-4 text-muted-foreground">Anyone can verify this reference without seeing private documents.</p>
            </div>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/50 bg-gold/10 text-gold-deep">
              <ShieldCheck className="h-7 w-7" />
            </span>
          </div>

          <p className="mt-6 text-[10.5px] leading-4 text-muted-foreground">
            Issued by AMANA, a private platform. This is not a government document, title deed, or legal guarantee of ownership. It records AMANA&apos;s review of the evidence supplied at the time of issue.
          </p>
        </div>
      </article>
    </div>
  );
}