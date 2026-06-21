import { JsonLd } from "@/components/JsonLd";
import { getItemBySlug } from "@/lib/portfolio";

/**
 * Shared FAQ primitive for product detail pages.
 *
 * Renders the visible <details>/<summary> "Häufige Fragen" section AND — only on an
 * INDEXABLE page — emits a FAQPage JSON-LD block for GEO / AI-citation pickup.
 *
 * Indexability is derived from the portfolio `noindex` flag (single source of truth):
 *   - indexable page  → visible FAQ + FAQPage schema (the GEO payload).
 *   - noindex preview → visible FAQ for human visitors, NO schema. Google never crawls
 *     a noindex page, so the FAQPage markup would be dead weight. When the preview
 *     launches and `noindex` drops in portfolio.ts, the schema activates automatically
 *     (AP-1: one config flag, two effects). No per-page wiring to remember.
 *
 * Server component → the JSON-LD lands in the SSR HTML, where the crawler reads it (AD-19).
 *
 * The visible markup is byte-identical to the FAQ section the SkillDetailPage template
 * shipped (social-scrapers, imap-mailbox-cleanup) — this component is the extraction of
 * that one block so every page type (bespoke flagship, preview MMP, website case study,
 * skill template) renders the exact same FAQ.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export function ProductFaq({
  slug,
  items,
  indexable,
}: {
  /** Portfolio slug — drives the JSON-LD id and the noindex lookup. */
  slug: string;
  /** The Q&A pairs. Empty/undefined → the whole component renders nothing. */
  items: FaqItem[] | undefined;
  /** Override the schema gate. Defaults to `!portfolioItem.noindex` (preview = no schema). */
  indexable?: boolean;
}) {
  if (!items || items.length === 0) return null;

  const item = getItemBySlug(slug);
  const emitSchema = indexable ?? (item ? !item.noindex : true);

  const faqSchema = emitSchema
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }
    : null;

  return (
    <>
      {faqSchema && <JsonLd data={faqSchema} id={`schema-faqpage-${slug}`} />}
      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
          Häufige Fragen
        </h2>
        <div className="mt-5 space-y-4">
          {items.map((it, i) => (
            <details
              key={i}
              className="group rounded-xl border border-primary/10 bg-white/50 p-5 open:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:open:bg-surface"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-base font-semibold text-primary dark:text-text-primary">
                {it.q}
                <span className="ml-4 text-accent transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
