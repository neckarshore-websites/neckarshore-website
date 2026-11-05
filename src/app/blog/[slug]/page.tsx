import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSchema } from "@/components/PageSchema";
import { Prose } from "@/components/Prose";
import { ExportButton } from "@/components/export/ExportButton";
import { FIGURES } from "@/components/blog/figures";
import { FurtherReading } from "@/components/blog/FurtherReading";
import { Tldr } from "@/components/blog/Tldr";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { categorySlug, formatDate, getAdjacentPosts, getPost, getPosts } from "@/lib/content/blog";
import { BLOG_PATH, blogPostingSchema, categoryPath, postPath } from "@/lib/schema/blog";
import { pageMetadata } from "@/lib/seo";

/**
 * /blog/[slug] — one article.
 *
 * Statically generated from `getPosts()`, which applies the draft gate (lib/content/blog.ts):
 * a draft is generated only for development and Vercel previews. `dynamicParams = false` makes
 * every slug that was not generated a 404 instead of a request-time render, so a draft's slug
 * fetched on production answers 404 — that is the gate's production behaviour, not an accident.
 *
 * A draft that IS rendered (preview) carries `noindex`, on top of Vercel's own preview header.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const meta = pageMetadata({
    title: post.seoTitle,
    description: post.description,
    path: postPath(post.slug),
    type: "article",
    image: { url: post.ogImage, width: 1200, height: 630, alt: post.cover.alt },
  });
  return {
    ...meta,
    authors: [{ name: post.author, url: "https://neckarshore.ai/#founder" }],
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = postPath(post.slug);
  const primary = post.categories[0];
  const { prev, next } = getAdjacentPosts(post.slug);

  return (
    <>
      <Nav />
      <PageSchema path={path} name={post.seoTitle} primaryEntity={blogPostingSchema(post)} />

      <main className="mx-auto max-w-[960px] px-4 pt-40 pb-20 md:px-6">
        <div className="mx-auto max-w-[720px]">
          <Breadcrumbs
            trail={[
              { name: "Start", href: "/" },
              { name: "Blog", href: BLOG_PATH },
              { name: primary, href: categoryPath(categorySlug(primary)) },
              { name: post.seoTitle },
            ]}
          />
        </div>

        <article data-blog-post={post.slug}>
          <header className="mx-auto max-w-[720px]">
            {post.draft && (
              <p
                data-draft-banner
                className="mb-6 rounded-lg border border-accent/40 bg-white px-4 py-2 text-sm font-semibold text-accent-active dark:border-accent-bright/40 dark:bg-surface dark:text-accent-bright"
              >
                Entwurf: nur in der Vorschau sichtbar, nicht auf neckarshore.ai.
              </p>
            )}
            <p className="text-sm text-muted dark:text-text-tertiary">
              <span className="font-semibold text-primary dark:text-text-primary">{post.author}</span>
              {" · "}
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {" · "}
              {post.readingMinutes} Min. Lesezeit
            </p>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] text-primary md:text-5xl dark:text-text-primary">
              {post.title}
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              {post.dek}
            </p>
          </header>

          <figure className="mt-10">
            <Image
              src={post.cover.src}
              width={post.cover.width}
              height={post.cover.height}
              alt={post.cover.alt}
              priority
              sizes="(min-width: 1008px) 912px, calc(100vw - 32px)"
              className="h-auto w-full rounded-2xl"
            />
            <figcaption className="mx-auto mt-3 max-w-[720px] text-sm leading-relaxed text-muted dark:text-text-tertiary">
              {post.cover.caption}
              <span className="block">{post.cover.credit}</span>
            </figcaption>
          </figure>

          {post.tldrHtml && (
            <div className="mx-auto mt-10 max-w-[720px]">
              <Tldr html={post.tldrHtml} />
            </div>
          )}

          <div className="mt-10">
            {post.segments.map((segment, index) => {
              if (segment.kind === "figure") {
                const Figure = FIGURES[segment.id];
                return <Figure key={`figure-${segment.id}`} />;
              }
              return (
                <div key={`text-${index}`} className="mx-auto max-w-[720px]">
                  <Prose html={segment.html} />
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-12 max-w-[720px]">
            <FurtherReading links={post.further} />
          </div>

          {/* Foot, in OGC's order (Founder direction there, 2026-04-18): move on first (prev /
              next), then where this post belongs (categories, export, all posts), the fine
              print last. */}
          <div className="mx-auto mt-14 max-w-[720px] border-t border-primary/10 pt-10 dark:border-white/10">
            <PostNavigation prev={prev} next={next} />
          </div>

          <footer className="mx-auto mt-10 flex max-w-[720px] flex-wrap items-start justify-between gap-6 border-t border-primary/10 pt-8 dark:border-white/10">
            <div data-post-categories>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary">
                Kategorien
              </p>
              <ul className="flex flex-wrap gap-2">
                {post.categories.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={categoryPath(categorySlug(cat))}
                      className="inline-flex min-h-[44px] items-center rounded-lg border border-primary/15 px-3 text-sm text-neutral-dark/80 transition-colors hover:border-accent hover:text-accent dark:border-white/15 dark:text-text-secondary dark:hover:border-accent-bright dark:hover:text-accent-bright"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <ExportButton path={path} className="min-h-[44px]" />
              <Link
                href={BLOG_PATH}
                className="inline-flex min-h-[44px] items-center font-semibold text-accent underline-offset-4 hover:text-accent-hover hover:underline dark:text-accent-bright"
              >
                ← Alle Beiträge
              </Link>
            </div>
          </footer>

          <p
            data-ai-note
            className="mx-auto mt-10 max-w-[720px] border-t border-primary/10 pt-5 text-sm leading-relaxed text-muted dark:border-white/10 dark:text-text-tertiary"
          >
            {post.aiNote}
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
