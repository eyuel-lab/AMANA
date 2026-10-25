import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Plus, FileBadge, ArrowLeftRight, Siren, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

const RESTRICTED = ["restricted", "reported_stolen", "reported_lost", "disputed"];

export default function RegistryHome() {
  const { user } = useAuth();
  const [records, setRecords] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [notice, setNotice] = useState("");

  const load = async () => {
    const page = await base44.entities.OwnershipRecord.filter({ owner_id: user.id }, { sort: "-created_date", limit: 50 });
    setRecords(page.items);
    const { items: allTransfers } = await base44.entities.OwnershipTransfer.list();
    setTransfers(allTransfers.filter((transfer) => transfer.status === "pending_acceptance" && (transfer.to_user_id === user.id || transfer.to_email === user.email)));
  };

  useEffect(() => { load(); }, [user.id]);

  const respond = async (id, action) => {
    try {
      await base44.functions.invoke("transferRespond", { transfer_id: id, action });
      setNotice(action === "accept" ? "Transfer accepted. A reviewer will complete the ownership change." : "Transfer declined.");
      load();
    } catch (err) {
      setNotice(err.response?.data?.error || err.message);
    }
  };

  if (!records) return <LoadingBlock rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ownership registry"
        title="My ownership records"
        description="Records you registered with AMANA. Verification and any active restriction are shown separately from the device description."
        actions={<Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/registry/register-property"><Plus className="mr-1.5 h-4 w-4" /> Register property</Link></Button>}
      />

      {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}

      {transfers.length > 0 && (
        <section className="surface-card border-gold/30 p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-forest"><ArrowLeftRight className="h-4 w-4 text-gold-deep" /> Transfers waiting for you</h2>
          <ul className="mt-3 space-y-3">
            {transfers.map((transfer) => (
              <li key={transfer.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[13px] font-medium text-forest">{transfer.item_label} · <span className="font-mono text-[11.5px]">{transfer.record_ref}</span></p>
                  <p className="text-[11.5px] text-muted-foreground">From {transfer.from_owner_name} · risk {transfer.risk_level}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-forest text-ivory hover:bg-forest-deep" onClick={() => respond(transfer.id, "accept")}>Accept</Button>
                  <Button size="sm" variant="outline" className="border-danger/30 text-danger" onClick={() => respond(transfer.id, "decline")}>Decline</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {records.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No ownership records yet"
          description="Register a device with its identifier and proof of purchase. A reviewer will verify the evidence before a certificate is issued."
          actionLabel="Register a device"
          actionTo="/registry/register-property"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {records.map((record) => (
            <article key={record.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{[record.brand, record.model].filter(Boolean).join(" · ")}</p>
                  <h3 className="mt-1 font-mono text-[14px] tracking-wider text-forest">{record.public_ref}</h3>
                </div>
                <StatusPill status={record.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-[11.5px]">
                <div><dt className="text-muted-foreground">Identifier</dt><dd className="font-mono text-forest">{record.identifier_masked}</dd></div>
                <div><dt className="text-muted-foreground">Registered</dt><dd className="text-forest">{formatDate(record.created_date)}</dd></div>
              </dl>
              {RESTRICTED.includes(record.status) && (
                <p className="mt-3 rounded-lg border border-danger/20 bg-danger-soft p-2.5 text-[11.5px] leading-5 text-danger">
                  Transfers are blocked while this restriction is active. {record.restriction_reason}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="border-forest/25 text-forest"><Link to={"/registry/property/" + record.id}>Open record</Link></Button>
                {record.verification_state === "verified" && (
                  <Button asChild size="sm" variant="ghost" className="text-forest"><Link to={"/registry/certificate/" + record.id}><FileBadge className="mr-1 h-3.5 w-3.5" /> Certificate</Link></Button>
                )}
                {record.status === "registered" && (
                  <Button asChild size="sm" variant="ghost" className="text-forest"><Link to={"/registry/transfer/" + record.id}><ArrowLeftRight className="mr-1 h-3.5 w-3.5" /> Transfer</Link></Button>
                )}
                {record.status === "registered" && (
                  <Button asChild size="sm" variant="ghost" className="text-danger"><Link to={"/protection/report?record=" + record.id}><Siren className="mr-1 h-3.5 w-3.5" /> Report</Link></Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-[12.5px] text-muted-foreground">
        <span>Anyone can verify a record reference without seeing your private evidence.</span>
        <Link to="/ownership-check" className="inline-flex items-center gap-1 font-medium text-forest hover:underline">Public check <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </div>
  );
}