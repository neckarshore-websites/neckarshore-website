import type { Metadata } from "next";
import ProductDetailPage, {
  productDetailMetadata,
} from "@/components/ProductDetailPage";

const SLUG = "snakeoil-check";

export function generateMetadata(): Metadata {
  return productDetailMetadata({
    slug: SLUG,
    title:
      "Snakeoil-Check — Reality-Check für Coaching-Angebote | neckarshore.ai",
  });
}

export default function SnakeoilCheckPage() {
  return (
    <ProductDetailPage
      slug={SLUG}
      liveCtaNote="Ein kostenloser Check zum Start — weitere als Shot-Paket."
    />
  );
}
