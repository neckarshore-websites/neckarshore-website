/**
 * Search document shape — the ONLY module the client search UI may import.
 *
 * `index-data.ts` (the builder) is server-only (reads the markdown content
 * collection via node:fs); keep this file type-only so the overlay/button can
 * import the shape without dragging fs into the client bundle.
 */

export type SearchType = "page" | "product" | "glossar";

export interface SearchDoc {
  /** Stable unique id, e.g. `glossar:bestaetigungsfehler` | `product:mmps:phonesis` | `page:/#services`. */
  id: string;
  type: SearchType;
  /** Term / product name / page or section heading. */
  title: string;
  /** Searchable plaintext body (definition + context, tagline, curated page lead). */
  text: string;
  /** Human-readable group label shown under the title, e.g. "Glossar", "MMPs", "Startseite". */
  category: string;
  /** Target URL — page, deep-linked section hash, or an external https:// product site. */
  url: string;
  /** External link-out (product "Websites" tier) — the overlay opens it in a new tab. */
  external?: boolean;
}
