import type { ReactNode } from "react";

/**
 * Shared frame for a blog figure built from HTML rather than an image.
 *
 * The caption sits on top as the figure's title (a reader scanning the article meets the
 * figure's point first), the source line at the bottom. Every text here is at least 14px,
 * per point 5 of OGC's blog UX standard (`docs/blog-ux-standard.md`): nothing a reader must
 * read sits below that floor.
 */
export function BlogFigure({
  id,
  caption,
  source,
  children,
}: {
  id: string;
  caption: string;
  source?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure
      id={id}
      data-figure={id}
      className="my-12 rounded-2xl border border-primary/10 bg-white px-4 py-6 md:px-8 md:py-8 dark:border-white/10 dark:bg-surface"
    >
      <figcaption className="font-heading text-lg font-semibold text-primary md:text-xl dark:text-text-primary">
        {caption}
      </figcaption>
      <div className="mt-6">{children}</div>
      {source && (
        <p className="mt-6 border-t border-primary/10 pt-4 text-sm leading-relaxed text-muted dark:border-white/10 dark:text-text-tertiary">
          {source}
        </p>
      )}
    </figure>
  );
}

/** A small heading inside a figure. H3, because figures sit inside an H2 section of the post. */
export function FigureHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-heading text-base font-semibold text-primary dark:text-text-primary">{children}</h3>
  );
}

/** Risk level badge. TM1 is filled, TM2 outlined in the accent, TM3 outlined and quiet. */
export function TierChip({ tier }: { tier: "TM1" | "TM2" | "TM3" }) {
  const look = {
    TM1: "border-primary bg-primary text-white dark:border-accent-bright dark:bg-accent-bright dark:text-deep-space",
    TM2: "border-accent text-accent dark:border-accent-bright dark:text-accent-bright",
    TM3: "border-muted/50 text-muted dark:border-text-tertiary/60 dark:text-text-tertiary",
  }[tier];
  return (
    <span
      className={`inline-flex min-w-[3.25rem] justify-center rounded-full border px-2.5 py-0.5 text-sm font-semibold tabular-nums ${look}`}
    >
      {tier}
    </span>
  );
}

/** The "neu" marker of Lenin's sheets. */
export function NewChip() {
  // Solid fill, not a tint: the chip sits on white, on the light table rows AND on the teal
  // Snapshot bar, and a 10% accent tint over that teal measured 3.81:1 (Lighthouse,
  // 2026-11-05). accent-active on white holds on every one of those grounds.
  return (
    <span className="ml-2 inline-flex rounded-full border border-accent/40 bg-white px-2 py-0.5 align-middle text-sm font-semibold text-accent-active dark:border-accent-bright/40 dark:bg-deep-space dark:text-accent-bright">
      neu
    </span>
  );
}
