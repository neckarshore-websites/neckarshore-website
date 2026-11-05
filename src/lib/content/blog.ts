/**
 * Blog collection — Markdown posts in `src/content/blog/`, read at build time.
 *
 * Built on the same substrate as the product pages (`readCollection` + `renderMarkdown`,
 * both ported from the oakwoodgolfclub-website blog), following OGC's
 * `docs/blog-ux-standard.md` as the contract. Three things differ from OGC, each on purpose:
 *
 * 1. THE DRAFT GATE FAILS CLOSED. OGC hides drafts when NODE_ENV is "production". Here a draft
 *    is shown only when we positively know we are in local development or on a Vercel preview
 *    (where the Founder looks at it). Anything else, including a build with no Vercel env at
 *    all, hides it. The gate lives in this one place: the list, the detail page and
 *    `generateStaticParams` all read through `getPosts()` / `getPost()`.
 * 2. THE SITEMAP READS `getPublishedPosts()`, which ignores the gate: a draft never reaches the
 *    sitemap, not even on a preview.
 * 3. FRONTMATTER IS VALIDATED AND A BAD POST STOPS THE BUILD (OGC skips it with a warning).
 *    A skipped post is invisible; a stopped build is not.
 *
 * Figures: a post can place a named React figure with `<!-- figur: <id> -->` on its own line.
 * The body is split on those markers BEFORE rendering, because `renderMarkdown()` runs
 * sanitize-html, which strips HTML comments — a marker that reached the sanitiser would vanish
 * and take its figure with it, silently. Any comment left over after the split is therefore an
 * error, not decoration.
 */
import { readCollection } from "./collection";
import { renderMarkdown } from "./markdown";
import { isFigureId, type FigureId } from "./blog-figures";

const DIR = "blog";

/** Google shows ~60 characters of a title; Lenin's first title is 56. */
export const SEO_TITLE_MAX = 60;
/** Same ceiling TC-SEO-037 holds every owned route to. */
export const DESCRIPTION_MAX = 155;

/** Average reading speed for German non-fiction, words per minute. */
const WORDS_PER_MINUTE = 200;

const MARKER = /<!--\s*figur:\s*([a-z0-9-]+)\s*-->/g;

/**
 * A slug is the file name, and it ends up in an `href`. Only lower-case letters, digits and
 * single hyphens pass; anything else stops the build. The files are ours, so this is not about
 * a hostile author — it keeps a stray name ("Entwurf (2).md", "javascript:…") from ever
 * reaching a link, and it is the guard CodeQL's js/stored-xss asked for on PR #355.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertSlug(slug: string): string {
  if (!SLUG.test(slug)) {
    throw new Error(`[blog] "${slug}" is not a valid slug: use a-z, 0-9 and single hyphens (file name = slug)`);
  }
  return slug;
}

type Env = Record<string, string | undefined>;

export interface BlogCover {
  /** Path under /public, e.g. `/blog/<slug>/titelbild.webp`. */
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Bildnachweis, shown under the caption. */
  credit: string;
}

export interface BlogFrontmatter {
  /** The article headline: the page's one H1 and the schema `headline`. */
  title: string;
  /** `<title>` and og:title. At most SEO_TITLE_MAX characters. */
  seoTitle: string;
  /** Meta description and og:description. At most DESCRIPTION_MAX characters. */
  description: string;
  /** Standfirst under the H1. */
  dek: string;
  /** Publication date, `YYYY-MM-DD`. Set it on the commit that sets `draft: false`. */
  date: string;
  /** Byline. Must be the Person in lib/schema/organization.ts for the schema link to hold. */
  author: string;
  cover: BlogCover;
  /** 1200×630 social image under /public. */
  ogImage: string;
  /** The AI note at the article's end. */
  aiNote: string;
  /** At least one. The first is the post's primary category (card eyebrow, breadcrumb). */
  categories: string[];
  /** "Weiterführend": external https links or internal paths, shown under the article. */
  further: FurtherLink[];
  /** Required, never defaulted: a post without the flag stops the build. */
  draft: boolean;
}

export interface FurtherLink {
  title: string;
  /** `https://…`, or an internal path beginning with a single `/`. Nothing else passes. */
  url: string;
}

export interface BlogCategory {
  /** Display name as written in the frontmatter. */
  name: string;
  /** URL slug, [a-z0-9-] only (see categorySlug). */
  slug: string;
  /** Number of posts in this category, in the environment it was computed for. */
  count: number;
}

