import type { Metadata } from "next";
import SubPortal from "@/components/SubPortal";
import { SkillCard } from "@/components/SkillCard";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO } from "@/lib/portfolio";
import { SKILL_CARDS } from "@/lib/skill-cards";

const category = PORTFOLIO.find((c) => c.id === "skills")!;
const description =
  "Fokussierte Open-Source-Werkzeuge — Claude-Skills und kleine Apps, die genau ein Problem gut lösen.";

export const metadata: Metadata = pageMetadata({
  title: `${category.title} — neckarshore.ai`,
  description,
  path: category.href,
});

export default function SkillsPage() {
  return (
    <SubPortal category={category} description={description} wide>
      {/* Rich skill cards (one per portfolio item, in portfolio order). Heading level
          h2 — directly under the page h1, no skip. Falls back to the plain ProductCard
          for any item that has no rich card data yet.

          Grid breakpoint is lg (1024px), NOT md: at tablet-portrait width (768px) two
          rich cards get cramped, so we stay single-column there (full-width, readable)
          and only split into two columns at tablet-landscape / desktop. */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {category.items.map((item) => {
          const card = SKILL_CARDS[item.slug];
          return card ? (
            <SkillCard key={item.slug} card={card} headingLevel="h2" />
          ) : (
            <ProductCard key={item.slug} item={item} headingLevel="h2" />
          );
        })}
      </div>
    </SubPortal>
  );
}
