import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Save, UserRound, ShieldCheck, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import useProfile from "@/hooks/useProfile";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/lib/constants";
import { ROLE_LABEL, roleOf } from "@/lib/roles";

export default function AccountSettings() {
  const { user } = useAuth();
  const { profile, loading, setProfile } = useProfile();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        city: profile.city || "",
        region: profile.region || "Addis Ababa",
        account_types: Array.isArray(profile.account_types) && profile.account_types.length ? profile.account_types : ["buyer"],
        notification_prefs: profile.notification_prefs || { in_app: true, email: false },
      });
    }
  }, [profile]);

  if (loading || !form) return <LoadingBlock rows={4} />;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleType = (type, checked) => {
    const next = checked ? Array.from(new Set([...form.account_types, type])) : form.account_types.filter((item) => item !== type);
    update("account_types", next.length ? next : ["buyer"]);
  };

  const save = async () => {
    setBusy(true);
    setNotice("");
    try {
      const saved = await base44.entities.UserProfile.update(profile.id, form);
      setProfile(saved);
      setNotice("Profile saved.");
    } catch (err) {
      setNotice(err.message || "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  };

  const requestDeactivation = async () => {
    setBusy(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { deactivated: true });
      setNotice("Deactivation requested. Your account is marked inactive; contact support if this was a mistake.");
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Profile and preferences" description="Your profile is private. Sellers only ever see the name you use on listings." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-card space-y-4 p-5">
          <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-forest" /><h2 className="text-[14px] font-semibold text-forest">Personal details</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="s-name">Full name</Label><Input id="s-name" value={form.full_name} onChange={(event) => update("full_name", event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="s-phone">Phone</Label><Input id="s-phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} className="mt-1.5" placeholder="+251 …" /></div>
            <div><Label htmlFor="s-city">City</Label><Input id="s-city" value={form.city} onChange={(event) => update("city", event.target.value)} className="mt-1.5" /></div>
            <div>
              <Label>Region</Label>
              <Select value={form.region} onValueChange={(value) => update("region", value)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{REGIONS.map((region) => <SelectItem key={region} value={region}>{region}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-[13px] font-semibold text-forest">Account type</h3>
            <p className="mt-1 text-[11.5px] text-muted-foreground">You can hold both. Selling requires an approved verification review.</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {["buyer", "seller"].map((type) => (
                <label key={type} className="flex items-center gap-2 text-[12.5px] capitalize text-forest">
                  <Checkbox checked={form.account_types.includes(type)} onCheckedChange={(checked) => toggleType(type, checked === true)} />
                  {type}
                </label>
              ))}
            </div>
            {form.account_types.includes("seller") && (
              <Button asChild size="sm" variant="outline" className="mt-3 border-forest/25 text-forest"><Link to="/seller/verification"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Seller verification</Link></Button>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-[13px] font-semibold text-forest">Notifications</h3>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-[12.5px] text-forest">
                <Checkbox checked={form.notification_prefs?.in_app !== false} onCheckedChange={(checked) => update("notification_prefs", { ...form.notification_prefs, in_app: checked === true })} />
                In-app notifications
              </label>
              <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                <Checkbox checked={form.notification_prefs?.email === true} onCheckedChange={(checked) => update("notification_prefs", { ...form.notification_prefs, email: checked === true })} />
                Email notifications (requires a configured provider)
              </label>
            </div>
          </div>

          {notice && <p className="rounded-lg border border-success/20 bg-success-soft p-3 text-[12.5px] text-success">{notice}</p>}

          <Button onClick={save} disabled={busy} className="bg-forest text-ivory hover:bg-forest-deep">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />} Save changes
          </Button>
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="text-[13px] font-semibold text-forest">Account</h2>
            <dl className="mt-3 space-y-2.5 text-[12.5px]">
              <div><dt className="text-muted-foreground">Email</dt><dd className="text-forest">{user?.email}</dd></div>
              <div><dt className="text-muted-foreground">Access level</dt><dd className="text-forest">{ROLE_LABEL[roleOf(user)]}</dd></div>
              <div><dt className="text-muted-foreground">Terms accepted</dt><dd className="text-forest">{profile.terms_accepted_at ? new Date(profile.terms_accepted_at).toLocaleDateString() : "Not recorded"}</dd></div>
            </dl>
          </div>
          <div className="surface-card border-danger/20 p-5">
            <h2 className="text-[13px] font-semibold text-forest">Deactivate account</h2>
            <p className="mt-1.5 text-[11.5px] leading-5 text-muted-foreground">Marks your account inactive. Records and audit entries linked to disputes may be retained.</p>
            <Button size="sm" variant="outline" onClick={requestDeactivation} disabled={busy || profile.deactivated} className="mt-3 border-danger/30 text-danger">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {profile.deactivated ? "Deactivation requested" : "Request deactivation"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}