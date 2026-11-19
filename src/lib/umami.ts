// Umami visitor counting (planning #4006 row 6, AD-65 layer 4).
//
// The host is the estate's own Umami instance on the Hostinger box, behind
// Traefik (Founder 2026-11-18: subdomain stats.neckarshore.ai). It is the one
// place to change if the box ever moves. Same host as rauhut-website#120.
export const UMAMI_HOST = "https://stats.neckarshore.ai";

// Umami's website id for neckarshore.ai. It is public by design (it ships in
// every page's HTML). Read on the box by Bob, 2026-11-18 ~17:35Z.
const UMAMI_WEBSITE_ID_NECKARSHORE = "96cf5102-5933-4d08-9ed6-c96423cca311";

// The real id is used on Vercel production builds ONLY. A local `next build`,
// a Lighthouse run in CI and every Vercel preview get an empty id, so the
// tracker is not rendered there and none of those visits reach the box.
// (rauhut.com defaults to the real id everywhere; its box holds 6 events from
// localhost of 2026-11-18, most likely local production builds.)
// NEXT_PUBLIC_UMAMI_WEBSITE_ID overrides both, for the e2e run.
export function resolveUmamiWebsiteId(env: {
  NEXT_PUBLIC_UMAMI_WEBSITE_ID?: string;
  VERCEL_ENV?: string;
}): string {
  if (env.NEXT_PUBLIC_UMAMI_WEBSITE_ID !== undefined) {
    return env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  }
  return env.VERCEL_ENV === "production" ? UMAMI_WEBSITE_ID_NECKARSHORE : "";
}

export const UMAMI_WEBSITE_ID = resolveUmamiWebsiteId({
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  VERCEL_ENV: process.env.VERCEL_ENV,
});
