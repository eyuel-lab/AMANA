import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftRight, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";

export default function Transfer() {
  const { id } = useParams();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [toEmail, setToEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    const rec = await base44.entities.OwnershipRecord.get(id);
    setRecord(rec);
    const { items } = await base44.entities.OwnershipTransfer.filter({ record_id: id }, { sort: "-created_date", limit: 10 });
    setTransfers(items);
  };

  useEffect(() => { load(); }, [id]);

  const start = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await base44.functions.invoke("transferInitiate", { record_id: id, to_email: toEmail, notes });
      setNotice("Transfer started. The recipient must accept before a reviewer can complete it.");
      setToEmail("");
      setNotes("");
      load();
      return response;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const respond = async (transferId, action) => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("transferRespond", { transfer_id: transferId, action });
      setNotice("Transfer " + action + "ed.");
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!record) return <LoadingBlock rows={3} />;

  const blocking = record.status !== "registered" || record.verification_state !== "verified";
  const owner = record.owner_id === user?.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={"Record " + record.public_ref}
        title="Transfer ownership"
        description="A transfer needs the recipient's consent, a restriction check, and a reviewer before ownership changes. History is preserved."
        actions={<Button asChild variant="outline" size="sm" className="border-forest/25 text-forest"><Link to={"/registry/property/" + record.id}>Back to record</Link></Button>}
      />

      {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}
      {error && <p className="rounded-lg border border-danger/20 bg-danger-soft p-3 text-[12.5px] text-danger">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="surface-card p-5">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-forest" />
            <h2 className="text-[14px] font-semibold text-forest">Start a transfer</h2>
          </div>
          {blocking ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-soft/60 p-3 text-[12.5px] leading-5 text-forest">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              {record.status !== "registered"
                ? "This record has an active restriction or transfer. Resolve it before starting another."
                : "Only verified records can be transferred. This record is still awaiting verification."}
            </div>
          ) : !owner ? (
            <p className="mt-4 text-[12.5px] text-muted-foreground">Only the current owner can start a transfer.</p>
          ) : (
            <form onSubmit={start} className="mt-4 space-y-4">
              <div><Label htmlFor="to">New owner's email</Label><Input id="to" type="email" value={toEmail} onChange={(event) => setToEmail(event.target.value)} placeholder="newowner@example.com" className="mt-1.5" required /></div>
              <div><Label htmlFor="notes">Note for the recipient (optional)</Label><Textarea id="notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1.5" /></div>
              <Button type="submit" disabled={busy} className="w-full bg-forest text-ivory hover:bg-forest-deep">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Send transfer request</Button>
              <p className="text-[11px] leading-5 text-muted-foreground">The recipient accepts in their AMANA account. A reviewer then confirms no restriction exists before ownership is committed.</p>
            </form>
          )}
        </section>

        <aside className="surface-card h-fit p-5">
          <h2 className="text-[14px] font-semibold text-forest">Transfer activity</h2>
          <ul className="mt-3 space-y-2.5">
            {transfers.length === 0 && <li className="text-[12.5px] text-muted-foreground">No transfers recorded for this device.</li>}
            {transfers.map((transfer) => (
              <li key={transfer.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-forest">To {transfer.to_email}</p>
                  <StatusPill status={transfer.status} />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Started {formatDate(transfer.created_date)} · risk {transfer.risk_level}</p>
                {transfer.status === "pending_acceptance" && (
                  <div className="mt-2 flex gap-2">
                    {(transfer.to_user_id === user?.id || transfer.to_email === user?.email) && (
                      <>
                        <Button size="sm" className="h-7 bg-forest px-2.5 text-[11px] text-ivory" onClick={() => respond(transfer.id, "accept")}><CheckCircle2 className="mr-1 h-3 w-3" /> Accept</Button>
                        <Button size="sm" variant="outline" className="h-7 border-danger/30 px-2.5 text-[11px] text-danger" onClick={() => respond(transfer.id, "decline")}>Decline</Button>
                      </>
                    )}
                    {transfer.from_owner_id === user?.id && (
                      <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px] text-muted-foreground" onClick={() => respond(transfer.id, "cancel")}>Cancel</Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}