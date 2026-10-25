import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, IDENTIFIER_TYPES } from "@/lib/constants";

export default function RegisterProperty() {
  const [form, setForm] = useState({ category: "smartphones", brand: "", model: "", identifier_type: "imei", identifier: "", purchase_date: "" });
  const [evidence, setEvidence] = useState([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const upload = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5 - evidence.length);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) throw new Error("Each document must be 10 MB or smaller.");
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        uploaded.push(file_uri);
      }
      setEvidence((current) => [...current, ...uploaded]);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await base44.functions.invoke("registryRegister", { ...form, evidence_uris: evidence });
      setResult(response.data.record);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success"><CheckCircle2 className="h-6 w-6" /></span>
        <h1 className="mt-5 text-2xl font-semibold text-forest">Record submitted for review</h1>
        <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">A reviewer will examine your proof of purchase. You will be notified when a decision is recorded.</p>
        <p className="mt-5 rounded-lg border border-border bg-card px-5 py-3 font-mono text-[15px] tracking-wider text-forest">{result.public_ref}</p>
        <p className="mt-2 text-[11.5px] text-muted-foreground">Risk signals: {result.risk_level}. This is a review signal, not an accusation.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to="/buyer/registry">View my records</Link></Button>
          <Button asChild variant="outline" className="border-forest/25 text-forest"><Link to="/registry/register-property">Register another</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Ownership registry" title="Register a device" description="Only the fields needed for verification are collected. Full identifiers are stored masked, with a one-way hash used for duplicate matching." />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="surface-card space-y-4 p-5">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(value) => update("category", value)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="brand">Brand</Label><Input id="brand" value={form.brand} onChange={(event) => update("brand", event.target.value)} className="mt-1.5" placeholder="Samsung" required /></div>
            <div><Label htmlFor="model">Model</Label><Input id="model" value={form.model} onChange={(event) => update("model", event.target.value)} className="mt-1.5" placeholder="Galaxy S23" required /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Identifier type</Label>
              <Select value={form.identifier_type} onValueChange={(value) => update("identifier_type", value)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{IDENTIFIER_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="identifier">Identifier</Label><Input id="identifier" value={form.identifier} onChange={(event) => update("identifier", event.target.value)} className="mt-1.5 font-mono" placeholder="356938035643809" required /></div>
          </div>
          <div><Label htmlFor="purchase">Purchase date (optional)</Label><Input id="purchase" type="date" value={form.purchase_date} onChange={(event) => update("purchase_date", event.target.value)} className="mt-1.5" /></div>

          <div>
            <Label>Proof of purchase (stored privately)</Label>
            <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center hover:border-forest/30">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="mt-2 text-[12.5px] font-medium text-forest">{uploading ? "Uploading…" : "Add receipts or invoices"}</span>
              <span className="mt-1 text-[11px] text-muted-foreground">PDF, PNG or JPG · up to 5 files · 10 MB each</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" multiple className="sr-only" onChange={upload} disabled={uploading || evidence.length >= 5} />
            </label>
            {evidence.length > 0 && (
              <ul className="mt-2 space-y-1 text-[11.5px] text-muted-foreground">
                {evidence.map((uri, index) => <li key={uri}>Document {index + 1} uploaded privately</li>)}
              </ul>
            )}
          </div>

          {error && <p className="rounded-lg border border-danger/20 bg-danger-soft p-3 text-[12.5px] text-danger">{error}</p>}

          <Button type="submit" disabled={busy || uploading || !evidence.length} className="w-full bg-forest text-ivory hover:bg-forest-deep">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1.5 h-4 w-4" />} Submit for review
          </Button>
        </div>

        <aside className="surface-card h-fit space-y-3 p-5 text-[12.5px] leading-6 text-muted-foreground">
          <h2 className="text-[14px] font-semibold text-forest">Before you register</h2>
          <p>You must be the lawful owner of the device and able to show proof of purchase.</p>
          <p>Duplicate identifiers are rejected. If a device already has an active record, contact support with your evidence.</p>
          <p>Registration does not create legal title. The certificate is issued by AMANA and documents our review, nothing more.</p>
          <p className="border-t border-border pt-3">Identifiers are stored masked; the hash is used only to detect duplicates and is never shown.</p>
        </aside>
      </form>
    </div>
  );
}