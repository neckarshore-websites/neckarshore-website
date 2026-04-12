import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/analytics-store";
import { createHash } from "crypto";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const VALID_EVENTS = new Set([
  "page_view",
  "cta_click",
  "scroll_depth",
  "nav_click",
  "section_view",
]);

/** Session gap: events from the same visitor within 30 min = same session. */
const SESSION_GAP_MS = 30 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a daily-rotating anonymous visitor hash.
 *
 * SHA-256(IP + User-Agent + YYYY-MM-DD) → hex.
 * - Not reversible to a person (hash is one-way).
 * - Rotates daily → no cross-day tracking.
 * - No PII stored — only the hash.
 *
 * This is the Plausible/Fathom model accepted by German DPAs.
 */
function dailyVisitorHash(ip: string, ua: string, day: string): string {
  return createHash("sha256")
    .update(`${ip}|${ua}|${day}`)
    .digest("hex")
    .slice(0, 16); // 16 hex chars = 64 bits — enough for uniqueness within a day
}

/**
 * Extract country/region from Vercel geo headers.
 * Vercel populates these automatically on their edge network — no external
 * service needed, no IP stored.
 *
 * Falls back to null when running locally or on non-Vercel hosts.
 */
function extractGeo(req: NextRequest): { country: string | null; region: string | null } {
  return {
    country: req.headers.get("x-vercel-ip-country") || null,
    region: req.headers.get("x-vercel-ip-country-region") || null,
  };
}

/**
 * Derive the client IP from standard headers.
 * Vercel sets x-forwarded-for; fall back to x-real-ip.
 */
function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

// ---------------------------------------------------------------------------
// POST — receive events
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.event || !VALID_EVENTS.has(body.event)) {
      return NextResponse.json({ error: "invalid event" }, { status: 400 });
    }

    const timestamp = body.timestamp || new Date().toISOString();
    const day = timestamp.slice(0, 10);

    // --- Visitor hash (Feature 1) ---
    const ip = getClientIp(req);
    const ua = req.headers.get("user-agent") || "";
    const visitorHash = dailyVisitorHash(ip, ua, day);

    // --- Geo (Feature 3) ---
    const geo = extractGeo(req);

    // --- Build event ---
    const event = {
      event: body.event,
      page: body.page || "/",
      referrer: body.referrer || null,
      device: body.device || "unknown",
      depth: body.depth || null,
      action: body.action || null,
      section: body.section || null,
      timestamp,
      source: body.source === "playwright" ? "playwright" : "browser",
      // New fields
      vid: visitorHash,
      geo: geo.country ? geo : null,
      utm: body.utm || null,
    };

    // Store the event
    await store.push(`events:${day}`, JSON.stringify(event));

    // Track unique visitor in a daily set (for fast unique count)
    await store.addToSet(`visitors:${day}`, visitorHash);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

// ---------------------------------------------------------------------------
// GET — retrieve analytics
// ---------------------------------------------------------------------------

interface TrackedEvent {
  event: string;
  page: string;
  referrer: string | null;
  device: string;
  depth: number | null;
  action: string | null;
  section: string | null;
  timestamp: string;
  source: string;
  vid: string;
  geo: { country: string | null; region: string | null } | null;
  utm: Record<string, string> | null;
}

/**
 * Group events into sessions using the 30-min gap heuristic.
 * Events from the same visitor (vid) within SESSION_GAP_MS = 1 session.
 */
