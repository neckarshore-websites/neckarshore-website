import type { MetadataRoute } from "next";
import { getAllGlossarEntries } from "@/lib/content/glossar";
import { allProductRoutes } from "@/lib/portfolio";
import { SITE_UPDATED, SITE_URL } from "@/lib/site-config";

/**
 * Dynamic sitemap — route set auto-regenerates on every build. Glossary entry
 * routes are derived from the content collection so the sitemap stays in sync as
 * entries are added. Replaces static public/sitemap.xml (deleted 2026-04-10).
 *
 * `lastModified` carries the STABLE, content-derived SITE_UPDATED date — NOT a
 * build-time `new Date()`. A per-build timestamp stamped every url as "changed
 * today" on every deploy, a false freshness signal a crawler learns to distrust
 * (SEO/GEO audit 2026-06-23). See site-config.ts for the bump rule + the deferred
 * per-page-freshness upgrade path.
 *
 * Deprecated tags (changefreq, priority) intentionally omitted — Google has
 * ignored them since 2023. Only <loc> and <lastmod> carry signal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const lastModified = new Date(SITE_UPDATED);

  const paths = [
    "/impressum",
    "/datenschutz",
    "/glossar",
    // /products, the 4 sub-portals, and the bespoke own-page details (omnopsis, clearpath).
    // External sites + noindex preview skeletons are excluded by allProductRoutes().
    ...allProductRoutes(),
    ...getAllGlossarEntries().map((entry) => `/glossar/${entry.slug}`),
  ].sort((a, b) => a.localeCompare(b));

  return [
    { url: `${baseUrl}/`, lastModified },
    ...paths.map((path) => ({ url: `${baseUrl}${path}`, lastModified })),
  ];
}
