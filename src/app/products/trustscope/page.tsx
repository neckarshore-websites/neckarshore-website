import type { Metadata } from "next";
import ProductDetailPage, {
  productDetailMetadata,
} from "@/components/ProductDetailPage";

const SLUG = "trustscope";

export function generateMetadata(): Metadata {
  return productDetailMetadata({
    slug: SLUG,
    title: "TrustScope — Trust-Report für Open Source | neckarshore.ai",
  });
}

export default function TrustScopePage() {
  return (
    <ProductDetailPage
      slug={SLUG}
      liveCtaNote="Kostenlos und ohne Anmeldung — GitHub-Login nur fürs Ein-Klick-Filing."
    />
  );
}
