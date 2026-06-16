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
