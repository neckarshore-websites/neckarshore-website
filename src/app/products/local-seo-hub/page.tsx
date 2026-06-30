import type { Metadata } from "next";
import ProductDetailPage, {
  productDetailMetadata,
} from "@/components/ProductDetailPage";

const SLUG = "local-seo-hub";

export function generateMetadata(): Metadata {
  return productDetailMetadata({
    slug: SLUG,
    title: "Local-SEO-Hub — lokale Sichtbarkeit als ein Score | neckarshore.ai",
  });
}

export default function LocalSeoHubPage() {
  return <ProductDetailPage slug={SLUG} />;
}
