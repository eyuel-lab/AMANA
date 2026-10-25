import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, FileBadge, ArrowLeftRight, Siren, ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canReview } from "@/lib/roles";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import EvidenceList from "@/components/common/EvidenceList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";

const RESTRICTED = ["restricted", "reported_stolen", "reported_lost", "disputed"];

export default function RegistryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = () => base44.entities.OwnershipRecord.get(id).then(setRecord).finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const decide = async (action) => {
    setBusy(true);
    try {
      await base44.functions.invoke("staffDecision", { subject: "record", id, action, notes });
      setNotice("Decision recorded.");
      load();
    } catch (err) {
      setNotice(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingBlock rows={4} />;
  if (!record) return <p className="text-[13px] text-muted-foreground">Record not found, or you do not have access to it.</p>;

  const owner = record.owner_id === user?.id;

  return (
    <div className="space-y-6">
      <Link to={owner ? "/buyer/registry" : "/admin/registry"} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-forest"><ChevronLeft className="h-3.5 w-3.5" /> Back</Link>

      <PageHeader
        eyebrow={"Record " + record.public_ref}
        title={[record.brand, record.model].filter(Boolean).join(" ") || "Ownership record"}
        description={`Registered ${formatDate(record.created_date)} by ${record.owner_name}.`}
        actions={
          <>
            {record.verification_state === "verified" && <Button asChild variant="outline" size="sm" className="border-forest/25 text-forest"><Link to={"/registry/certificate/" + record.id}><FileBadge className="mr-1.5 h-3.5 w-3.5" /> Certificate</Link></Button>}
            {owner && record.status === "registered" && <Button asChild size="sm" variant="outline" className="border-forest/25 text-forest"><Link to={"/registry/transfer/" + record.id}><ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" /> Transfer</Link></Button>}
            {owner && record.status === "registered" && <Button asChild size="sm" variant="outline" className="border-danger/30 text-danger"><Link to={"/protection/report?record=" + record.id}><Siren className="mr-1.5 h-3.5 w-3.5" /> Report</Link></Button>}
          </>
        }
      />

      {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          <div className="surface-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={record.status} />
              <StatusPill status={record.verification_state} text={record.verification_state === "verified" ? "Ownership verified" : "Verification pending"} />
              <StatusPill status={record.risk_level} />
            </div>
            {RESTRICTED.includes(record.status) && (
              <p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft p-3 text-[12.5px] leading-5 text-danger">
                Restriction active: {record.restriction_reason || "An open report is being reviewed."} Ordinary transfers are blocked.
              </p>
            )}
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Public reference", record.public_ref, true],
                ["Identifier", record.identifier_masked + " (" + record.identifier_type + ")", true],
                ["Category", record.category],
                ["Purchase date", record.purchase_date || "Not supplied"],
                ["Certificate", record.certificate_serial || "Not issued", true],
                ["Issued", record.certificate_issued_at ? formatDate(record.certificate_issued_at) : "—"],
              ].map(([label, value, mono]) => (
                <div key={label}>
                  <dt className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
                  <dd className={`mt-1 text-[13px] text-forest ${mono ? "font-mono" : ""}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-[14px] font-semibold text-forest">Ownership evidence</h2>
            <p className="mt-1 text-[11.5px] text-muted-foreground">Only you and authorised reviewers can open these documents.</p>
            <div className="mt-3"><EvidenceList uris={record.evidence_uris} emptyLabel="No evidence documents on file." /></div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-[14px] font-semibold text-forest">Ownership history</h2>
            <ol className="mt-4 space-y-4">
              {(record.history || []).slice().reverse().map((entry, index) => (
                <li key={index} className="relative border-l border-border pl-4">
                  <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-forest" />
                  <p className="text-[12.5px] font-medium capitalize text-forest">{String(entry.event || "").replace(/_/g, " ")}</p>
                  <p className="text-[11.5px] text-muted-foreground">{entry.note}</p>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">{formatDate(entry.at, "d MMM yyyy, HH:mm")} · {entry.actor_name}</p>
                </li>
              ))}
              {!record.history?.length && <p className="text-[12.5px] text-muted-foreground">No history entries recorded.</p>}
            </ol>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-5 text-[12.5px] leading-6 text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-forest" />
            <h2 className="mt-2 text-[14px] font-semibold text-forest">What this record means</h2>
            <p className="mt-1.5">AMANA reviewed the evidence supplied for this identifier. It is not a government title and does not guarantee the device is free of external disputes.</p>
            <p className="mt-2">Public checks show status and any warning — never this evidence or the full identifier.</p>
            <Button asChild size="sm" variant="outline" className="mt-3 border-forest/25 text-forest"><Link to="/ownership-check">Run public check</Link></Button>
          </div>

          {canReview(user) && record.status === "pending_review" && (
            <div className="surface-card border-gold/30 p-5">
              <h2 className="text-[14px] font-semibold text-forest">Reviewer decision</h2>
              <p className="mt-1 text-[11.5px] text-muted-foreground">Approving issues a certificate. Rejecting archives the record with your reason.</p>
              <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Decision note" className="mt-3" />
              <div className="mt-3 flex gap-2">
                <Button size="sm" disabled={busy} onClick={() => decide("approve")} className="flex-1 bg-forest text-ivory hover:bg-forest-deep">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />} Approve</Button>
                <Button size="sm" disabled={busy} variant="outline" onClick={() => decide("reject")} className="flex-1 border-danger/30 text-danger"><XCircle className="mr-1 h-3.5 w-3.5" /> Reject</Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}