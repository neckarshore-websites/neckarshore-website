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
// every page's HTML). Read on the box by Bob, 2026-11-18. If this is ever
// emptied, the tracker is not rendered at all. NEXT_PUBLIC_UMAMI_WEBSITE_ID
// overrides it for the e2e run.
const UMAMI_WEBSITE_ID_NECKARSHORE = "96cf5102-5933-4d08-9ed6-c96423cca311";

export const UMAMI_WEBSITE_ID =
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? UMAMI_WEBSITE_ID_NECKARSHORE;
