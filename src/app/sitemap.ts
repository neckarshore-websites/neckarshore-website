import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap — auto-regenerates on every build with current lastModified.
 * Replaces static public/sitemap.xml (deleted 2026-04-10).
 *
 * Deprecated tags (changefreq, priority) intentionally omitted — Google has
 * ignored them since 2023. Only <loc> and <lastmod> carry signal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://neckarshore.ai";
  const lastModified = new Date();

  return [
    { url: `${baseUrl}/`, lastModified },
    { url: `${baseUrl}/impressum`, lastModified },
    { url: `${baseUrl}/datenschutz`, lastModified },
  ];
}
