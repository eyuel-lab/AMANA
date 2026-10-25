import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Siren, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProtectionReport() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ record_id: params.get("record") || "", report_type: "stolen", description: "" });
  const [evidence, setEvidence] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    base44.entities.OwnershipRecord.filter({ owner_id: user.id, status: "registered" }, { limit: 50 })
      .then((page) => setRecords(page.items));
  }, [user.id]);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5 - evidence.length);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) throw new Error("Each document must be 10 MB or smaller.");
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        uploaded.push(file_uri);
      }
      setEvidence((current) => [...current, ...uploaded]);
    } catch (err) {
      setError(err.message);
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
      const response = await base44.functions.invoke("protectionReport", { ...form, evidence_uris: evidence, accuracy_confirmed: confirmed });
      setResult(response.data.report);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-warning"><CheckCircle2 className="h-6 w-6" /></span>
        <h1 className="mt-5 text-2xl font-semibold text-forest">Report {result.report_number} received</h1>
        <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
          The record is restricted while a reviewer examines the report. Public checks now show an active warning, and ordinary transfers are blocked.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild className="bg-forest text-ivory hover:bg-forest-deep"><Link to={"/protection/report/" + result.id}>View report</Link></Button>
          <Button asChild variant="outline" className="border-forest/25 text-forest"><Link to="/safety">Safety guidance</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Protection" title="Report a lost or stolen device" description="This restricts the ownership record while the report is reviewed. It does not replace a police report." />

      {records.length === 0 ? (
        <div className="surface-card p-6">
          <Siren className="h-5 w-5 text-forest" />
          <h2 className="mt-2 text-[15px] font-semibold text-forest">No registered records available</h2>
          <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">You can only report a device with a registered record in your name. Register the device first, or contact support if it is already under review.</p>
          <Button asChild size="sm" className="mt-4 bg-forest text-ivory hover:bg-forest-deep"><Link to="/registry/register-property">Register a device</Link></Button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="surface-card space-y-4 p-5">
            <div>
              <Label>Registered device</Label>
              <Select value={form.record_id} onValueChange={(value) => setForm((current) => ({ ...current, record_id: value }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a record" /></SelectTrigger>
                <SelectContent>
                  {records.map((record) => (
                    <SelectItem key={record.id} value={record.id}>{record.brand} {record.model} · {record.public_ref}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>What happened</Label>
              <Select value={form.report_type} onValueChange={(value) => setForm((current) => ({ ...current, report_type: value }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stolen">Stolen</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Circumstances</Label>
              <Textarea id="description" rows={6} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="When and where it happened, and anything that helps a reviewer" className="mt-1.5" required />
            </div>
            <div>
              <Label>Supporting evidence (optional, stored privately)</Label>
              <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center hover:border-forest/30">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="mt-2 text-[12.5px] font-medium text-forest">{uploading ? "Uploading…" : "Add documents or photos"}</span>
                <span className="mt-1 text-[11px] text-muted-foreground">PDF, PNG or JPG · up to 5 files</span>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" multiple className="sr-only" onChange={upload} disabled={uploading} />
              </label>
              {evidence.length > 0 && <p className="mt-1.5 text-[11.5px] text-muted-foreground">{evidence.length} document(s) uploaded privately.</p>}
            </div>
            <label className="flex items-start gap-2.5 rounded-lg border border-border bg-background p-3 text-[12px] leading-5 text-forest">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border accent-forest" />
              I confirm this information is accurate to the best of my knowledge and understand that false reports may restrict my account.
            </label>
            {error && <p className="rounded-lg border border-danger/20 bg-danger-soft p-3 text-[12.5px] text-danger">{error}</p>}
            <Button type="submit" disabled={busy || !confirmed || !form.record_id} className="w-full bg-forest text-ivory hover:bg-forest-deep">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Siren className="mr-1.5 h-4 w-4" />} Submit report
            </Button>
          </div>
          <aside className="surface-card h-fit space-y-3 p-5 text-[12px] leading-6 text-muted-foreground">
            <h2 className="text-[14px] font-semibold text-forest">What happens next</h2>
            <p>The record is restricted immediately. Public checks show an active warning and ownership transfers are blocked.</p>
            <p>A reviewer may request more information, confirm the report, or reject it. Rejection clears the restriction.</p>
            <p>A report is an allegation, not a finding. AMANA does not locate devices and cannot recover property for you.</p>
            <p className="border-t border-border pt-3">Report the theft to the police as well. AMANA is not a law-enforcement channel.</p>
          </aside>
        </form>
      )}
    </div>
  );
}