import Link from "next/link";
import type { FurtherLink } from "@/lib/content/blog";

/**
 * "Weiterführend": the article's sources and related pages, as on OGC. External links open in
 * a new tab with rel noopener; internal ones stay in the tab. The URLs were validated by the
 * loader (https or an internal path only).
 */
export function FurtherReading({ links }: { links: FurtherLink[] }) {
  if (links.length === 0) return null;
  return (
    <section aria-labelledby="weiterfuehrend" data-further className="prose-content">
      <h2 id="weiterfuehrend">Weiterführend</h2>
      <ul>
        {links.map((link) =>
          link.url.startsWith("/") ? (
            <li key={link.url}>
              <Link href={link.url}>{link.title}</Link>
            </li>
          ) : (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.title}
              </a>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
