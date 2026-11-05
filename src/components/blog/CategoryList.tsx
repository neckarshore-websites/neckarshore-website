import Link from "next/link";
import type { BlogCategory } from "@/lib/content/blog";
import { BLOG_PATH, categoryPath } from "@/lib/schema/blog";

/**
 * Category navigation with post counts, ported from OGC's components/blog/CategoryList.tsx.
 * Every entry is a ≥44px flex row (blog UX standard, point 10). The active entry carries
 * aria-current, so it is not only a colour change.
 */
export function CategoryList({ categories, activeSlug }: { categories: BlogCategory[]; activeSlug?: string }) {
  if (categories.length === 0) return null;
  const row = "flex min-h-[44px] items-center";
  const active = "font-semibold text-accent dark:text-accent-bright";
  const inactive = "text-neutral-dark/80 transition-colors hover:text-accent dark:text-text-secondary dark:hover:text-accent-bright";

  return (
    <nav aria-label="Blog-Kategorien" data-category-nav>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary">Kategorien</p>
      <ul className="text-[15px]">
        <li>
          <Link
            href={BLOG_PATH}
            aria-current={activeSlug === undefined ? "page" : undefined}
            className={`${row} ${activeSlug === undefined ? active : inactive}`}
          >
            Alle Beiträge
          </Link>
        </li>
        {categories.map((cat) => {
          const isActive = cat.slug === activeSlug;
          return (
            <li key={cat.slug}>
              <Link
                href={categoryPath(cat.slug)}
                aria-current={isActive ? "page" : undefined}
                className={`${row} ${isActive ? active : inactive}`}
              >
                {cat.name}
                <span className="ml-1.5 text-sm text-muted dark:text-text-tertiary">({cat.count})</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
