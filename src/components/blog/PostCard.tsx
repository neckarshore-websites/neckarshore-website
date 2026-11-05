import Image from "next/image";
import Link from "next/link";
import { categorySlug, formatDate, type BlogPost } from "@/lib/content/blog";
import { categoryPath, postPath } from "@/lib/schema/blog";

/**
 * Listing card, ported from OGC's components/blog/PostCard.tsx: date + primary category →
 * title (the card's main link) → standfirst → "Weiterlesen". The card is not one big link, so a
 * screen reader meets the title as the target; the CTA names its post in its accessible name.
 * Unlike OGC, the card shows the cover. Its link is aria-hidden and out of the tab order (the
 * title is the target), and the image still carries the cover's alt text: the site rule is
 * that every image has one (TC-A11Y-<route>-alt).
 */
export function PostCard({ post }: { post: BlogPost }) {
  const primary = post.categories[0];
  const href = postPath(post.slug);
  return (
    <article
      data-post-card={post.slug}
      className="grid gap-5 border-b border-primary/10 py-8 sm:grid-cols-[200px_minmax(0,1fr)] dark:border-white/10"
    >
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block self-start">
        <Image
          src={post.cover.src}
          width={post.cover.width}
          height={post.cover.height}
          alt={post.cover.alt}
          sizes="(min-width: 640px) 200px, calc(100vw - 32px)"
          className="h-auto w-full rounded-lg"
        />
      </Link>
      <div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted dark:text-text-tertiary">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <Link
            href={categoryPath(categorySlug(primary))}
            className="font-semibold uppercase tracking-wider text-accent hover:text-accent-hover dark:text-accent-bright"
          >
            {primary}
          </Link>
          {post.draft && (
            <span className="rounded-full border border-accent/40 bg-white px-2 py-0.5 font-semibold text-accent-active dark:border-accent-bright/40 dark:bg-surface dark:text-accent-bright">
              Entwurf
            </span>
          )}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold leading-snug text-primary dark:text-text-primary">
          <Link
            href={href}
            data-track="blog_card"
            className="transition-colors hover:text-accent dark:hover:text-accent-bright"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">{post.dek}</p>
        <Link
          href={href}
          data-track="blog_card_cta"
          aria-label={`Weiterlesen: ${post.title}`}
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 font-semibold text-accent underline-offset-4 hover:text-accent-hover hover:underline dark:text-accent-bright"
        >
          Weiterlesen <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
