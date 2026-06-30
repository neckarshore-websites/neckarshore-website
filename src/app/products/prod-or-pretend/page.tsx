import type { Metadata } from "next";
import ProductDetailPage, {
  productDetailMetadata,
} from "@/components/ProductDetailPage";

const SLUG = "prod-or-pretend";

export function generateMetadata(): Metadata {
  return productDetailMetadata({
    slug: SLUG,
    title: "Prod-or-Pretend — Qualitäts-Spiegel für Tech-Hype | neckarshore.ai",
  });
}

export default function ProdOrPretendPage() {
  return <ProductDetailPage slug={SLUG} />;
}
