import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSchema } from "@/components/PageSchema";
import { formatDate, getPosts } from "@/lib/content/blog";
import { BLOG_PATH, blogSchema, postPath } from "@/lib/schema/blog";
import { pageMetadata } from "@/lib/seo";

/**
 * /blog — the list of articles, newest first.
 *
 * Reads `getPosts()`, so it shows what the draft gate allows in this environment (drafts on
 * development and Vercel previews only). The title is the single link target of each card,
 * as in OGC's PostCard: one clean link per article for a screen reader.
 */
const PAGE_TITLE = "Blog — Testen, Bauen und Entscheiden mit KI-Agenten";
/** At or under 155 characters — TC-SEO-037. */
const PAGE_DESCRIPTION =
  "Was wir beim Bauen von Software mit KI-Agenten messen, entscheiden und lernen: Teststrategie, " +
  "Qualität und Werkzeuge, mit echten Zahlen aus unseren Projekten.";

export const metadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: BLOG_PATH,
});

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <>
      <Nav />
      <PageSchema path={BLOG_PATH} name={PAGE_TITLE} primaryEntity={blogSchema(posts)} />

      <main className="mx-auto max-w-[960px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={[{ name: "Start", href: "/" }, { name: "Blog" }]} />
        <header className="max-w-[720px]">
          <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl dark:text-text-primary">
            Blog
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Was wir beim Bauen von Software mit KI-Agenten messen, entscheiden und lernen. Mit echten
            Zahlen aus unseren Projekten.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-12 text-muted dark:text-text-tertiary">Noch keine Beiträge.</p>
        ) : (
          <ul className="mt-12 grid gap-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <article
                  data-post-card={post.slug}
                  className="grid gap-6 rounded-2xl border border-primary/10 bg-white p-4 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center md:p-6 dark:border-white/10 dark:bg-surface"
                >
                  <Image
                    src={post.cover.src}
                    width={post.cover.width}
                    height={post.cover.height}
                    alt=""
                    sizes="(min-width: 768px) 400px, calc(100vw - 64px)"
                    className="h-auto w-full rounded-xl"
                  />
                  <div>
                    <p className="text-sm text-muted dark:text-text-tertiary">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      {" · "}
                      {post.readingMinutes} Min. Lesezeit
                      {post.draft && (
                        <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 font-semibold text-accent dark:bg-accent-bright/15 dark:text-accent-bright">
                          Entwurf
                        </span>
                      )}
                    </p>
                    <h2 className="mt-2 font-heading text-2xl font-bold leading-snug text-primary dark:text-text-primary">
                      <Link
                        href={postPath(post.slug)}
                        data-track="blog_card"
                        className="transition-colors hover:text-accent dark:hover:text-accent-bright"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                      {post.dek}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
