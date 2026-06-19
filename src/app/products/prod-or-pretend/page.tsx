import type { Metadata } from "next";
import PreviewProductPage, {
  previewProductMetadata,
} from "@/components/PreviewProductPage";

const SLUG = "prod-or-pretend";

export function generateMetadata(): Metadata {
  return previewProductMetadata({
    slug: SLUG,
    title: "Prod-or-Pretend — Qualitäts-Spiegel für Tech-Hype | neckarshore.ai",
  });
}

export default function ProdOrPretendPage() {
  return <PreviewProductPage slug={SLUG} />;
}
