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
