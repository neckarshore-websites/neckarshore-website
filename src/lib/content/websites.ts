/**
 * Websites collection — per-website case-study detail pages (Website-Case-Study template).
 *
 * Frontmatter carries the machine-read fields (name, H1 headline, the citable lead,
 * the live external domain, the tech-stack chips, an honest status); the Markdown body
 * carries the seven content axes as `##` headings in their authored order:
 *   Ausgangslage · Ansatz · Technik & Architektur · Laufende Pflege · Status · Ausblick
 * (the Hero axis = the frontmatter headline + lead). Sits on the generic content
 * collection (collection.ts + markdown.ts), exactly like products.ts / glossar.ts.
 *
 * Build-time, server-only, repo-controlled — never user input.
 */
import { readEntry } from "./collection";
import { renderMarkdown } from "./markdown";

const DIR = "websites";

interface WebsiteFrontmatter {
  /** Display name (card heading + breadcrumb leaf). */
  name: string;
  /** Page H1. */
  headline: string;
  /** Citable one-sentence summary — also the meta description + the page lead paragraph. */
  lead: string;
  /** The live external domain the case study describes (the "Website ansehen ↗" CTA). */
  liveUrl: string;
  /** Compact stack tokens, rendered as chips above the prose. */
  techStack: string[];
  /** Honest status line, e.g. "Live" or "Live, Mitglieder-Portal in Arbeit". */
  status: string;
}

export interface WebsiteEntry extends WebsiteFrontmatter {
  slug: string;
  /** Sanitised HTML of the Markdown body (axes 2–7). */
  bodyHtml: string;
}

export function getWebsiteEntry(slug: string): WebsiteEntry | null {
  const e = readEntry<WebsiteFrontmatter>(DIR, slug);
  if (!e) return null;
  return { slug: e.slug, ...e.data, bodyHtml: renderMarkdown(e.body) };
}