export type BodySegment = { kind: "html"; html: string } | { kind: "figure"; id: FigureId };

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  /** Raw Markdown body, markers included (the unit tests read it). */
  body: string;
  segments: BodySegment[];
  readingMinutes: number;
}

/**
 * Whether drafts may be shown. TRUE only for local development or a Vercel preview build;
 * every other combination, including a missing variable, is FALSE.
 */
export function draftsVisible(env: Env = process.env): boolean {
  return env.NODE_ENV === "development" || env.VERCEL_ENV === "preview";
}

/** The gate itself, as a pure function: keep drafts only where `draftsVisible(env)` says so. */
export function filterVisible<T extends { draft: boolean }>(posts: T[], env: Env = process.env): T[] {
  const showDrafts = draftsVisible(env);
  return posts.filter((post) => showDrafts || !post.draft);
}

/** Every visible post for this environment, newest first. */
export function getPosts(env: Env = process.env): BlogPost[] {
  return filterVisible(loadAll(), env);
}

/** One post by slug, or `null` if it does not exist or is a hidden draft. */
export function getPost(slug: string, env: Env = process.env): BlogPost | null {
  return getPosts(env).find((post) => post.slug === slug) ?? null;
}

/**
 * DERIVED VIEWS READ THROUGH THE GATE. Categories, their counts and the prev/next neighbours
 * are computed from `getPosts(env)`, never from every file: otherwise a draft would show up in
 * production as a "(1)" category or as the published article's "next" — two links that 404.
 */
export function getCategories(env: Env = process.env): BlogCategory[] {
  return aggregateCategories(getPosts(env));
}

export function getCategory(slug: string, env: Env = process.env): BlogCategory | null {
  return getCategories(env).find((c) => c.slug === slug) ?? null;
}

export function getPostsInCategory(slug: string, env: Env = process.env): BlogPost[] {
  return getPosts(env).filter((post) => post.categories.some((c) => categorySlug(c) === slug));
}

export function getAdjacentPosts(slug: string, env: Env = process.env) {
  return adjacent(getPosts(env), slug);
}

/** Categories of the published posts only, regardless of environment (sitemap). */
export function getPublishedCategories(): BlogCategory[] {
  return aggregateCategories(getPublishedPosts());
}

/**
 * "Künstliche Intelligenz" → "kuenstliche-intelligenz". The result must pass the same slug
 * rule as a post slug, because it ends up in an href; a name that cannot produce one stops
 * the build.
 */
export function categorySlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return assertSlug(slug);
}

/**
 * Count posts per category, keyed by SLUG, sorted A→Z. Two different names that produce one
 * slug ("KI-Agenten" and "KI Agenten") stop the build: they would be two sidebar entries with
 * one URL and two static params for the same page.
 */
export function aggregateCategories(posts: { categories: string[] }[]): BlogCategory[] {
  const bySlug = new Map<string, BlogCategory>();
  for (const post of posts) {
    for (const name of post.categories) {
      const slug = categorySlug(name);
      const seen = bySlug.get(slug);
      if (seen && seen.name !== name) {
        throw new Error(`[blog] categories "${seen.name}" and "${name}" share the slug "${slug}" — use one name`);
      }
      bySlug.set(slug, { name, slug, count: (seen?.count ?? 0) + 1 });
    }
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));
}

/**
 * Neighbours in list order (newest first, as on /blog). `prev` is the post above, `next` the
 * one below; either is null at the ends. No wrap-around, as on OGC.
 */
