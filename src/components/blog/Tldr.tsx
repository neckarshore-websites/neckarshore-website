import { Prose } from "@/components/Prose";

/**
 * "TL;DR / Zusammenfassung" at the top of an article — OGC's callout (globals.css .ogc-tldr),
 * in neckarshore's tokens. Same gesture: a short accent line above an uppercase eyebrow, the
 * summary in body size (OGC user feedback 2026-04-18: a bigger font read as louder than the
 * text below, not as more important), a hairline under it. The eyebrow is 14px rather than
 * OGC's 12px, because this blog keeps every text at or above 14px (TC-BLOG-023).
 *
 * `html` comes from renderMarkdown() at build time (sanitised), as for the body.
 */
export function Tldr({ html }: { html: string }) {
  return (
    <aside
      data-tldr
      aria-label="TL;DR – Zusammenfassung"
      className="border-b border-primary/10 pb-8 dark:border-white/10"
    >
      <p className="relative pt-3 text-sm font-semibold uppercase tracking-wider text-accent before:absolute before:left-0 before:top-0 before:h-[2px] before:w-9 before:bg-accent dark:text-accent-bright dark:before:bg-accent-bright">
        TL;DR / Zusammenfassung
      </p>
      <div className="mt-2 [&_p]:my-0">
        <Prose html={html} />
      </div>
    </aside>
  );
}