function buildSessions(events: TrackedEvent[]): {
  count: number;
  bounceRate: number;
  avgDuration: number;
  avgPages: number;
} {
  // Group by visitor hash
  const byVisitor = new Map<string, TrackedEvent[]>();
  for (const e of events) {
    if (!e.vid) continue;
    const arr = byVisitor.get(e.vid) || [];
    arr.push(e);
    byVisitor.set(e.vid, arr);
  }

  let sessionCount = 0;
  let bounces = 0;
  let totalDuration = 0;
  let totalPages = 0;

  for (const [, visitorEvents] of byVisitor) {
    // Sort by timestamp ascending
    visitorEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    // Split into sessions by gap
    let sessionStart = new Date(visitorEvents[0].timestamp).getTime();
    let sessionPages = new Set<string>();
    let lastTime = sessionStart;

    sessionPages.add(visitorEvents[0].page);

    for (let i = 1; i < visitorEvents.length; i++) {
      const t = new Date(visitorEvents[i].timestamp).getTime();

      if (t - lastTime > SESSION_GAP_MS) {
        // Close previous session
        sessionCount++;
        totalDuration += lastTime - sessionStart;
        totalPages += sessionPages.size;
        if (sessionPages.size <= 1) bounces++;

        // Start new session
        sessionStart = t;
        sessionPages = new Set();
      }

      sessionPages.add(visitorEvents[i].page);
      lastTime = t;
    }

    // Close last session
    sessionCount++;
    totalDuration += lastTime - sessionStart;
    totalPages += sessionPages.size;
    if (sessionPages.size <= 1) bounces++;
  }

  return {
    count: sessionCount,
    bounceRate: sessionCount > 0 ? Math.round((bounces / sessionCount) * 100) : 0,
    avgDuration: sessionCount > 0 ? Math.round(totalDuration / sessionCount / 1000) : 0, // seconds
    avgPages: sessionCount > 0 ? Math.round((totalPages / sessionCount) * 10) / 10 : 0,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day") || new Date().toISOString().slice(0, 10);
  const days = Math.min(parseInt(searchParams.get("days") || "1", 10), 90);
  const includeTest = searchParams.get("include_test") === "true";

  const results: Record<string, TrackedEvent[]> = {};
  let totalUniqueVisitors = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(day);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    const raw = await store.list(`events:${key}`);
    const events = raw.map((r) => JSON.parse(r) as TrackedEvent);
    const filtered = includeTest
      ? events
      : events.filter((e) => e.source !== "playwright");

    if (filtered.length > 0) {
      results[key] = filtered;
    }

    // Unique visitors per day
    const uv = await store.setSize(`visitors:${key}`);
    totalUniqueVisitors += uv;
  }

  const allEvents = Object.values(results).flat();
  const totalEvents = allEvents.length;
  const pageViews = allEvents.filter((e) => e.event === "page_view").length;

  // --- Session analytics (Feature 2) ---
  const sessions = buildSessions(allEvents);

  // --- Geo breakdown (Feature 3) ---
  const geoBreakdown: Record<string, number> = {};
  for (const e of allEvents) {
    if (e.geo?.country) {
      geoBreakdown[e.geo.country] = (geoBreakdown[e.geo.country] || 0) + 1;
    }
  }

  // --- UTM breakdown (Feature 4) ---
  const utmSources: Record<string, number> = {};
  const utmMediums: Record<string, number> = {};
  const utmCampaigns: Record<string, number> = {};
  for (const e of allEvents) {
    if (e.utm) {
      if (e.utm.utm_source) utmSources[e.utm.utm_source] = (utmSources[e.utm.utm_source] || 0) + 1;
      if (e.utm.utm_medium) utmMediums[e.utm.utm_medium] = (utmMediums[e.utm.utm_medium] || 0) + 1;
      if (e.utm.utm_campaign) utmCampaigns[e.utm.utm_campaign] = (utmCampaigns[e.utm.utm_campaign] || 0) + 1;
    }
  }

  // --- Referrer breakdown (bonus: normalize referrers) ---
  const referrers: Record<string, number> = {};
  for (const e of allEvents) {
    if (e.referrer) {
      try {
        const host = new URL(e.referrer).hostname.replace(/^www\./, "");
        referrers[host] = (referrers[host] || 0) + 1;
      } catch {
        referrers[e.referrer] = (referrers[e.referrer] || 0) + 1;
      }
    }
  }

  return NextResponse.json({
    totalEvents,
    pageViews,
    uniqueVisitors: totalUniqueVisitors,
    days: Object.keys(results).length,
    sessions,
    geo: geoBreakdown,
    utm: {
      sources: utmSources,
      mediums: utmMediums,
      campaigns: utmCampaigns,
    },
    referrers,
    data: results,
  });
}
