import type { Metadata } from "next";
import PreviewProductPage, {
  previewProductMetadata,
} from "@/components/PreviewProductPage";

const SLUG = "snakeoil-check";

export function generateMetadata(): Metadata {
  return previewProductMetadata({
    slug: SLUG,
    title:
      "Snakeoil-Check — neutraler Reality-Check für Coaching-Angebote | neckarshore.ai",
  });
}

export default function SnakeoilCheckPage() {
  return (
    <PreviewProductPage
      slug={SLUG}
      liveCtaNote="Ein kostenloser Check zum Start — weitere als Shot-Paket."
    />
  );
}
