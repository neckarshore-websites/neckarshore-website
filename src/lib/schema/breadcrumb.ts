/**
 * BreadcrumbList JSON-LD for product detail + sub-portal pages.
 *
 * Google renders breadcrumb trails directly in the search snippet and AI engines use
 * them to place a page in its site hierarchy — yet the product pages emitted ZERO
 * BreadcrumbList until now. This builder turns the same `trail` the visual
 * `<Breadcrumbs>` component renders into a valid entity, so the schema and the UI can
 * never drift apart (one source: the trail array from `lib/portfolio`).
 *
 * The last crumb (the current page) carries no `href` → we omit its `item` URL, which
 * is valid per Google's BreadcrumbList guidance for the trailing element.
 */
const BASE_URL = "https://neckarshore.ai";

export interface BreadcrumbCrumb {
  /** Visible label + schema `name`. */
  name: string;
  /** Absolute path beginning with `/`. Omitted on the current (last) crumb. */
  href?: string;
}

export function breadcrumbListSchema(trail: BreadcrumbCrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.href ? { item: `${BASE_URL}${crumb.href}` } : {}),
    })),
  } as const;
}
