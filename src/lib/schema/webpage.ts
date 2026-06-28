/**
 * Per-route WebPage JSON-LD node + the shared cross-reference @id helper.
 *
 * The #1 GEO lever (L-NECK-ENTITY-WEBPAGE-ID, 2026-06-28): every indexable route must
 * assert ITSELF as a distinct WebPage entity — its own canonical `@id` — rather than
 * inheriting the homepage's `/#webpage` (the old shape shipped one homepage-pinned WebPage
 * on every route via the layout @graph). For AI search a page that does not name itself a
 * WebPage is hard to cite as a distinct entity.
 *
 * AP-1 single-source: the WebPage `@id`/`url` and the page's `<link rel="canonical">` both
 * derive from the SAME route `path` (the value `pageMetadata({path})` already uses) — they
 * cannot drift. `entityId()` is the ONE place cross-reference `@id`s are formed, so a
 * WebPage's `mainEntity` ref and the entity's own `@id` are byte-identical.
 *
 * This node carries NO `@context` — it is composed into a single per-route `@graph` by
 * <PageSchema>, which owns the one top-level `@context`.
 */
import { ORG_ID, WEBSITE_ID } from "@/lib/schema/organization";

const BASE_URL = "https://neckarshore.ai";

/** The kind of standalone entity an `@id` identifies on a route. */
export type EntityKind = "webpage" | "software" | "collection" | "creativework";

/**
 * The single source for cross-reference `@id`s. For `path="/"` this yields `…/#webpage`
 * (matching the historical homepage value); for sub-paths `…/products/clearpath#webpage`.
 * One expression, no per-route strings.
 */
export function entityId(path: string, kind: EntityKind): string {
  return `${BASE_URL}${path}#${kind}`;
}

export interface WebPageInput {
  /** Absolute route path beginning with `/`, e.g. `/products/clearpath` (same as canonical). */
  path: string;
  /** WebPage `name` — reuse the page's metadata title. */
  name: string;
  /**
   * `@id` of the route's primary entity (SoftwareApplication / CollectionPage / CreativeWork),
   * co-located in the SAME per-route @graph. Omit on pages with no primary entity (homepage,
   * legal pages) — `about: ORG` is then the only entity ref.
   */
  mainEntityId?: string;
  /** Brand-identity `about` target. Defaults to the Organization node (every page is ours). */
  aboutId?: string;
}

export function webPageSchema({
  path,
  name,
  mainEntityId,
  aboutId = ORG_ID,
}: WebPageInput) {
  return {
    "@type": "WebPage",
    "@id": entityId(path, "webpage"),
    url: `${BASE_URL}${path}`,
    name,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": aboutId },
    inLanguage: "de-DE",
    ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
  };
}
