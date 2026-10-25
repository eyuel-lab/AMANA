import { useParams } from "react-router-dom";
import MarketplaceView from "@/components/marketplace/MarketplaceView";
import { CATEGORIES } from "@/lib/constants";

export default function Category() {
  const { category } = useParams();
  const match = CATEGORIES.find((item) => item.slug === category);

  if (!match) {
    return (
      <MarketplaceView
        title="Unknown category"
        description="That category does not exist. Browse the full marketplace instead."
      />
    );
  }

  return (
    <MarketplaceView
      fixedCategory={match.slug}
      title={match.name}
      description={match.blurb + " Listings show seller verification and ownership-record status separately."}
    />
  );
}