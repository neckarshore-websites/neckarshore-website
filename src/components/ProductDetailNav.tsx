import type { ReactNode } from "react";
import Link from "next/link";
import { categoryForSlug, siblingNav } from "@/lib/portfolio";

/**
 * Bottom-of-page product navigation — the A/B experiment.
 *
 * The category a slug belongs to decides the variant, so this ONE component owns the
 * whole A/B split and flipping the winner later is a one-file change:
 *
 *   • Variante A — "Durchblättern" (Skills): within-category prev/next siblings +
 *     "Alle <Kategorie>". Browse item → item without going up.
 *   • Variante B — "Flach" (everything else): a single "← Alle Produkte" link.
 *
 * Distinct `aria-label` from the top `<Breadcrumbs>` ("Brotkrumen") so two nav
 * landmarks on the same page stay axe `landmark-unique`-clean (hard a11y@95 gate).
 *
 * `cta` is the page's own call-to-action (Calendly / GitHub …) threaded through with
 * its `data-track` intact — never dropped when this replaces the old bottom block.
 */
export function ProductDetailNav({
  slug,
  cta,
}: {
  slug: string;
  /** Optional page CTA (already-styled link), rendered in the same footer row. */
  cta?: ReactNode;
}) {
  const category = categoryForSlug(slug);
  const linkClass =
    "text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright";

  // Variante A — "Durchblättern": Skills pages browse sibling → sibling.
  if (category?.id === "skills") {
    const { prev, next } = siblingNav(slug);
    const singular = category.title.replace(/s$/, ""); // "Skills" → "Skill"
    const tile =
      "group rounded-xl border border-primary/10 p-4 transition-colors hover:border-accent/40 dark:border-text-secondary/10";
    const eyebrow =
      "block text-xs font-medium uppercase tracking-wider text-muted dark:text-text-tertiary";
    const itemName =
      "mt-1 block font-medium text-primary transition-colors group-hover:text-accent dark:text-text-primary";

    return (
      <nav
        aria-label="Im Portfolio blättern"
        className="mt-12 border-t border-primary/5 pt-8 dark:border-text-secondary/10"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={prev.href}
              data-track={`product_browse_prev_${prev.slug}`}
              className={tile}
            >
              <span className={eyebrow}>← Vorheriger {singular}</span>
              <span className={itemName}>{prev.name}</span>
            </Link>
          ) : (
            <div className="hidden sm:block" aria-hidden="true" />
          )}
          {next ? (
            <Link
              href={next.href}
              data-track={`product_browse_next_${next.slug}`}
              className={`${tile} sm:text-right`}
            >
              <span className={eyebrow}>Nächster {singular} →</span>
              <span className={itemName}>{next.name}</span>
            </Link>
          ) : (
            <div className="hidden sm:block" aria-hidden="true" />
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link
            href={category.href}
            data-track={`product_browse_all_${category.id}`}
            className={linkClass}
          >
            Alle {category.title}
          </Link>
          {cta}
        </div>
      </nav>
    );
  }

  // Variante B — "Flach": single back-link, minimal.
  return (
    <nav
      aria-label="Weitere Produkte"
      className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-primary/5 pt-8 dark:border-text-secondary/10"
    >
      <Link href="/products" data-track="product_nav_all_products" className={linkClass}>
        ← Alle Produkte
      </Link>
      {cta}
    </nav>
  );
}
