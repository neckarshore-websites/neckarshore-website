import { entityId } from "@/lib/schema/webpage";

/**
 * SoftwareApplication JSON-LD for product hubs (closes audit Finding #4).
 *
 * Marks the product as a free, web-based application so search + AI engines can
 * surface it as software, not just a marketing page. `description` is the citable
 * one-sentence definition; `url` points at the live app. `@id` (derived from the route
 * `path`) lets the page's WebPage.mainEntity reference resolve to THIS node intra-@graph.
 */
interface SoftwareApplicationInput {
  name: string;
  definition: string;
  liveUrl: string;
  applicationCategory: string;
  /** Route path (e.g. `/products/clearpath`) → the entity `@id` via `entityId`. */
  path: string;
}

export function softwareApplicationSchema({
  name,
  definition,
  liveUrl,
  applicationCategory,
  path,
}: SoftwareApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": entityId(path, "software"),
    name,
    description: definition,
    applicationCategory,
    operatingSystem: "Web",
    url: liveUrl,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  } as const;
}

/**
 * Live variant for products that ARE reachable but are NOT fully free — freemium or paid
 * (e.g. Snakeoil-Check: one free check, then paid Shot packages). Emits the live `url` but
 * deliberately OMITS `offers` + `isAccessibleForFree`: claiming `price: "0"` / free for a
 * product with paid tiers would be a false structured-data claim (fail-closed; AD-19). Use
 * `softwareApplicationSchema` (with the free Offer) only for genuinely free apps (ClearPath).
 */
interface LiveSoftwareApplicationInput {
  name: string;
  definition: string;
  liveUrl: string;
  applicationCategory: string;
  /** Route path (e.g. `/products/snakeoil-check`) → the entity `@id` via `entityId`. */
  path: string;
}

export function liveSoftwareApplicationSchema({
  name,
  definition,
  liveUrl,
  applicationCategory,
  path,
}: LiveSoftwareApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": entityId(path, "software"),
    name,
    description: definition,
    applicationCategory,
    operatingSystem: "Web",
    url: liveUrl,
    author: { "@type": "Organization", name: "neckarshore.ai" },
  } as const;
}

/**
 * Preview variant for products that are in development. Deliberately OMITS `url`,
 * `offers`, and `isAccessibleForFree` — emitting a live URL or a free Offer for a
 * product that is neither would be a false structured-data claim (fail-closed; AD-19).
 * Mirrors the hand-written pre-launch entity on the Omnopsis page.
 *
 * `@id` IS emitted (identity, not a commercial claim) so a noindex preview's WebPage can
 * still wire `mainEntity` to it — `@id` is safe on previews, `url`/`offers` are not.
 */
interface PreviewSoftwareApplicationInput {
  name: string;
  definition: string;
  applicationCategory: string;
  /** Route path (e.g. `/products/phonesis`) → the entity `@id` via `entityId`. */
  path: string;
}

export function previewSoftwareApplicationSchema({
  name,
  definition,
  applicationCategory,
  path,
}: PreviewSoftwareApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": entityId(path, "software"),
    name,
    description: definition,
    applicationCategory,
    operatingSystem: "Web",
    author: { "@type": "Organization", name: "neckarshore.ai" },
  } as const;
}

/**
 * CollectionPage schema for the product portal + the per-category sub-portals.
 * Gives each listing page a valid JSON-LD entity (satisfies the TC-CNT-030
 * "≥1 ld+json per page" floor) without pretending a category page is a product.
 */
interface CollectionPageInput {
  name: string;
  description: string;
  url: string;
  /** Route path (e.g. `/products/skills`) → the entity `@id` via `entityId`. */
  path: string;
}

export function collectionPageSchema({ name, description, url, path }: CollectionPageInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": entityId(path, "collection"),
    name,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: "neckarshore.ai", url: "https://neckarshore.ai" },
  } as const;
}
