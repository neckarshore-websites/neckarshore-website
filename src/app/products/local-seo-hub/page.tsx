import type { Metadata } from "next";
import PreviewProductPage, {
  previewProductMetadata,
} from "@/components/PreviewProductPage";

const SLUG = "local-seo-hub";

export function generateMetadata(): Metadata {
  return previewProductMetadata({
    slug: SLUG,
    title: "Local-SEO-Hub — lokale Sichtbarkeit als ein Score | neckarshore.ai",
  });
}

export default function LocalSeoHubPage() {
  return <PreviewProductPage slug={SLUG} />;
}
