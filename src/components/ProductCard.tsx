import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { PortfolioItem } from "@/lib/portfolio";

/**
 * Shared product card — used by the /products portal (heading level h3, under a
 * section h2) and by the per-category sub-portals (heading level h2, directly under
 * the page h1). The level is a prop so neither surface skips a heading level
 * (TC-CNT-031). Internal items render as a Next <Link>; external sites (Websites tier)
 * render as a real https <a target=_blank> — never a bare `#` (TC-CNT-012).
 *
 * RICH MODE (opt-in via `description` and/or `repoUrl`): used by the MMP sub-portal to
 * show a longer (~3-line) description + a GitHub button. Rendered as a <div> (NOT a
 * whole-card <Link>) so the GitHub <a> is never nested inside another anchor — the title
 * links to the detail page, the button links out. The portal teaser + flagships/websites
 * sub-portals pass neither prop and keep the compact whole-card-link form (short tagline).
 */

const cardClass =
  "group block rounded-xl border border-primary/5 bg-white/50 p-6 transition-all hover:border-accent/30 hover:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:hover:bg-surface";

// Rich/Beides cards are <div> (they carry a secondary GitHub/Website <a>, so the card
// itself can't be an <a>). `group relative` + the stretched "Mehr erfahren" link (see below)
// make the WHOLE card clickable to the detail page anyway; the hover affordance signals it.
const richCardClass =
  "group relative flex h-full flex-col rounded-xl border border-primary/5 bg-white/50 p-6 transition-all hover:border-accent/30 hover:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:hover:bg-surface";

// The "Mehr erfahren" link gets a stretched ::after overlay → clicking anywhere on the card
// navigates to the detail page (same as the link). Secondary buttons + the title link carry
// `relative z-10` to stay above the overlay and remain independently clickable.
const stretchedLinkClass = "after:absolute after:inset-0 after:content-['']";

function StatusBadge({ item }: { item: PortfolioItem }) {
  if (item.status === "preview") {
    return (
      <span className="shrink-0 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
        In Entwicklung
      </span>
    );
  }
  if (item.status === "external") {
    return (
      <span className="shrink-0 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
        Website
      </span>
    );
  }
  return null;
}

function CardBody({
  item,
  headingLevel,
  cta,
  description,
}: {
  item: PortfolioItem;
  headingLevel: "h2" | "h3";
  cta: string;
  /** Longer (≈3-line) card description; falls back to the short tagline. */
  description?: string;
}) {
  const Heading = headingLevel;
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <Heading className="font-heading text-lg font-semibold text-primary dark:text-text-primary">
          {item.name}
        </Heading>
        <StatusBadge item={item} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-dark/75 dark:text-text-secondary">
        {description ?? item.tagline}
      </p>
      <span className="mt-4 inline-block text-sm font-medium text-accent group-hover:text-accent-hover dark:text-accent-bright">
        {cta}
      </span>
    </>
  );
}

export function ProductCard({
  item,
  headingLevel = "h3",
  description,
  repoUrl,
}: {
  item: PortfolioItem;
  headingLevel?: "h2" | "h3";
  /** Rich mode: a longer card description (falls back to `item.tagline`). */
  description?: string;
  /** Rich mode: repository URL → renders a GitHub button (footer-right). */
  repoUrl?: string;
}) {
  // Rich mode (MMP cards) — a GitHub button is the defining feature, so it gates rich mode.
  // A `description` alone (websites, portal teaser, flagship) stays in the compact card below.
  if (repoUrl) {
    const Heading = headingLevel;
    return (
      <div className={richCardClass}>
        <div className="flex items-start justify-between gap-3">
          <Heading className="font-heading text-lg font-semibold text-primary dark:text-text-primary">
            <Link
              href={item.href}
              data-track={`product_card_${item.slug}`}
              className="relative z-10 transition-colors hover:text-accent dark:hover:text-accent-bright"
            >
              {item.name}
            </Link>
          </Heading>
          <StatusBadge item={item} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-neutral-dark/75 dark:text-text-secondary">
          {description ?? item.tagline}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            href={item.href}
            data-track={`product_card_more_${item.slug}`}
            className={`inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright ${stretchedLinkClass}`}
          >
            Mehr erfahren →
          </Link>
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track={`product_card_github_${item.slug}`}
              className="relative z-10 inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] dark:bg-text-primary dark:text-deep-space dark:hover:bg-text-primary/90"
            >
              GitHub
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // "Beides" mode (Websites tier with a case study): title/CTA → internal case-study
  // page, a separate "Website ↗" button → the live external domain. Rendered as a <div>
  // (not a whole-card link) so the external <a> is never nested inside another anchor.
  if (item.caseStudySlug) {
    const Heading = headingLevel;
    const detailHref = `/products/websites/${item.caseStudySlug}`;
    return (
      <div className={richCardClass}>
        <div className="flex items-start justify-between gap-3">
          <Heading className="font-heading text-lg font-semibold text-primary dark:text-text-primary">
            <Link
              href={detailHref}
              data-track={`product_card_${item.slug}`}
              className="relative z-10 transition-colors hover:text-accent dark:hover:text-accent-bright"
            >
              {item.name}
            </Link>
          </Heading>
          <StatusBadge item={item} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-neutral-dark/75 dark:text-text-secondary">
          {description ?? item.tagline}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            href={detailHref}
            data-track={`product_card_more_${item.slug}`}
            className={`inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright ${stretchedLinkClass}`}
          >
            Mehr erfahren →
          </Link>
          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track={`product_card_live_${item.slug}`}
              className="relative z-10 inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] dark:bg-text-primary dark:text-deep-space dark:hover:bg-text-primary/90"
            >
              Website
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    );
  }

  if (item.isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        data-track={`product_card_${item.slug}`}
        className={cardClass}
      >
        <CardBody item={item} headingLevel={headingLevel} cta="Website öffnen ↗" description={description} />
      </a>
    );
  }
  return (
    <Link href={item.href} data-track={`product_card_${item.slug}`} className={cardClass}>
      <CardBody item={item} headingLevel={headingLevel} cta="Mehr erfahren →" description={description} />
    </Link>
  );
}
