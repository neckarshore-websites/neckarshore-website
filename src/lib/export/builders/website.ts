/**
 * Website-case-study export builder — neckarshore.ai wiring (PER-REPO part).
 *
 * Reads the case study's source `.md` (frontmatter + RAW Markdown body — not the rendered
 * HTML, so the export round-trips losslessly back into src/content/websites/<slug>.md) and
 * appends the data-driven FAQ section, then hands everything to the generic serializer.
 * Returns null when no `.md` source exists for the slug (→ the route 404s, and no export
 * button is shown on such a page).
 *
 * Sibling of builders/product.ts (different collection dir, two-segment route). Kept
 * separate rather than parametrised so each builder owns its own frontmatter shape
 * (websites carry `status` + `techStack`, products carry the per-slug tables) — AP-1:
 * a new exportable content type is additive, not a rewrite of an existing builder.
 */
import { readEntry } from "@/lib/content/collection";
import { faqForSlug } from "@/lib/product-faqs";
import { SITE_URL } from "@/lib/site-config";
import { buildMarkdownDocument, faqToMarkdown } from "../serialize";
import type { ExportOptions, ExportResult } from "./product";

interface WebsiteFrontmatter {
  name: string;
  headline: string;
  lead: string;
  liveUrl: string;
  techStack: string[];
  status: string;
}

const SITE_NAME = new URL(SITE_URL).host;

export function buildWebsiteMarkdown(slug: string, opts: ExportOptions): ExportResult | null {
  const entry = readEntry<WebsiteFrontmatter>("websites", slug);
  if (!entry) return null;

  const fm = entry.data;

  // Order mirrors the rendered page: lead → body (axes 2–7) → FAQ.
  const sections = [];
  const faq = faqForSlug(slug);
  if (faq.length > 0) sections.push({ heading: "Häufige Fragen", body: faqToMarkdown(faq) });

  const markdown = buildMarkdownDocument({
    frontmatter: {
      title: fm.headline,
      source: `${opts.baseUrl}/products/websites/${slug}`,
      site: SITE_NAME,
      // Distinctive website-case-study machine fields: the honest status line and the
      // on-page tech-stack chips (the body's "Technik" section is prose, so these stay
      // useful as a clean machine list).
      status: fm.status,
      stack: fm.techStack.join(", "),
      exported: opts.exportedAt,
    },
    title: fm.headline,
    lead: fm.lead,
    body: entry.body,
    sections,
  });

  // Filename leads with the site host so exports are self-identifying when many sites'
  // .md files land in one Obsidian vault / LLM context (Founder convention, 2026-06-28).
  return { filename: `${SITE_NAME} - ${slug}.md`, markdown };
}
