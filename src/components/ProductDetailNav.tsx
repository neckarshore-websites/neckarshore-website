import type { ReactNode } from "react";
import Link from "next/link";
import { categoryForSlug, siblingNav } from "@/lib/portfolio";

/**
 * End-of-page portfolio navigation — uniform on EVERY product detail page (Founder
 * decision 2026-06-20: no long-vs-short / per-category split; anchor one variant on
 * all templates).
 *
 * One quiet inline row: previous sibling · "Alle <Kategorie>" · next sibling — browse
 * item → item within a category without going up. Degrades gracefully: a category
 * with no siblings (e.g. the lone flagship) shows just "Alle <Kategorie>".
 *
 * Distinct `aria-label` from the top `<Breadcrumbs>` ("Brotkrumen") keeps two nav
 * landmarks on one page axe `landmark-unique`-clean. The page's own CTA is threaded
 * through as `cta` with its `data-track` intact; sibling links carry `product_browse_*`
 * track ids so browse usage stays measurable in analytics.
 */
export function ProductDetailNav({
  slug,
  cta,
  hideCtaOnDesktop = false,
}: {
  slug: string;
  /** Optional page CTA (already-styled link), rendered centered below the row. */
  cta?: ReactNode;
  /**
   * Hide the CTA from `lg` upward (≥1024px). The desktop header pins a persistent
   * "Kennenlerntermin" CTA at exactly this breakpoint, so an end-of-page repeat is a
   * duplicate on desktop — but the mobile header tucks its CTA inside the hamburger,
   * so the end-of-page CTA is the only in-flow one there and must stay. Founder
   * request 2026-06-22.
   */
  hideCtaOnDesktop?: boolean;
}) {
  const category = categoryForSlug(slug);
  const { prev, next } = siblingNav(slug);
  const accentLink =
    "text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright";

  return (
    <nav
      aria-label="Weitere Produkte"
      className="mt-12 border-t border-primary/5 pt-8 dark:border-text-secondary/10"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
        {prev && (
          <Link
            href={prev.href}
            data-track={`product_browse_prev_${prev.slug}`}
            className={accentLink}
          >
            ← {prev.name}
          </Link>
        )}
        {category ? (
          <Link
            href={category.href}
            data-track={`product_browse_all_${category.id}`}
            className="text-sm font-medium text-muted transition-colors hover:text-accent dark:text-text-tertiary"
          >
            Alle {category.title}
          </Link>
        ) : (
          <Link href="/products" data-track="product_nav_all_products" className={accentLink}>
            ← Alle Produkte
          </Link>
        )}
        {next && (
          <Link
            href={next.href}
            data-track={`product_browse_next_${next.slug}`}
            className={accentLink}
          >
            {next.name} →
          </Link>
        )}
      </div>
      {cta && (
        <div className={`mt-4 text-center${hideCtaOnDesktop ? " lg:hidden" : ""}`}>
          {cta}
        </div>
      )}
    </nav>
  );
}
