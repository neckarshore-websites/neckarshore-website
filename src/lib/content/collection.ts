/**
 * Content-collection loader — ported from the oakwoodgolfclub-website blog pattern.
 *
 * Entries are Markdown files with YAML frontmatter, read from `src/content/<dir>/`.
 * They are repo-controlled (never user input) and resolved at build time, so the
 * file-system reads run in Server Components only and the result is statically baked.
 *
 * This is the generic substrate; per-collection typed loaders (products.ts, websites.ts)
 * sit on top and validate/shape the frontmatter into their own entry types.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

export interface RawEntry<T> {
  /** Filename without the `.md` extension — the URL slug. */
  slug: string;
  /** Parsed YAML frontmatter. */
  data: T;
  /** Raw Markdown body (everything after the frontmatter). */
  body: string;
}

/** Read every `.md` entry in a collection directory, sorted by slug (A→Z). */
export function readCollection<T>(dir: string): RawEntry<T>[] {
  const full = path.join(CONTENT_ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => readRaw<T>(path.join(full, file), file.replace(/\.md$/, "")));
}

/** Read a single entry by slug, or `null` if it does not exist. */
export function readEntry<T>(dir: string, slug: string): RawEntry<T> | null {
  const full = path.join(CONTENT_ROOT, dir, `${slug}.md`);
  if (!fs.existsSync(full)) return null;
  return readRaw<T>(full, slug);
}

function readRaw<T>(absPath: string, slug: string): RawEntry<T> {
  const raw = fs.readFileSync(absPath, "utf8");
  const { data, content } = matter(raw);
  return { slug, data: data as T, body: content };
}
