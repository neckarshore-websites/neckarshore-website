import { JsonLd } from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema/webpage";

/**
 * PageSchema — emits a route's WebPage entity, co-located with its primary entity in ONE
 * per-route `@graph` (L-NECK-ENTITY-WEBPAGE-ID 3d).
 *
 * Why one graph per page: the GEO value of this lever is that a consumer resolves the
 * `mainEntity`/`isPartOf` references. Whether Google merges nodes across SEPARATE `<script>`
 * blocks is an assumption no e2e test can verify. The universally-safe convention is one
 * `@graph` per page: the WebPage and its primary entity (SoftwareApplication / CollectionPage
 * / CreativeWork) ship in one block with a single top-level `@context`. After this the only
 * cross-block refs left are `isPartOf`→WebSite and `about`→Org — the route-invariant
 * brand-identity nodes in the layout block, the one accepted cross-block class.
 *
 * `mainEntity` is wired automatically from `primaryEntity["@id"]`, so the WebPage's reference
 * and the entity's own `@id` are byte-identical (AP-1, no hand-typed second URL). The
 * primary entity MUST carry an `@id` (set at build time via `entityId()`); its inner
 * `@context` is dropped here since the graph wrapper owns the single `@context`.
 *
 * Replaces the route's former standalone `<JsonLd data={…SoftwareApplication/CollectionPage/
 * CreativeWork} />`. BreadcrumbList + FAQPage stay their own blocks (no cross-ref to WebPage).
 */
interface PageSchemaProps {
  /** Absolute route path beginning with `/` (same value fed to `pageMetadata`). */
  path: string;
  /** WebPage `name` — the page's metadata title. */
  name: string;
  /**
   * The route's primary entity object, carrying its own `@id`. Omit on pages with no primary
   * entity (homepage, legal pages). Its `@context` (if present) is stripped on fold.
   */
  primaryEntity?: Record<string, unknown>;
  /** Override the `about` target (defaults to the Organization node inside webPageSchema). */
  aboutId?: string;
}

function stripContext(entity: Record<string, unknown>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { "@context": _context, ...rest } = entity;
  return rest;
}

export function PageSchema({ path, name, primaryEntity, aboutId }: PageSchemaProps) {
  const mainEntityId =
    typeof primaryEntity?.["@id"] === "string"
      ? (primaryEntity["@id"] as string)
      : undefined;

  const webPage = webPageSchema({ path, name, mainEntityId, aboutId });

  const graph = primaryEntity
    ? [webPage, stripContext(primaryEntity)]
    : [webPage];

  return (
    <JsonLd
      id="schema-webpage"
      data={{ "@context": "https://schema.org", "@graph": graph }}
    />
  );
}
