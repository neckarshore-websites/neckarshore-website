/**
 * Page metadata helper — keeps og/twitter/canonical consistent across routes and
 * prevents the OG-drift class the e2e SEO suite guards against (each page must carry
 * its OWN og:title/og:url, not inherit the homepage's).
 */
import type { Metadata } from "next";

const BASE_URL = "https://neckarshore.ai";

const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "neckarshore.ai — Software Development. Closer to Home.",
  type: "image/jpeg",
} as const;

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  /** Absolute path beginning with `/`, e.g. `/glossar/bestaetigungsfehler`. */
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = `${BASE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "neckarshore.ai",
      locale: "de_DE",
      type,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
