import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import type { SkillCardData } from "@/lib/skill-cards";

/**
 * Rich OSS-tool card — follows the SAME unified four-corner layout as <ProductCard>
 * (2026-06-22), so the whole products surface reads as one system:
 *
 *   ┌───────────────────────────────────────────────┐
 *   │ Icon + Title (top-left)        GitHub ↗ (TR)    │
 *   │   description · capability list                 │
 *   │ [StatusPill] + license (BL)     Mehr erfahren →(BR)│
 *   └───────────────────────────────────────────────┘
 *
 * The status pill carries the skill's MATURITY — "Beta" for the OSS tools, "Referenz-
 * Beispiel" for the private reference skill (`badge ?? footerBadge`). The OSS license sits
 * as small text next to it. Used both as a listing card (h2/h3 + `detailHref`) and as the
 * detail-page hero (h1, no `detailHref` → no "Mehr erfahren", you are already there).
 *
 * When `detailHref` is set the whole card is clickable: a stretched ::after on the
 * "Mehr erfahren" link covers the card; the title link + GitHub button carry `relative z-10`
 * to stay independently clickable. See docs/card-layout.md.
 */
export function SkillCard({
  card,
  headingLevel = "h3",
  id,
  detailHref,
}: {
  card: SkillCardData;
  headingLevel?: "h1" | "h2" | "h3";
  /** Optional anchor id — the on-page overview table bookmarks jump to `#<id>`. */
  id?: string;
  /** Optional detail-page URL — lights up the title link + "Mehr erfahren →" CTA + whole-card click. */
  detailHref?: string;
}) {
  const Heading = headingLevel;
  const Icon = card.icon;
  // As a detail-page hero (h1) the title scales up to read as a page title; in a listing
  // grid (h2/h3) it stays compact.
  const titleClass = headingLevel === "h1" ? "text-2xl md:text-3xl" : "text-xl";
  const detailTrack = card.track ? `${card.track}_detail` : undefined;
  const clickable = !!detailHref;
  const pill = card.badge ?? card.footerBadge;

  const cardClass = `flex flex-col rounded-xl border border-primary/10 bg-white p-8 shadow-sm dark:border-text-secondary/10 dark:bg-surface${
    clickable ? " group relative transition-all hover:border-accent/30 hover:shadow-md" : ""
  }`;
  const stretchedLink = "after:absolute after:inset-0 after:content-['']";

  return (
    <div id={id} className={cardClass}>
      {/* Top row: icon + title (top-left, same height as) the GitHub button (top-right). */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon size={28} className="shrink-0 text-secondary" aria-hidden="true" />
          <Heading
            className={`font-heading font-semibold text-primary dark:text-text-primary ${titleClass}`}
          >
            {detailHref ? (
              <Link
                href={detailHref}
                className="relative z-10 transition-colors hover:text-accent dark:hover:text-accent-bright"
                data-track={detailTrack}
              >
                {card.title}
              </Link>
            ) : (
              card.title
            )}
          </Heading>
        </div>
        {card.repoUrl && (
          <a
            href={card.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] dark:bg-text-primary dark:text-deep-space dark:hover:bg-text-primary/90"
            data-track={card.track}
          >
            GitHub
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
        {card.description}
      </p>

      <div className="mt-5 space-y-2.5">
        {card.capabilities.map((cap) => (
          <div
            key={cap.code}
            className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3"
          >
            <code className="inline-block w-[140px] shrink-0 rounded bg-primary/5 px-2 py-0.5 text-center text-xs font-semibold text-accent-hover dark:bg-text-secondary/10 dark:text-accent-bright">
              {cap.code}
            </code>
            <span className="text-sm leading-snug text-neutral-dark/75 dark:text-text-secondary/80">
              {cap.text}
            </span>
          </div>
        ))}
      </div>

      {card.moreNote && (
        <p className="mt-4 text-xs italic text-muted dark:text-text-tertiary">
          {card.moreNote}
        </p>
      )}

      {/* Footer: status pill (+ license) bottom-left, "Mehr erfahren →" bottom-right. */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <div className="flex items-center gap-2">
          {pill ? <StatusPill label={pill} /> : <span aria-hidden="true" />}
          {card.license && (
            <span className="text-xs font-medium text-muted dark:text-text-tertiary">
              {card.license}
            </span>
          )}
        </div>
        {detailHref ? (
          <Link
            href={detailHref}
            className={`inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright ${stretchedLink}`}
            data-track={detailTrack}
          >
            Mehr erfahren →
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
