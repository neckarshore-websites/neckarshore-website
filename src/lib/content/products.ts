/**
 * Products collection — per-product overview hubs (Template A).
 *
 * Frontmatter carries the machine-read fields (name, H1 headline, the citable
 * definition lead, the live-app URL, the schema application category); the Markdown
 * body carries the narrative sections (Problem, Wie es funktioniert, Idee, Roadmap,
 * Verwandte Verzerrungen, Wie dieser Text entstand) in their authored order.
 */
import { readEntry } from "./collection";
import { renderMarkdown } from "./markdown";

const DIR = "products";

interface ProductFrontmatter {
  name: string;
  headline: string;
  definition: string;
  /** Live-app URL. Omitted for preview products with no public app yet (→ preview schema, no live CTA). */
  liveUrl?: string;
  applicationCategory: string;
}

export interface ProductEntry extends ProductFrontmatter {
  slug: string;
  /** Sanitised HTML of the Markdown body. */
  bodyHtml: string;
}

export function getProductEntry(slug: string): ProductEntry | null {
  const e = readEntry<ProductFrontmatter>(DIR, slug);
  if (!e) return null;
  return { slug: e.slug, ...e.data, bodyHtml: renderMarkdown(e.body) };
}
