import { getItemBySlug } from "@/lib/portfolio";

/** Per-product OG/social card image (1200x630) served from public/og/<slug>.jpg. */
export function productOgImage(slug: string): {
  url: string;
  width: number;
  height: number;
  alt: string;
} {
  const name = getItemBySlug(slug)?.name ?? slug;
  return {
    url: `/og/${slug}.jpg`,
    width: 1200,
    height: 630,
    alt: `${name} — neckarshore.ai`,
  };
}
