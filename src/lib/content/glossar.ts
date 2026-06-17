/**
 * Glossar collection — citable cognitive-bias entries.
 *
 * Frontmatter carries the machine-read fields (term, the one-sentence definition lead,
 * optional alias); the Markdown body carries the prose (Kontext + Bezug zu ClearPath).
 * The definition is first-class data because it is the citable unit: it becomes the H1
 * lead paragraph, the DefinedTerm `description`, the index teaser and the meta description.
 */
import { readCollection, readEntry } from "./collection";
import { renderMarkdown } from "./markdown";

const DIR = "glossar";

interface GlossarFrontmatter {
  term: string;
  /** One-sentence, self-contained definition — the citable lead. */
  definition: string;
  /** Optional foreign-language alias, e.g. "Confirmation Bias". */
  aliases?: string;
}

export interface GlossarEntryMeta {
  slug: string;
  term: string;
  definition: string;
  aliases?: string;
}

export interface GlossarEntry extends GlossarEntryMeta {
  /** Sanitised HTML of the Markdown body (Kontext + Bezug zu ClearPath). */
  bodyHtml: string;
}

function toMeta(slug: string, data: GlossarFrontmatter): GlossarEntryMeta {
  return { slug, term: data.term, definition: data.definition, aliases: data.aliases };
}

/** All entries, sorted by term (German locale, A→Z). */
export function getAllGlossarEntries(): GlossarEntryMeta[] {
  return readCollection<GlossarFrontmatter>(DIR)
    .map((e) => toMeta(e.slug, e.data))
    .sort((a, b) => a.term.localeCompare(b.term, "de"));
}

/** One entry with rendered body, or `null` if the slug does not exist. */
export function getGlossarEntry(slug: string): GlossarEntry | null {
  const e = readEntry<GlossarFrontmatter>(DIR, slug);
  if (!e) return null;
  return { ...toMeta(e.slug, e.data), bodyHtml: renderMarkdown(e.body) };
}
