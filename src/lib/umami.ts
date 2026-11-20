// Umami visitor counting (planning #4006 row 6, AD-65 layer 4). It runs BESIDE
// the site's own tracker (TrackerScript.tsx, /api/track): the own system measures
// how the pages are used and how fast they load; Umami counts visits and where
// they come from (Dr. Sommer, planning #4003 comment 6983850360, neckarshore row).
//
// The host is the estate's own Umami instance on the Hostinger box, behind
// Traefik (Founder 2026-11-18: subdomain stats.neckarshore.ai). It is the one
// place to change if the box ever moves.
export const UMAMI_HOST = "https://stats.neckarshore.ai";

// Umami's website id for neckarshore.ai. It is public by design (it ships in
// every page's HTML). Read on the box by Bob, 2026-11-18. If the id is empty,
// the tracker is not rendered at all. NEXT_PUBLIC_UMAMI_WEBSITE_ID
// overrides it for the e2e run.
const UMAMI_WEBSITE_ID_NECKARSHORE = "96cf5102-5933-4d08-9ed6-c96423cca311";

// The real id is used on Vercel production builds ONLY (carried over from
// neckarshore-website #389, 2026-11-20). A local `next build`, a CI run and every
// Vercel preview get an empty id, so the tracker is not rendered there and none of
// those visits reach the box. NEXT_PUBLIC_UMAMI_WEBSITE_ID overrides both, for e2e.
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
