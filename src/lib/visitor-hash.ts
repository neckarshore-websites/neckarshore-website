import { createHash } from "crypto";

/**
 * Daily pseudonymous visitor id.
 *
 * SHA-256(salt | IP | User-Agent | day), first 16 hex characters.
 *
 * - PSEUDONYMOUS, not anonymous: while the day's salt exists, the id can be
 *   recomputed for a known IP address and user agent. It is personal data.
 * - The salt is random per UTC day and is deleted by the store about a day
 *   later (SALT_TTL_SECONDS in analytics-store.ts). From then on the id cannot
 *   be recomputed.
 * - It changes every day, so a visitor cannot be followed across days.
 * - The IP address itself is never stored.
 *
 * Lives outside route.ts because a Next.js route file may export only its
 * handlers, and the unit test needs to call this directly.
 */
export function dailyVisitorHash(salt: string, ip: string, ua: string, day: string): string {
  return createHash("sha256")
    .update(`${salt}|${ip}|${ua}|${day}`)
    .digest("hex")
    .slice(0, 16); // 64 bits — enough for uniqueness within a day
}

/** The UTC day and timestamp of an event. Server time only — never the client's. */
export function serverNow(now: Date = new Date()): { timestamp: string; day: string } {
  const timestamp = now.toISOString();
  return { timestamp, day: timestamp.slice(0, 10) };
}

/**
 * Only the hostname of a referring address is kept (planning#2877, DPO
 * condition 1, Art. 5(1)(c)). A full address can carry another site's search
 * terms or tokens, and the only reader uses the hostname anyway.
 * Returns null for anything that is not an http(s) address.
 */
export function referrerHost(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

/** The campaign keys the privacy page names — nothing else is stored. */
export const CAMPAIGN_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
] as const;

/** Keeps only the named campaign keys, as short strings. null when none is left. */
export function pickCampaign(raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== "object") return null;
  const out: Record<string, string> = {};
  for (const key of CAMPAIGN_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === "string" && value.length > 0) out[key] = value.slice(0, 200);
  }
  return Object.keys(out).length > 0 ? out : null;
}
