import type { Metadata } from "next";
import SubPortal from "@/components/SubPortal";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO, categoryMetaTitle } from "@/lib/portfolio";

const category = PORTFOLIO.find((c) => c.id === "websites")!;
// ≤155 chars: doubles as the on-page sub-portal intro AND <meta description> (audit P2-2).
const description =
  "Echte Web-Projekte für Kunden und eigene Marken — nebenbei entstanden, mit derselben Sorgfalt wie unsere Produkte: KI-beschleunigt, DSGVO-by-Design.";

export const metadata: Metadata = pageMetadata({
  title: categoryMetaTitle(category),
  description,
  path: category.href,
});

export default function WebsitesPage() {
  return <SubPortal category={category} description={description} />;
}
