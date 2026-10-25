import { useSearchParams } from "react-router-dom";
import MarketplaceView from "@/components/marketplace/MarketplaceView";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  return (
    <MarketplaceView
      title={query ? "Search results" : "Search the marketplace"}
      description={
        query
          ? `Listings matching “${query}”. Refine with the filters to narrow by price, condition or region.`
          : "Search by title, brand or model. Refine with the filters to narrow by price, condition or region."
      }
    />
  );
}