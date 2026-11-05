import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSchema } from "@/components/PageSchema";
import { BlogListLayout } from "@/components/blog/BlogListLayout";
import { getCategories, getCategory, getPostsInCategory } from "@/lib/content/blog";
import { BLOG_PATH, categoryPath } from "@/lib/schema/blog";
import { entityId } from "@/lib/schema/webpage";
import { pageMetadata } from "@/lib/seo";

/**
 * /blog/kategorie/[category] — the posts of one category, ported from OGC. Categories come
 * from the gated post list, so a category that only drafts carry does not exist in production
 * (and `dynamicParams = false` makes its URL a 404 there).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  return pageMetadata({
    title: `${cat.name} — Blog von neckarshore.ai`,
    description: `Alle Beiträge zum Thema ${cat.name} im Blog von neckarshore.ai.`,
    path: categoryPath(cat.slug),
  });
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  const posts = getPostsInCategory(cat.slug);
  const path = categoryPath(cat.slug);

  return (
    <>
      <Nav />
      <PageSchema
        path={path}
        name={`${cat.name} — Blog von neckarshore.ai`}
        primaryEntity={{ "@type": "CollectionPage", "@id": entityId(path, "collection"), name: cat.name }}
      />
      <main className="mx-auto max-w-[1100px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={[{ name: "Start", href: "/" }, { name: "Blog", href: BLOG_PATH }, { name: cat.name }]} />
        <BlogListLayout
          posts={posts}
          categories={getCategories()}
          activeSlug={cat.slug}
          empty="In dieser Kategorie gibt es noch keine Beiträge."
          header={
            <header className="max-w-[720px]">
              <p className="font-heading text-sm font-semibold uppercase tracking-wider text-accent dark:text-accent-bright">
                Kategorie
              </p>
              <h1 className="mt-3 font-heading text-4xl font-bold text-primary md:text-5xl dark:text-text-primary">
                {cat.name}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                {posts.length === 1 ? "Ein Beitrag" : `${posts.length} Beiträge`} zum Thema.
              </p>
            </header>
          }
        />
      </main>
      <Footer />
    </>
  );
}
