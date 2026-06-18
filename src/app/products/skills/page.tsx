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

/**
 * A skill has a real detail page once its content has landed (indexable, noindex
 * dropped). Today that is only OVA (hasOwnPage); the rest are noindex skeletons.
 * `detailHref` is the off-page target; skeletons fall back to the in-page card anchor.
 */
function detailHrefFor(item: (typeof category.items)[number]): string | undefined {
  return !item.isExternal && !item.noindex ? item.href : undefined;
}

// On-page overview: name + the one problem it solves + code visibility + status. The
// Tool name links to the detail page when one exists ("Beides" nav), else jumps to the
// matching card below. Built from the same PORTFOLIO order + SKILL_CARDS data the cards
// render from — single source, no drift.
const overviewRows = category.items.map((item) => {
  const card = SKILL_CARDS[item.slug];
  const detail = detailHrefFor(item);
  return {
    slug: item.slug,
    title: card?.title ?? item.name,
    summary: card?.summary ?? item.tagline,
    status: card?.badge ?? (card?.footerBadge ? "Referenz" : null),
    visibility: card?.visibility ?? null,
    href: detail ?? `#${item.slug}`,
    hasDetail: Boolean(detail),
  };
});

export default function SkillsPage() {
  return (
    <SubPortal category={category} description={description} wide>
      {/* Overview table — Tool name → detail page (when one exists) or jumps to the
          matching card below. Spans the full content width (= the two-card grid). */}
      <section aria-labelledby="skills-overview-heading" className="mt-10">
        <h2
          id="skills-overview-heading"
          className="font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary"
        >
          Übersicht
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-primary/10 dark:border-text-secondary/10">
          <table className="w-full table-fixed text-left text-sm">
            <thead>
              <tr className="bg-primary/5 dark:bg-text-secondary/5">
                <th
                  scope="col"
                  className="w-[34%] px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary sm:w-[26%]"
                >
                  Tool
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary"
                >
                  Löst
                </th>
                <th
                  scope="col"
                  className="w-[20%] px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary sm:w-[14%]"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="w-[20%] px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary sm:w-[15%]"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {overviewRows.map((row) => (
                <tr
                  key={row.slug}
                  className="border-t border-primary/10 dark:border-text-secondary/10"
                >
                  <th scope="row" className="px-4 py-3 align-top font-normal">
                    <a
                      href={row.href}
                      className="font-medium text-accent underline-offset-2 hover:underline dark:text-accent-bright"
                      data-track={
                        row.hasDetail ? `skills_detail_${row.slug}` : `skills_jump_${row.slug}`
                      }
                    >
                      {row.title}
                    </a>
                  </th>
                  <td className="px-4 py-3 align-top text-neutral-dark/80 dark:text-text-secondary">
                    {row.summary}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {row.visibility && (
                      <span
                        className={
                          row.visibility === "public"
                            ? "inline-block whitespace-nowrap rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-hover dark:bg-accent/20 dark:text-accent-bright"
                            : "inline-block whitespace-nowrap rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-muted dark:bg-text-secondary/10 dark:text-text-tertiary"
                        }
                      >
                        {row.visibility === "public" ? "Public" : "Privat"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {row.status && (
                      <span className="inline-block whitespace-nowrap rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
                        {row.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rich skill cards (one per portfolio item, in portfolio order). Heading level
          h2 — directly under the page h1, no skip. id = portfolio slug so the overview
          table bookmarks land on the matching card. `detailHref` lights up the title
          link + "Mehr erfahren →" CTA for skills with a real detail page. Falls back to
          the plain ProductCard for any item that has no rich card data yet.

          Grid breakpoint is lg (1024px), NOT md: at tablet-portrait width (768px) two
          rich cards get cramped, so we stay single-column there (full-width, readable)
          and only split into two columns at tablet-landscape / desktop. */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {category.items.map((item) => {
          const card = SKILL_CARDS[item.slug];
          return card ? (
            <SkillCard
              key={item.slug}
              card={card}
              headingLevel="h2"
              id={item.slug}
              detailHref={detailHrefFor(item)}
            />
          ) : (
            <ProductCard key={item.slug} item={item} headingLevel="h2" />
          );
        })}
      </div>
    </SubPortal>
  );
}
