/**
 * Product-page export builder — neckarshore.ai wiring (PER-REPO part).
 *
 * Reads the product's source `.md` (frontmatter + RAW Markdown body — not the rendered
 * HTML, so the export round-trips losslessly back into src/content/products/<slug>.md)
 * and appends the data-driven FAQ section, then hands everything to the generic
 * serializer. Returns null when no `.md` source exists for the slug (→ the route 404s,
 * and no export button is shown on such a page).
 */
import { readEntry } from "@/lib/content/collection";
import { faqForSlug } from "@/lib/product-faqs";
import { SITE_URL } from "@/lib/site-config";
import { buildMarkdownDocument, faqToMarkdown } from "../serialize";
import { extraSectionsForSlug } from "../product-sections";

interface ProductFrontmatter {
  name: string;
  headline: string;
  definition: string;
  liveUrl?: string;
  applicationCategory: string;
}

export interface ExportResult {
  /** Download filename, e.g. `clearpath.md`. */
  filename: string;
  /** The assembled Markdown document. */
  markdown: string;
}

export interface ExportOptions {
  /** Canonical origin for the `source:` frontmatter field (no trailing slash). */
  baseUrl: string;
  /** ISO date (YYYY-MM-DD) for the `exported:` frontmatter field. */
  exportedAt: string;
}

const SITE_NAME = new URL(SITE_URL).host;

export function buildProductMarkdown(slug: string, opts: ExportOptions): ExportResult | null {
  const entry = readEntry<ProductFrontmatter>("products", slug);
  if (!entry) return null;

  const fm = entry.data;

  // Order mirrors the rendered page: body → product-specific tables → FAQ.
  const sections = [...extraSectionsForSlug(slug)];
  const faq = faqForSlug(slug);
  if (faq.length > 0) sections.push({ heading: "Häufige Fragen", body: faqToMarkdown(faq) });

  const markdown = buildMarkdownDocument({
    frontmatter: {
      title: fm.headline,
      source: `${opts.baseUrl}/products/${slug}`,
      site: SITE_NAME,
      exported: opts.exportedAt,
    },
    title: fm.headline,
    lead: fm.definition,
    body: entry.body,
    sections,
  });

  return { filename: `${slug}.md`, markdown };
}
