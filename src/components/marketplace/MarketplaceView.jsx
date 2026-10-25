import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ListingCard from "@/components/marketplace/ListingCard";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import { CardSkeletonGrid } from "@/components/common/LoadingBlock";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SORTS = [
  { value: "newest", label: "Newest first", sort: "-created_date" },
  { value: "price_asc", label: "Price: low to high", sort: "price" },
  { value: "price_desc", label: "Price: high to low", sort: "-price" },
];

export default function MarketplaceView({ fixedCategory, title, description }) {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const values = {
    q: params.get("q") || "",
    category: fixedCategory || params.get("category") || "",
    brand: params.get("brand") || "",
    min: params.get("min") || "",
    max: params.get("max") || "",
    condition: params.get("condition") || "",
    region: params.get("region") || "",
    verified: params.get("verified") === "1",
    sort: params.get("sort") || "newest",
  };

  const patch = (next) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value === "" || value === false || value === null) merged.delete(key);
      else merged.set(key, String(value));
    });
    setParams(merged, { replace: true });
  };

  const reset = () => setParams(new URLSearchParams(), { replace: true });

  const buildQuery = () => {
    const query = { status: "active" };
    if (values.category) query.category = values.category;
    if (values.condition) query.condition = values.condition;
    if (values.region) query.location = values.region;
    if (values.verified) query.seller_verified = true;
    if (values.brand) query.brand = { $regex: values.brand, $options: "i" };
    if (values.min || values.max) {
      query.price = {};
      if (values.min) query.price.$gte = Number(values.min);
      if (values.max) query.price.$lte = Number(values.max);
    }
    if (values.q) {
      query.$or = [
        { title: { $regex: values.q, $options: "i" } },
        { brand: { $regex: values.q, $options: "i" } },
        { model: { $regex: values.q, $options: "i" } },
      ];
    }
    return query;
  };

  const sortOption = SORTS.find((option) => option.value === values.sort) || SORTS[0];

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    base44.entities.ProductListing.filter(buildQuery(), { sort: sortOption.sort, limit: 12 })
      .then((page) => {
        if (!active) return;
        setItems(page.items);
        setCursor(page.next_cursor || null);
        setHasMore(Boolean(page.has_more));
      })
      .catch((err) => { if (active) setError(err.message || "Could not load listings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.toString(), fixedCategory]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await base44.entities.ProductListing.filter(buildQuery(), { sort: sortOption.sort, limit: 12, cursor });
      setItems((current) => [...current, ...page.items]);
      setCursor(page.next_cursor || null);
      setHasMore(Boolean(page.has_more));
    } catch (err) {
      setError(err.message || "Could not load more listings.");
    } finally {
      setLoadingMore(false);
    }
  };

  const activeCount = ["brand", "min", "max", "condition", "region", "verified"].filter((key) => params.get(key)).length + (fixedCategory ? 0 : params.get("category") ? 1 : 0);

  return (
    <section className="container-page py-10 lg:py-12">
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">AMANA marketplace</p>
          <h1 className="font-display text-[32px] leading-tight text-forest sm:text-[38px]">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border lg:hidden" onClick={() => setShowFilters((value) => !value)}>
            <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters{activeCount ? ` (${activeCount})` : ""}
          </Button>
          <Select value={values.sort} onValueChange={(value) => patch({ sort: value })}>
            <SelectTrigger className="w-[180px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SORTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[264px_1fr]">
        <aside className={showFilters ? "block" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-24">
            <MarketplaceFilters values={values} patch={patch} reset={reset} hideCategory={Boolean(fixedCategory)} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between text-[12.5px] text-muted-foreground">
            <span>{loading ? "Checking records…" : `${items.length}${hasMore ? "+" : ""} listing${items.length === 1 ? "" : "s"}`}</span>
            {values.q && <span>Results for “{values.q}”</span>}
          </div>

          {loading ? (
            <CardSkeletonGrid />
          ) : error ? (
            <EmptyState icon={SearchX} title="Listings could not load" description={error} actionLabel="Try again" onAction={() => patch({ _r: Date.now() })} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No listings match those filters"
              description="Try a wider price range, another region, or clear the filters to see everything available."
              actionLabel="Clear filters"
              onAction={reset}
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="border-forest/25 text-forest">
                    {loadingMore ? "Loading…" : "Load more listings"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}