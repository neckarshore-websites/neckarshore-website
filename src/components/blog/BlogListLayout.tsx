import type { ReactNode } from "react";
import type { BlogCategory, BlogPost } from "@/lib/content/blog";
import { CategoryList } from "./CategoryList";
import { PostCard } from "./PostCard";

/**
 * The list + category column of /blog and /blog/kategorie/[category], as on OGC: list on the
 * left, categories on the right from md up (on a phone the categories come first, above the
 * list — the order-first rule).
 */
export function BlogListLayout({
  header,
  posts,
  categories,
  activeSlug,
  empty,
}: {
  header: ReactNode;
  posts: BlogPost[];
  categories: BlogCategory[];
  activeSlug?: string;
  empty: string;
}) {
  return (
    <>
      {header}
      <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1fr)_220px] md:gap-12">
        <div>
          {posts.length === 0 ? (
            <p className="text-muted dark:text-text-tertiary">{empty}</p>
          ) : (
            <div className="border-t border-primary/10 dark:border-white/10">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
        <aside className="order-first md:order-none md:border-l md:border-primary/10 md:pl-8 dark:md:border-white/10">
          <CategoryList categories={categories} activeSlug={activeSlug} />
        </aside>
      </div>
    </>
  );
}
