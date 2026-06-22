import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { statusPillLabel, type PortfolioItem } from "@/lib/portfolio";

/**
 * Shared product card — the unified four-corner layout (2026-06-22), identical across the
 * MMP / flagship / website / portal-teaser surfaces and mirrored by <SkillCard>:
 *
 *   ┌───────────────────────────────────────────────┐
 *   │ Title (top-left)        GitHub / Website ↗ (TR) │
 *   │   … description …                               │
 *   │ [StatusPill] (BL)            Mehr erfahren → (BR)│
 *   └───────────────────────────────────────────────┘
 *
 * Every card is a <div> (so a secondary GitHub/Website <a> is never nested in an anchor)
 * whose whole surface is clickable via a stretched ::after on the bottom-right CTA link.
 * The title link + the top-right link carry `relative z-10` to stay above that overlay and
 * remain independently clickable. The heading level is a prop so no surface skips a level
 * (portal h3 under a section h2, sub-portal h2 under the page h1 — TC-CNT-031).
 *
 * Per-variant differences (the only things that change):
 *   - MMP (repoUrl set)      → top-right = GitHub button; CTA → internal detail page.
 *   - Website (caseStudySlug)→ top-right = "Website ↗"; CTA → internal case-study page.
 *   - Flagship / internal    → no top-right link; CTA → internal detail page.
 *   - Pure external (no case study) → no top-right link; CTA = "Website öffnen ↗" external.
 *
 * See docs/card-layout.md for the principle.
 */

const cardClass =
  "group relative flex h-full flex-col rounded-xl border border-primary/5 bg-white/50 p-6 transition-all hover:border-accent/30 hover:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:hover:bg-surface";

// Stretched ::after on the CTA → the WHOLE card navigates to the CTA target.
const stretchedLinkClass = "after:absolute after:inset-0 after:content-['']";

const titleLinkClass =
  "relative z-10 transition-colors hover:text-accent dark:hover:text-accent-bright";
const secondaryButtonClass =
  "relative z-10 inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] dark:bg-text-primary dark:text-deep-space dark:hover:bg-text-primary/90";
const ctaClass =
  "inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright";

export function ProductCard({
  item,
  headingLevel = "h3",
  description,
  repoUrl,
}: {
  item: PortfolioItem;
  headingLevel?: "h2" | "h3";
  /** Rich mode: a longer (≈3-line) card description (falls back to `item.tagline`). */
  description?: string;
  /** MMP mode: repository URL → renders the GitHub button (top-right). */
  repoUrl?: string;
}) {
  const Heading = headingLevel;
  const isWebsite = !!item.caseStudySlug;
  // Pure external = an external item with no internal case-study page (CTA leaves the site).
  const externalCta = item.isExternal && !isWebsite;
  const ctaHref = isWebsite ? `/products/websites/${item.caseStudySlug}` : item.href;
  const ctaLabel = externalCta ? "Website öffnen ↗" : "Mehr erfahren →";

  // Top-right secondary link: GitHub (MMP) or "Website ↗" (website tier); none otherwise.
  const topRight = repoUrl
    ? { href: repoUrl, label: "GitHub", track: `product_card_github_${item.slug}` }
    : isWebsite && item.liveUrl
      ? { href: item.liveUrl, label: "Website", track: `product_card_live_${item.slug}` }
      : null;

  const pill = statusPillLabel(item);

  return (
    <div className={cardClass}>
      {/* Top row: title left, GitHub/Website link top-right (same height). */}
      <div className="flex items-start justify-between gap-3">
        <Heading className="font-heading text-lg font-semibold text-primary dark:text-text-primary">
          {externalCta ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              data-track={`product_card_${item.slug}`}
              className={titleLinkClass}
            >
              {item.name}
            </a>
          ) : (
            <Link href={ctaHref} data-track={`product_card_${item.slug}`} className={titleLinkClass}>
              {item.name}
            </Link>
          )}
        </Heading>
        {topRight && (
          <a
            href={topRight.href}
            target="_blank"
            rel="noopener noreferrer"
            data-track={topRight.track}
            className={secondaryButtonClass}
          >
            {topRight.label}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-neutral-dark/75 dark:text-text-secondary">
        {description ?? item.tagline}
      </p>

      {/* Footer: status pill bottom-left, CTA (the stretched whole-card link) bottom-right. */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        {pill ? <StatusPill label={pill} /> : <span aria-hidden="true" />}
        {externalCta ? (
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            data-track={`product_card_more_${item.slug}`}
            className={`${ctaClass} ${stretchedLinkClass}`}
          >
            {ctaLabel}
          </a>
        ) : (
          <Link
            href={ctaHref}
            data-track={`product_card_more_${item.slug}`}
            className={`${ctaClass} ${stretchedLinkClass}`}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
