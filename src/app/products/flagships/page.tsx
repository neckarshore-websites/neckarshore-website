import type { Metadata } from "next";
import SubPortal from "@/components/SubPortal";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO } from "@/lib/portfolio";

const category = PORTFOLIO.find((c) => c.id === "flagships")!;
const description =
  "Unser Flaggschiff-Produkt: Omnopsis, die KI-first Documentation Engine — fail-closed, BYOLLM, DSGVO-by-Design.";

export const metadata: Metadata = pageMetadata({
  title: `${category.title} — neckarshore.ai`,
  description,
  path: category.href,
});

export default function FlagshipsPage() {
  return <SubPortal category={category} description={description} />;
}
