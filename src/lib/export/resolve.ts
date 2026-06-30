/**
 * Export resolver — maps a site path to the builder that can export it (PER-REPO part).
 *
 * The single place that decides "is this page exportable, and how": a small, ordered
 * set of path patterns. Adding a new exportable content type later is additive — one
 * matcher + one builder, no rewrite (AP-1: add, don't replace).
 *
 * The product slug charset is locked to `[a-z0-9-]`, which also closes path-traversal
 * (`/products/../x` never matches) — defence in depth alongside readEntry's fixed root.
 */
import { buildProductMarkdown, type ExportOptions, type ExportResult } from "./builders/product";
import { buildWebsiteMarkdown } from "./builders/website";

// Two-segment website case studies are matched FIRST and are mutually exclusive with the
// single-segment product pattern (the `$` anchor): `/products/websites/<slug>` never matches
// PRODUCT_PATH, and `/products/websites` (the sub-portal index) matches PRODUCT_PATH but has
// no products/.md, so it resolves to null — unchanged. The `[a-z0-9-]` charset closes
// path-traversal on both patterns.
const WEBSITE_PATH = /^\/products\/websites\/([a-z0-9-]+)\/?$/;
const PRODUCT_PATH = /^\/products\/([a-z0-9-]+)\/?$/;

export function resolveExport(pathname: string, opts: ExportOptions): ExportResult | null {
  const website = pathname.match(WEBSITE_PATH);
  if (website) return buildWebsiteMarkdown(website[1], opts);

  const product = pathname.match(PRODUCT_PATH);
  if (product) return buildProductMarkdown(product[1], opts);

  return null;
}
