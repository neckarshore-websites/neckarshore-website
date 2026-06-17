import type { Metadata } from "next";
import SubPortal from "@/components/SubPortal";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO } from "@/lib/portfolio";

const category = PORTFOLIO.find((c) => c.id === "mmps")!;
const description =
  "Unsere Minimum Marketable Products — schlanke, fokussierte Produkte auf dem Weg zur Marktreife. ClearPath und Snakeoil-Check sind am weitesten.";

export const metadata: Metadata = pageMetadata({
  title: `${category.title} — neckarshore.ai`,
  description,
  path: category.href,
});

export default function MmpsPage() {
  return <SubPortal category={category} description={description} />;
}
