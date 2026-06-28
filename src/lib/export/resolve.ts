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

const PRODUCT_PATH = /^\/products\/([a-z0-9-]+)\/?$/;

export function resolveExport(pathname: string, opts: ExportOptions): ExportResult | null {
  const product = pathname.match(PRODUCT_PATH);
  if (product) return buildProductMarkdown(product[1], opts);

  return null;
}
