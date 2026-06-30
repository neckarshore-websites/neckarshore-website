import type { Metadata } from "next";
import SubPortal from "@/components/SubPortal";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO, categoryMetaTitle } from "@/lib/portfolio";
import { MMP_CARDS } from "@/lib/mmp-cards";

const category = PORTFOLIO.find((c) => c.id === "mmps")!;
const description =
  "Unsere Minimum Marketable Products — schlanke, fokussierte Produkte auf dem Weg zur Marktreife. ClearPath und Snakeoil-Check sind am weitesten.";

export const metadata: Metadata = pageMetadata({
  title: categoryMetaTitle(category),
  description,
  path: category.href,
});

export default function MmpsPage() {
  // Rich MMP cards: the longer description + GitHub link come from MMP_CARDS (server-only),
  // joined by slug. Any item without a rich entry falls back to the compact ProductCard.
  return (
    <SubPortal category={category} description={description}>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {category.items.map((item) => {
          const rich = MMP_CARDS[item.slug];
          return (
            <ProductCard
              key={item.slug}
              item={item}
              headingLevel="h2"
              description={rich?.description}
              repoUrl={rich?.repoUrl}
              liveUrl={rich?.liveUrl}
            />
          );
        })}
      </div>
    </SubPortal>
  );
}
