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
  /** Required, never defaulted: a post without the flag stops the build. */
  draft: boolean;
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

/** Posts with `draft: false`, regardless of environment. The sitemap reads only this. */
export function getPublishedPosts(): BlogPost[] {
  return loadAll().filter((post) => !post.draft);
}

function loadAll(): BlogPost[] {
  return readCollection<Record<string, unknown>>(DIR)
    .map((entry) => {
      const data = validateFrontmatter(entry.slug, entry.data);
      return {
        slug: entry.slug,
        ...data,
        body: entry.body,
        segments: splitBody(entry.body),
        readingMinutes: readingMinutes(entry.body),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
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
    draft: data.draft as boolean,
  };
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
