import { ExternalLink } from "lucide-react";
import type { SkillCardData } from "@/lib/skill-cards";

/**
 * Rich OSS-tool card — the detailed "skill card" (icon + Beta badge + description +
 * capability list + license + GitHub button). Presentational + data-driven: one card
 * = one component, the grid is the parent's job. Reused on the Skills sub-portal (in a
 * 2-col grid) and — as a single full-width summary element — at the top of the matching
 * detail page. Lifted 1:1 from the former landing-page OSS section.
 *
 * `headingLevel` is a prop so the card never forces a heading skip: it sits under a
 * section h2 on a listing (→ "h3") or directly under a page h1 (→ "h2"). Default "h3".
 */
export function SkillCard({
  card,
  headingLevel = "h3",
}: {
  card: SkillCardData;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const Icon = card.icon;

  return (
    <div className="flex flex-col rounded-xl border border-primary/10 bg-white p-8 shadow-sm dark:border-text-secondary/10 dark:bg-surface">
      <div className="flex items-center gap-3">
        <Icon size={28} className="text-secondary" aria-hidden="true" />
        {card.badge && (
          <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent-hover dark:bg-accent/20 dark:text-accent-bright">
            {card.badge}
          </span>
        )}
      </div>

      <Heading className="mt-4 font-heading text-xl font-semibold text-primary dark:text-text-primary">
        {card.title}
      </Heading>

      <p className="mt-2 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
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

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-xs font-medium text-muted dark:text-text-tertiary">
          {card.license}
        </span>
        <a
          href={card.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] dark:bg-text-primary dark:text-deep-space dark:hover:bg-text-primary/90"
          data-track={card.track}
        >
          GitHub
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
