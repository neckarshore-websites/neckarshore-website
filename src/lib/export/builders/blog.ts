/**
 * Blog-post export builder — neckarshore.ai wiring (PER-REPO part), ported from OGC's
 * lib/export/builders/blog.ts.
 *
 * Reads the post through the gated loader (`getPost`), so a draft is exportable only where it
 * is visible: in development and on a Vercel preview, never on neckarshore.ai. This route is
 * the one place the draft gate runs at REQUEST time rather than at build time; on Vercel the
 * runtime carries VERCEL_ENV just as the build does.
 *
 * Unlike OGC, a post here can carry figures (React components placed by markers). They are
 * replaced by their Markdown tables (components/blog/figures/markdown.ts), so a reader's AI
 * gets the content the page shows, not an empty comment.
 */
import { getPost } from "@/lib/content/blog";
import { bodyWithFigures } from "@/components/blog/figures/markdown";
import { postPath } from "@/lib/schema/blog";
import { SITE_URL } from "@/lib/site-config";
import { buildMarkdownDocument } from "../serialize";
import type { ExportOptions, ExportResult } from "./product";

const SITE_NAME = new URL(SITE_URL).host;

export function buildBlogMarkdown(
  slug: string,
  opts: ExportOptions,
  env: Record<string, string | undefined> = process.env,
): ExportResult | null {
  const post = getPost(slug, env);
  if (!post) return null;

  const further = post.further
    .map((link) => `- [${link.title}](${link.url.startsWith("/") ? `${opts.baseUrl}${link.url}` : link.url})`)
    .join("\n");

  const markdown = buildMarkdownDocument({
    frontmatter: {
      title: post.title,
      source: `${opts.baseUrl}${postPath(post.slug)}`,
      site: SITE_NAME,
      author: post.author,
      date: post.date,
      categories: post.categories.join(", "),
      note: post.aiNote,
      exported: opts.exportedAt,
    },
    title: post.title,
    lead: post.dek,
    body: bodyWithFigures(post.body),
    sections: further ? [{ heading: "Weiterführend", body: further }] : [],
  });

  // Filename leads with the site host so exports are self-identifying when many sites'
  // .md files land in one Obsidian vault / LLM context (Founder convention, 2026-06-28).
  return { filename: `${SITE_NAME} - ${slug}.md`, markdown };
}
