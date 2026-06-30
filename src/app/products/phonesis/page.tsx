import type { Metadata } from "next";
import ProductDetailPage, {
  productDetailMetadata,
} from "@/components/ProductDetailPage";

const SLUG = "phonesis";

export function generateMetadata(): Metadata {
  return productDetailMetadata({
    slug: SLUG,
    title:
      "Phonesis Voicebank — Stimmenarchiv für Familien | neckarshore.ai",
  });
}

export default function PhonesisPage() {
  return <ProductDetailPage slug={SLUG} ctaName="Phonesis" />;
}