export function adjacent<T extends { slug: string }>(posts: T[], slug: string): { prev: T | null; next: T | null } {
  const index = posts.findIndex((p) => p.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

/** Posts with `draft: false`, regardless of environment. The sitemap reads only this. */
export function getPublishedPosts(): BlogPost[] {
  return loadAll().filter((post) => !post.draft);
}

function loadAll(): BlogPost[] {
  const posts = readCollection<Record<string, unknown>>(DIR)
    .map((entry) => {
      const slug = assertSlug(entry.slug);
      const data = validateFrontmatter(slug, entry.data);
      return {
        slug,
        ...data,
        body: entry.body,
        segments: splitBody(entry.body),
        readingMinutes: readingMinutes(entry.body),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  // Validate the category names across EVERY file, drafts included: a collision in a draft
  // would otherwise surface only on the day it is published.
  aggregateCategories(posts);
  return posts;
}

/**
 * Split a Markdown body on figure markers and render the text between them. Throws on an
 * unknown id, on an id used twice, and on any HTML comment that is not a well-formed marker.
 */
export function splitBody(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  const seen = new Set<string>();
  let last = 0;

  const pushText = (md: string) => {
    if (/<!--/.test(md)) {
      throw new Error(
        `[blog] an HTML comment that is not a figure marker: write <!-- figur: <id> --> (found near "${md
          .slice(md.indexOf("<!--"), md.indexOf("<!--") + 40)
          .trim()}")`,
      );
    }
    if (md.trim()) segments.push({ kind: "html", html: renderMarkdown(md) });
  };

  for (const match of body.matchAll(MARKER)) {
    const id = match[1];
    pushText(body.slice(last, match.index));
    if (!isFigureId(id)) throw new Error(`[blog] unknown figure "${id}" — register it in blog-figures.ts`);
    if (seen.has(id)) throw new Error(`[blog] figure "${id}" is placed more than once`);
    seen.add(id);
    segments.push({ kind: "figure", id });
    last = match.index + match[0].length;
  }
  pushText(body.slice(last));
  return segments;
}

/** Validate a post's frontmatter and return it typed; throws with the slug and field name. */
export function validateFrontmatter(slug: string, data: Record<string, unknown>): BlogFrontmatter {
  const fail = (field: string, why: string): never => {
    throw new Error(`[blog] ${slug}: ${field} ${why}`);
  };
  const text = (field: string, value: unknown): string =>
    typeof value === "string" && value.trim() ? value : fail(field, "is missing or empty");

  const title = text("title", data.title);
  const seoTitle = text("seoTitle", data.seoTitle);
  if (seoTitle.length > SEO_TITLE_MAX) fail("seoTitle", `has ${seoTitle.length} characters, at most ${SEO_TITLE_MAX}`);
  const description = text("description", data.description);
  if (description.length > DESCRIPTION_MAX) {
    fail("description", `has ${description.length} characters, at most ${DESCRIPTION_MAX}`);
  }

  // gray-matter turns an unquoted YAML date into a Date; accept both, store the ISO day.
  const rawDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  const date = text("date", rawDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail("date", `must be YYYY-MM-DD, got "${date}"`);

  if (typeof data.draft !== "boolean") fail("draft", "must be true or false, never left out");

  const cover = (data.cover ?? {}) as Record<string, unknown>;
  const dimension = (field: string, value: unknown): number =>
    typeof value === "number" && value > 0 ? value : fail(field, "must be a positive number");

  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    fail("categories", "must list at least one category");
  }
  const categories = (data.categories as unknown[]).map((c, i) => text(`categories[${i}]`, c));
  categories.forEach(categorySlug); // a name that yields no valid slug stops the build here

  const further = data.further === undefined ? [] : data.further;
  if (!Array.isArray(further)) fail("further", "must be a list of { title, url }");
  const links = (further as Record<string, unknown>[]).map((link, i) => ({
    title: text(`further[${i}].title`, link?.title),
    url: safeLinkUrl(`further[${i}].url`, text(`further[${i}].url`, link?.url), fail),
  }));

  return {
    title,
    seoTitle,
    description,
    dek: text("dek", data.dek),
    date,
    author: text("author", data.author),
    cover: {
      src: text("cover.src", cover.src),
      width: dimension("cover.width", cover.width),
      height: dimension("cover.height", cover.height),
      alt: text("cover.alt", cover.alt),
      caption: text("cover.caption", cover.caption),
      credit: text("cover.credit", cover.credit),
    },
    ogImage: text("ogImage", data.ogImage),
    aiNote: text("aiNote", data.aiNote),
    categories,
    further: links,
    draft: data.draft as boolean,
  };
}

/**
 * A "Weiterführend" URL goes into an href: only https (checked with the URL parser, not a
 * prefix test) or an internal path beginning with one slash. javascript:, http:, mailto:,
 * protocol-relative "//host" — all refused.
 */
function safeLinkUrl(field: string, url: string, fail: (f: string, why: string) => never): string {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  let protocol = "";
  try {
    protocol = new URL(url).protocol;
  } catch {
    return fail(field, `is not a URL: "${url}"`);
  }
  return protocol === "https:" ? url : fail(field, `must be https or an internal path, got "${url}"`);
}

function readingMinutes(body: string): number {
  const words = body.replace(MARKER, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** "10. November 2026" — the byline date, German long form. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
