import Link from "next/link";
import type { BlogPost } from "@/lib/content/blog";
import { postPath } from "@/lib/schema/blog";

/**
 * Previous / next post at the foot of an article, ported from OGC's PostNavigation: the
 * neighbour's (shortened) title and primary category, not just an arrow. Order = the /blog
 * list (newest first). Either side can be missing; the empty column keeps the layout still.
 * With a single published post there is no navigation at all.
 */
const TITLE_MAX = 70;

function shorten(title: string): string {
  if (title.length <= TITLE_MAX) return title;
  return `${title.slice(0, TITLE_MAX).replace(/\s+\S*$/, "")}…`;
}

function NavLink({ post, direction }: { post: BlogPost; direction: "prev" | "next" }) {
  const label = direction === "prev" ? "← Vorheriger Beitrag" : "Nächster Beitrag →";
  return (
    <Link
      href={postPath(post.slug)}
      data-post-nav={direction}
      className={`group flex flex-col gap-1 rounded-xl border border-primary/10 p-4 transition-colors hover:border-accent dark:border-white/10 dark:hover:border-accent-bright ${
        direction === "next" ? "md:items-end md:text-right" : ""
      }`}
    >
      <span className="text-sm uppercase tracking-wider text-muted dark:text-text-tertiary">{label}</span>
      <span className="font-semibold leading-snug text-primary transition-colors group-hover:text-accent dark:text-text-primary dark:group-hover:text-accent-bright">
        {shorten(post.title)}
      </span>
      <span className="text-sm text-muted dark:text-text-tertiary">{post.categories[0]}</span>
    </Link>
  );
}

export function PostNavigation({ prev, next }: { prev: BlogPost | null; next: BlogPost | null }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Beitrags-Navigation" className="grid gap-4 md:grid-cols-2">
      {prev ? <NavLink post={prev} direction="prev" /> : <div aria-hidden="true" />}
      {next ? <NavLink post={next} direction="next" /> : <div aria-hidden="true" />}
    </nav>
  );
}
