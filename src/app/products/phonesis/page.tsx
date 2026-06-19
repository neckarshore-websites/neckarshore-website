import type { Metadata } from "next";
import PreviewProductPage, {
  previewProductMetadata,
} from "@/components/PreviewProductPage";

const SLUG = "phonesis";

export function generateMetadata(): Metadata {
  return previewProductMetadata({
    slug: SLUG,
    title:
      "Phonesis Voicebank — Stimmenarchiv für Familien & Institutionen | neckarshore.ai",
  });
}

export default function PhonesisPage() {
  return <PreviewProductPage slug={SLUG} ctaName="Phonesis" />;
}
