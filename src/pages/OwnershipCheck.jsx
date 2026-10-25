import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusPill from "@/components/common/StatusPill";
import { formatDate } from "@/lib/format";

export default function OwnershipCheck() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await base44.functions.invoke("ownershipCheck", { ref });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  const record = result?.record;

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Public ownership check</p>
        <h1 className="mt-2 font-display text-[34px] leading-tight text-forest sm:text-[42px]">Check a record before money changes hands</h1>
        <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
          Enter the AMANA reference from a listing or certificate. We show whether a record exists, its status, and whether a warning is active — never private ownership documents or full identifiers.
        </p>
      </div>

      <form onSubmit={submit} className="mx-auto mt-8 max-w-xl">
        <Label htmlFor="ref" className="text-[12px]">AMANA reference</Label>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
          <Input
            id="ref"
            value={ref}
            onChange={(event) => setRef(event.target.value.toUpperCase())}
            placeholder="AMN-7K2Q4M8X"
            autoComplete="off"
            className="h-12 bg-card font-mono tracking-wider"
          />
          <Button type="submit" disabled={loading} className="h-12 rounded-full bg-forest px-6 text-ivory hover:bg-forest-deep">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-1.5">Check</span>
          </Button>
        </div>
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          References are case-insensitive. A record only exists if an owner registered the device with AMANA.
        </p>
      </form>

      {error && <p className="mx-auto mt-6 max-w-xl rounded-xl border border-danger/20 bg-danger-soft p-3 text-[13px] text-danger">{error}</p>}

      {result && !result.found && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-border bg-card p-6 text-center">
          <ShieldQuestion className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold text-forest">No AMANA record found for that reference</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            That does not prove a device is stolen — it only means no AMANA record exists with this reference. Ask the seller for proof of purchase and meet in a safe place.
          </p>
        </div>
      )}

      {record && (
        <div className="mx-auto mt-8 max-w-2xl space-y-4">
          <div className={`rounded-2xl border p-6 ${record.warning ? "border-danger/25 bg-danger-soft/40" : "border-success/25 bg-card"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">Reference</p>
                <p className="mt-1 font-mono text-[15px] tracking-wider text-forest">{record.public_ref}</p>
              </div>
              {record.warning ? <ShieldAlert className="h-7 w-7 text-danger" /> : <ShieldCheck className="h-7 w-7 text-success" />}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill status={record.status} />
              <StatusPill status={record.verification_state} text={record.verification_state === "verified" ? "Ownership verified" : "Verification pending"} />
            </div>
            {record.warning && (
              <p className="mt-4 rounded-lg border border-danger/20 bg-card p-3 text-[13px] leading-6 text-danger">{record.warning}</p>
            )}
            <dl className="mt-5 grid gap-3 border-t border-border/70 pt-4 text-[13px] sm:grid-cols-2">
              <div><dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Device</dt><dd className="mt-0.5 text-forest">{[record.brand, record.model].filter(Boolean).join(" ") || record.category}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Identifier</dt><dd className="mt-0.5 font-mono text-forest">{record.masked_identifier || "••••"}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Certificate</dt><dd className="mt-0.5 font-mono text-forest">{record.certificate_serial || "Not issued"}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Registered</dt><dd className="mt-0.5 text-forest">{formatDate(record.registered_on)}</dd></div>
            </dl>
            <p className="mt-4 text-[11.5px] leading-5 text-muted-foreground">
              {record.report_is_allegation
                ? "A report is an allegation. AMANA restricts the record while it is reviewed; it is not a finding of wrongdoing."
                : "This check confirms a record exists. It does not establish legal title or guarantee the device is not subject to a dispute outside AMANA."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[12.5px]">
            <Link to="/safety" className="rounded-full border border-border bg-card px-4 py-2 font-medium text-forest hover:border-forest/30">Buyer safety guide</Link>
            <Link to="/contact?category=registry" className="rounded-full border border-border bg-card px-4 py-2 font-medium text-forest hover:border-forest/30">Report a concern</Link>
          </div>
        </div>
      )}
    </div>
  );
}