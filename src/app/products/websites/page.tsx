import type { Metadata } from "next";
import SubPortal from "@/components/SubPortal";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO } from "@/lib/portfolio";

const category = PORTFOLIO.find((c) => c.id === "websites")!;
const description =
  "Web-Präsenzen, die wir nebenbei bauen — Beifang zum Kerngeschäft. Dieselbe Arbeitsweise: schnell, sauber, DSGVO-by-Design.";

export const metadata: Metadata = pageMetadata({
  title: `${category.title} — neckarshore.ai`,
  description,
  path: category.href,
});

export default function WebsitesPage() {
  return <SubPortal category={category} description={description} />;
}
