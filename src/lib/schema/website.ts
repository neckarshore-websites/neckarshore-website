/**
 * CreativeWork JSON-LD for a website case-study detail page.
 *
 * The page is an editorial case study that DESCRIBES a web project we built — it is a
 * CreativeWork, not the live site itself. `url` is the case-study page; `about` points
 * at the live external site the study describes; `creator` is the agency (neckarshore.ai).
 * No Offer / price — a case study is not a purchasable product (fail-closed: only claim
 * what is true; cf. AD-19).
 */
interface WebsiteCaseStudyInput {
  /** Display name of the described project. */
  name: string;
  /** Citable one-sentence summary (the page lead). */
  description: string;
  /** Case-study slug → /products/websites/<slug>. */
  slug: string;
  /** The live external domain the case study describes. */
  liveUrl: string;
}

import { entityId } from "@/lib/schema/webpage";

export function websiteCaseStudySchema({
  name,
  description,
  slug,
  liveUrl,
}: WebsiteCaseStudyInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": entityId(`/products/websites/${slug}`, "creativework"),
    name,
    description,
    url: `https://neckarshore.ai/products/websites/${slug}`,
    about: { "@type": "WebSite", name, url: liveUrl },
    creator: {
      "@type": "Organization",
      name: "neckarshore.ai",
      url: "https://neckarshore.ai",
    },
    inLanguage: "de",
  } as const;
}
