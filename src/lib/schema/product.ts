/**
 * SoftwareApplication JSON-LD for product hubs (closes audit Finding #4).
 *
 * Marks the product as a free, web-based application so search + AI engines can
 * surface it as software, not just a marketing page. `description` is the citable
 * one-sentence definition; `url` points at the live app.
 */
interface SoftwareApplicationInput {
  name: string;
  definition: string;
  liveUrl: string;
  applicationCategory: string;
}

export function softwareApplicationSchema({
  name,
  definition,
  liveUrl,
  applicationCategory,
}: SoftwareApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
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
 * Preview variant for products that are in development. Deliberately OMITS `url`,
 * `offers`, and `isAccessibleForFree` — emitting a live URL or a free Offer for a
 * product that is neither would be a false structured-data claim (fail-closed; AD-19).
 * Mirrors the hand-written pre-launch entity on the Omnopsis page.
 */
interface PreviewSoftwareApplicationInput {
  name: string;
  definition: string;
  applicationCategory: string;
}

export function previewSoftwareApplicationSchema({
  name,
  definition,
  applicationCategory,
}: PreviewSoftwareApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
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
}

export function collectionPageSchema({ name, description, url }: CollectionPageInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: "neckarshore.ai", url: "https://neckarshore.ai" },
  } as const;
}
