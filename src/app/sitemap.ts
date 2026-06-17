import type { MetadataRoute } from "next";
import { getAllGlossarEntries } from "@/lib/content/glossar";

/**
 * Dynamic sitemap — auto-regenerates on every build with current lastModified.
 * Glossary entry routes are derived from the content collection so the sitemap
 * stays in sync as entries are added. Replaces static public/sitemap.xml (deleted
 * 2026-04-10).
 *
 * Deprecated tags (changefreq, priority) intentionally omitted — Google has
 * ignored them since 2023. Only <loc> and <lastmod> carry signal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://neckarshore.ai";
  const lastModified = new Date();

  const paths = [
    "/impressum",
    "/datenschutz",
    "/glossar",
    "/products",
    "/products/clearpath",
    ...getAllGlossarEntries().map((entry) => `/glossar/${entry.slug}`),
  ].sort((a, b) => a.localeCompare(b));

  return [
    { url: `${baseUrl}/`, lastModified },
    ...paths.map((path) => ({ url: `${baseUrl}${path}`, lastModified })),
  ];
}
