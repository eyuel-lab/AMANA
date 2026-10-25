import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, LifeBuoy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/AuthContext";

const CATEGORIES = [
  { value: "listing", label: "Listing or seller" },
  { value: "order", label: "Order or delivery" },
  { value: "payment", label: "Payment or refund" },
  { value: "registry", label: "Ownership record" },
  { value: "protection", label: "Protection report" },
  { value: "account", label: "Account access" },
  { value: "general", label: "Something else" },
];

export default function Contact() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    category: params.get("category") || "general",
    subject: "",
    message: "",
    related_ref: params.get("ref") || "",
  });
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await base44.functions.invoke("supportCreate", form);
      setReference(response.data.reference);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Could not send your request.");
    } finally {
      setBusy(false);
    }
  };

  if (reference) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success"><CheckCircle2 className="h-6 w-6" /></span>
        <h1 className="mt-5 text-2xl font-semibold text-forest">Request received</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Keep this reference for follow-up. A support ticket has been recorded; replies appear in your notifications when you are signed in.
        </p>
        <p className="mt-5 rounded-lg border border-border bg-card px-5 py-3 font-mono text-[15px] tracking-wider text-forest">{reference}</p>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_360px] lg:py-16">
      <div>
        <p className="eyebrow">Contact & support</p>
        <h1 className="mt-2 font-display text-[36px] leading-tight text-forest sm:text-[42px]">Tell us what happened</h1>
        <p className="mt-3 max-w-xl text-[14px] leading-7 text-muted-foreground">
          Include the listing, order or record reference where possible. Never send passwords or full identity documents in this form.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="c-name">Your name</Label><Input id="c-name" value={form.name} onChange={(event) => update("name", event.target.value)} className="mt-1.5 bg-card" required /></div>
            <div><Label htmlFor="c-email">Email</Label><Input id="c-email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="mt-1.5 bg-card" required /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => update("category", value)}>
                <SelectTrigger className="mt-1.5 bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="c-ref">Related reference (optional)</Label><Input id="c-ref" value={form.related_ref} onChange={(event) => update("related_ref", event.target.value)} className="mt-1.5 bg-card font-mono text-[13px]" placeholder="AMN-… or order number" /></div>
          </div>
          <div><Label htmlFor="c-subject">Subject</Label><Input id="c-subject" value={form.subject} onChange={(event) => update("subject", event.target.value)} className="mt-1.5 bg-card" required /></div>
          <div><Label htmlFor="c-message">Details</Label><Textarea id="c-message" rows={6} value={form.message} onChange={(event) => update("message", event.target.value)} className="mt-1.5 bg-card" required /></div>
          {error && <p className="rounded-lg border border-danger/20 bg-danger-soft p-3 text-[13px] text-danger">{error}</p>}
          <Button type="submit" disabled={busy} className="bg-forest text-ivory hover:bg-forest-deep">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LifeBuoy className="mr-1.5 h-4 w-4" />} Send request
          </Button>
        </form>
      </div>

      <aside className="surface-card h-fit p-6">
        <h2 className="text-[15px] font-semibold text-forest">Before you write</h2>
        <ul className="mt-3 space-y-2 text-[12.5px] leading-6 text-muted-foreground">
          <li>· For a suspicious listing, use the Report listing action on the product page.</li>
          <li>· For a lost or stolen device, file a protection report so the record is restricted.</li>
          <li>· For payment questions, note that no provider is configured in this environment.</li>
        </ul>
        <p className="mt-4 border-t border-border pt-4 text-[12px] leading-5 text-muted-foreground">
          AMANA support is in-app. We do not request passwords, card numbers, or one-time codes.
        </p>
      </aside>
    </div>
  );
}