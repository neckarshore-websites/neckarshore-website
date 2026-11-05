import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSchema } from "@/components/PageSchema";
import { BlogListLayout } from "@/components/blog/BlogListLayout";
import { getCategories, getPosts } from "@/lib/content/blog";
import { BLOG_PATH, blogSchema } from "@/lib/schema/blog";
import { pageMetadata } from "@/lib/seo";

/**
 * /blog — the list of articles, newest first, with the category column (OGC's blog index).
 * Posts and categories come through the draft gate (lib/content/blog.ts): drafts only on
 * development and Vercel previews.
 */
const PAGE_TITLE = "Blog — Testen, Bauen und Entscheiden mit KI-Agenten";
/** At or under 155 characters — TC-SEO-037 (145; the first version had 158 under an unchecked comment). */
const PAGE_DESCRIPTION =
  "Was wir beim Bauen mit KI-Agenten messen, entscheiden und lernen: Teststrategie, " +
  "Qualität und Werkzeuge, mit echten Zahlen aus unseren Projekten.";

export const metadata = pageMetadata({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: BLOG_PATH });

export default function BlogIndexPage() {
  const posts = getPosts();
  return (
    <>
      <Nav />
      <PageSchema path={BLOG_PATH} name={PAGE_TITLE} primaryEntity={blogSchema(posts)} />
      <main className="mx-auto max-w-[1100px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={[{ name: "Start", href: "/" }, { name: "Blog" }]} />
        <BlogListLayout
          posts={posts}
          categories={getCategories()}
          empty="Noch keine Beiträge."
          header={
            <header className="max-w-[720px]">
              <p className="font-heading text-sm font-semibold uppercase tracking-wider text-accent dark:text-accent-bright">
                Blog
              </p>
              <h1 className="mt-3 font-heading text-4xl font-bold text-primary md:text-5xl dark:text-text-primary">
                Messen. Entscheiden. Lernen.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                Was wir beim Bauen von Software mit KI-Agenten messen, entscheiden und lernen. Mit echten
                Zahlen aus unseren Projekten.
              </p>
            </header>
          }
        />
      </main>
      <Footer />
    </>
  );
}
