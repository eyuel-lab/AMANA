import { useEffect, useState } from "react";
import { BadgeCheck, Upload, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { myVerification } from "@/lib/profile";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default function Verification() {
  const [verification, setVerification] = useState(undefined);
  const [form, setForm] = useState({ legal_name: "", business_name: "", phone: "", city: "", region: "Addis Ababa" });
  const [idDocument, setIdDocument] = useState("");
  const [businessDocument, setBusinessDocument] = useState("");
  const [uploading, setUploading] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => { myVerification().then(setVerification); }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const upload = async (event, kind) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    setError("");
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Documents must be 10 MB or smaller.");
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      if (kind === "id") setIdDocument(file_uri);
      else setBusinessDocument(file_uri);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading("");
      event.target.value = "";
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("sellerVerificationSubmit", {
        ...form,
        id_document_uri: idDocument,
        business_document_uri: businessDocument,
      });
      setNotice("Verification request submitted. A reviewer will examine your documents.");
      setVerification(await myVerification());
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (verification === undefined) return <LoadingBlock rows={4} />;

  const status = verification?.status;
  const canApply = !verification || ["rejected", "more_info"].includes(status);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Seller verification" title="Account verification" description="Verification confirms your identity to buyers. It is separate from ownership verification of a device." />

      {verification && (
        <section className="surface-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">Current status</p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusPill status={status} />
                {verification.submitted_at && <span className="text-[11.5px] text-muted-foreground">Submitted {formatDate(verification.submitted_at)}</span>}
              </div>
            </div>
            {status === "verified" && <BadgeCheck className="h-8 w-8 text-success" />}
          </div>
          {verification.review_notes && (
            <p className="mt-3 rounded-lg border border-border bg-background p-3 text-[12.5px] leading-5 text-forest">Reviewer note: {verification.review_notes}</p>
          )}
          {status === "verified" && (
            <p className="mt-3 flex items-start gap-2 text-[12px] leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              Your account is verified. Buyers see a verified badge on your listings. This does not verify individual devices — link an ownership record for that.
            </p>
          )}
          {status === "pending" && <p className="mt-3 text-[12px] text-muted-foreground">Your documents are in the review queue. You will be notified when a decision is recorded.</p>}
        </section>
      )}

      {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}

      {canApply && (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="surface-card space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="v-legal">Full legal name</Label><Input id="v-legal" value={form.legal_name} onChange={(event) => update("legal_name", event.target.value)} className="mt-1.5" required /></div>
              <div><Label htmlFor="v-business">Business name (optional)</Label><Input id="v-business" value={form.business_name} onChange={(event) => update("business_name", event.target.value)} className="mt-1.5" /></div>
              <div><Label htmlFor="v-phone">Phone</Label><Input id="v-phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} className="mt-1.5" placeholder="+251 …" required /></div>
              <div><Label htmlFor="v-city">City</Label><Input id="v-city" value={form.city} onChange={(event) => update("city", event.target.value)} className="mt-1.5" required /></div>
            </div>
            <div>
              <Label>Region</Label>
              <Select value={form.region} onValueChange={(value) => update("region", value)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{REGIONS.map((region) => <SelectItem key={region} value={region}>{region}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Identity document (stored privately)</Label>
              <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-4 hover:border-forest/30">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-[12.5px] text-forest">{uploading === "id" ? "Uploading…" : idDocument ? "Identity document uploaded privately" : "Upload ID or passport"}</span>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="sr-only" onChange={(event) => upload(event, "id")} />
              </label>
            </div>
            <div>
              <Label>Business document (optional, stored privately)</Label>
              <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-4 hover:border-forest/30">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-[12.5px] text-forest">{uploading === "business" ? "Uploading…" : businessDocument ? "Business document uploaded privately" : "Upload trade licence"}</span>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="sr-only" onChange={(event) => upload(event, "business")} />
              </label>
            </div>
            {error && <p className="rounded-lg border border-danger/20 bg-danger-soft p-3 text-[12.5px] text-danger">{error}</p>}
            <Button type="submit" disabled={busy || !idDocument} className="w-full bg-forest text-ivory hover:bg-forest-deep">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-1.5 h-4 w-4" />} Submit for review
            </Button>
          </div>

          <aside className="surface-card h-fit space-y-3 p-5 text-[12px] leading-6 text-muted-foreground">
            <h2 className="flex items-center gap-1.5 text-[14px] font-semibold text-forest"><AlertTriangle className="h-4 w-4 text-warning" /> How review works</h2>
            <p>A reviewer examines your documents. Uploading a file never marks you verified automatically.</p>
            <p>If information is unclear you will be asked for more detail, or the request will be rejected with a reason.</p>
            <p>Identity documents are private and never shown on public listing pages.</p>
            <p className="border-t border-border pt-3">Verification does not verify devices and is not a government identity check.</p>
          </aside>
        </form>
      )}
    </div>
  );
}