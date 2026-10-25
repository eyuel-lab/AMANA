import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Loader2, Save, Send, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import LoadingBlock from "@/components/common/LoadingBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image } from "@/components/ui/image";
import { CATEGORIES, CONDITIONS, REGIONS } from "@/lib/constants";

const EMPTY = {
  title: "", description: "", category: "smartphones", brand: "", model: "",
  condition: "good", price: "", location: "Addis Ababa", specifications: "", registry_record_id: "",
};

export default function ListingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editing = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [records, setRecords] = useState([]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.entities.OwnershipRecord.filter({ owner_id: user.id }, { limit: 50 }).then((page) => setRecords(page.items));
    if (!editing) return;
    base44.entities.ProductListing.get(id).then((record) => {
      setListing(record);
      setImages(record.images || []);
      setForm({
        title: record.title || "", description: record.description || "", category: record.category || "smartphones",
        brand: record.brand || "", model: record.model || "", condition: record.condition || "good",
        price: String(record.price ?? ""), location: record.location || "Addis Ababa",
        specifications: record.specifications || "", registry_record_id: record.registry_record_id || "",
      });
    }).finally(() => setLoading(false));
  }, [id, editing, user.id]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const upload = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 6 - images.length);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) throw new Error("Product photos must be images.");
        if (file.size > 8 * 1024 * 1024) throw new Error("Each photo must be 8 MB or smaller.");
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        uploaded.push(file_url);
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const save = async (submit) => {
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
        images,
        category: form.category,
        registry_record_id: form.registry_record_id || "",
      };
      let current = listing;
      if (!current) {
        current = await base44.entities.ProductListing.create({ ...payload, seller_id: user.id, status: "draft", seller_name: user.full_name || "" });
      } else {
        current = await base44.entities.ProductListing.update(id, payload);
      }
      if (submit) await base44.functions.invoke("listingSubmit", { listing_id: current.id });
      navigate("/seller/listings");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Could not save the listing.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingBlock rows={4} />;

  const locked = listing && !["draft", "rejected", "paused"].includes(listing.status);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Selling"
        title={editing ? "Edit listing" : "New listing"}
        description="Buyers see your photos, condition and ownership-record status. Be precise — misleading listings are rejected."
        actions={<Button variant="ghost" className="text-muted-foreground" onClick={() => navigate("/seller/listings")}>Cancel</Button>}
      />

      {locked && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-soft/60 p-3 text-[12.5px] leading-5 text-forest">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          This listing is {listing.status}. Pause it from the listings page before editing, then resubmit for review.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <fieldset disabled={locked} className="surface-card space-y-4 p-5">
          <div><Label htmlFor="l-title">Listing title</Label><Input id="l-title" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="iPhone 13 Pro 256GB, unlocked" className="mt-1.5" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="l-brand">Brand</Label><Input id="l-brand" value={form.brand} onChange={(event) => update("brand", event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="l-model">Model</Label><Input id="l-model" value={form.model} onChange={(event) => update("model", event.target.value)} className="mt-1.5" /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => update("category", value)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={form.condition} onValueChange={(value) => update("condition", value)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{CONDITIONS.map((condition) => <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="l-price">Price (ETB)</Label><Input id="l-price" inputMode="numeric" value={form.price} onChange={(event) => update("price", event.target.value.replace(/[^0-9]/g, ""))} className="mt-1.5" /></div>
            <div>
              <Label>Collection location</Label>
              <Select value={form.location} onValueChange={(value) => update("location", value)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{REGIONS.map((region) => <SelectItem key={region} value={region}>{region}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="l-desc">Description</Label><Textarea id="l-desc" rows={5} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Condition details, what is included, why you are selling" className="mt-1.5" /></div>
          <div><Label htmlFor="l-specs">Specifications (optional)</Label><Textarea id="l-specs" rows={3} value={form.specifications} onChange={(event) => update("specifications", event.target.value)} placeholder="Storage, battery health, accessories" className="mt-1.5" /></div>

          <div>
            <Label>Product photos (stored publicly — anyone with the link can open them)</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {images.map((image) => (
                <div key={image} className="relative overflow-hidden rounded-lg border border-border">
                  <Image src={image} alt="" className="h-20 w-full object-cover" fittingType="fill" />
                  <button type="button" onClick={() => setImages((current) => current.filter((item) => item !== image))} className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest-deep/80 text-ivory" aria-label="Remove photo">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background text-[11px] text-muted-foreground hover:border-forest/30">
                  <Upload className="h-4 w-4" />
                  <span className="mt-1">{uploading ? "Uploading…" : "Add photo"}</span>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={upload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
        </fieldset>

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="text-[13.5px] font-semibold text-forest">Ownership record</h2>
            <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">Link a record you own so buyers see the device's registry status. This never exposes private evidence.</p>
            <Select value={form.registry_record_id || "none"} onValueChange={(value) => update("registry_record_id", value === "none" ? "" : value)}>
              <SelectTrigger className="mt-3"><SelectValue placeholder="No record linked" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No record linked</SelectItem>
                {records.map((record) => (
                  <SelectItem key={record.id} value={record.id}>{record.brand} {record.model} · {record.public_ref} ({record.status.replace(/_/g, " ")})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {records.length === 0 && <p className="mt-2 text-[11px] text-muted-foreground">You have no records yet. Register the device first for a stronger listing.</p>}
          </div>

          <div className="surface-card space-y-2 p-5 text-[11.5px] leading-5 text-muted-foreground">
            <p className="text-[12.5px] font-semibold text-forest">Before submitting</p>
            <p>· At least one real photo, a title of 8+ characters and a 30+ character description.</p>
            <p>· Approved seller verification is required.</p>
            <p>· Used devices without a linked record are flagged for reviewer attention.</p>
          </div>

          {error && <p className="rounded-lg border border-danger/20 bg-danger-soft p-3 text-[12.5px] text-danger">{error}</p>}

          <div className="flex flex-col gap-2">
            <Button onClick={() => save(true)} disabled={busy || locked} className="bg-forest text-ivory hover:bg-forest-deep">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />} Save & submit for review
            </Button>
            <Button onClick={() => save(false)} disabled={busy || locked} variant="outline" className="border-forest/25 text-forest">
              <Save className="mr-1.5 h-4 w-4" /> Save draft
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}