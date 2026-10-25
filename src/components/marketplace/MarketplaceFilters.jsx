import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CONDITIONS, REGIONS } from "@/lib/constants";

export default function MarketplaceFilters({ values, patch, reset, hideCategory }) {
  return (
    <div className="surface-card space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-forest">Filters</h2>
        <button type="button" onClick={reset} className="text-[12px] font-medium text-muted-foreground underline-offset-4 hover:text-forest hover:underline">
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="f-q" className="text-[12px]">Search</Label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input id="f-q" value={values.q || ""} onChange={(event) => patch({ q: event.target.value })} placeholder="Title, brand or model" className="bg-background pl-9" />
          </div>
        </div>
        <div>
          <Label htmlFor="f-brand" className="text-[12px]">Brand</Label>
          <Input id="f-brand" value={values.brand} onChange={(event) => patch({ brand: event.target.value })} placeholder="Apple, Samsung, HP…" className="mt-1.5 bg-background" />
        </div>

        {!hideCategory && (
          <div>
            <Label className="text-[12px]">Category</Label>
            <Select value={values.category || "all"} onValueChange={(value) => patch({ category: value === "all" ? "" : value })}>
              <SelectTrigger className="mt-1.5 bg-background"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="text-[12px]">Price range (ETB)</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Input inputMode="numeric" value={values.min} onChange={(event) => patch({ min: event.target.value.replace(/[^0-9]/g, "") })} placeholder="Min" aria-label="Minimum price" className="bg-background" />
            <span className="text-muted-foreground">–</span>
            <Input inputMode="numeric" value={values.max} onChange={(event) => patch({ max: event.target.value.replace(/[^0-9]/g, "") })} placeholder="Max" aria-label="Maximum price" className="bg-background" />
          </div>
        </div>

        <div>
          <Label className="text-[12px]">Condition</Label>
          <Select value={values.condition || "any"} onValueChange={(value) => patch({ condition: value === "any" ? "" : value })}>
            <SelectTrigger className="mt-1.5 bg-background"><SelectValue placeholder="Any condition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any condition</SelectItem>
              {CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[12px]">Location</Label>
          <Select value={values.region || "any"} onValueChange={(value) => patch({ region: value === "any" ? "" : value })}>
            <SelectTrigger className="mt-1.5 bg-background"><SelectValue placeholder="Anywhere in Ethiopia" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Anywhere in Ethiopia</SelectItem>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-background p-3">
          <Checkbox checked={values.verified} onCheckedChange={(checked) => patch({ verified: checked === true })} className="mt-0.5" />
          <span>
            <span className="block text-[12.5px] font-medium text-forest">Verified sellers only</span>
            <span className="block text-[11px] leading-4 text-muted-foreground">Account verification, not proof of ownership.</span>
          </span>
        </label>
      </div>

      <Button variant="outline" className="w-full border-border text-forest" onClick={reset}>Reset filters</Button>
    </div>
  );
}