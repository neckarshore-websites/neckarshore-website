#!/usr/bin/env node
/**
 * One-off cleanup for analytics keys written before planning#2877, when
 * /api/track stored `events:<day>` and `visitors:<day>` with no expiry.
 *
 * DRY RUN BY DEFAULT. Without `--apply` it reads key names and their TTL and
 * prints COUNTS — never a value, never the token. With `--apply` it does what
 * the dry run announced.
 *
 * Rule per key WITHOUT an expiry (DPO ruling on #2877, 2026-10-05):
 *   - day unreadable or in the future  -> delete (the day was client-supplied
 *                                         until this PR; such a key has no
 *                                         honest retention date)
 *   - day older than RETENTION_DAYS    -> delete (its 90 days are over)
 *   - otherwise                        -> EXPIREAT day + RETENTION_DAYS, i.e.
 *                                         counted from the day in the key name,
 *                                         not from today
 * Keys that already carry an expiry are counted and left alone. Keys of any
 * other family are counted and left alone.
 *
 * Usage (the store credentials must be in the environment):
 *   node scripts/track-retention-cleanup.mjs            # dry run
 *   node scripts/track-retention-cleanup.mjs --apply    # changes production data
 *
 * Tests: tests/unit/analytics-retention.test.ts (the planner below).
 */

export const RETENTION_DAYS = 90; // mirrors src/lib/analytics-store.ts; the unit test compares them
const DAY_MS = 24 * 60 * 60 * 1000;
const FAMILIES = ["events", "visitors"];

/** Parses the day out of `<family>:<YYYY-MM-DD>`; null when it is not a real date. */
function keyDay(key) {
  const m = /^(events|visitors):(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const ms = Date.UTC(Number(m[2]), Number(m[3]) - 1, Number(m[4]));
  // Reject 2026-02-31 and friends: the round trip must give the same string.
  return new Date(ms).toISOString().slice(0, 10) === `${m[2]}-${m[3]}-${m[4]}` ? ms : null;
}

/**
 * Pure planner. `entries` = [{ key, ttl }] with ttl as Redis reports it
 * (-1 = no expiry). `today` = "YYYY-MM-DD" (UTC).
 */
export function planCleanup(entries, today) {
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(todayMs)) throw new Error(`unreadable today: ${today}`);
  const plan = { hasExpiry: [], other: [], deleteUnreadable: [], deleteFuture: [], deleteOverdue: [], expireAt: [] };

  for (const { key, ttl } of entries) {
    const family = key.split(":")[0];
    if (!FAMILIES.includes(family)) {
      plan.other.push(key);
      continue;
    }
    if (ttl !== -1) {
      plan.hasExpiry.push(key);
      continue;
    }
    const dayMs = keyDay(key);
    if (dayMs === null) plan.deleteUnreadable.push(key);
    else if (dayMs > todayMs) plan.deleteFuture.push(key);
    else if (todayMs - dayMs > RETENTION_DAYS * DAY_MS) plan.deleteOverdue.push(key);
    else plan.expireAt.push({ key, at: Math.floor((dayMs + RETENTION_DAYS * DAY_MS) / 1000) });
  }
  return plan;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const { Redis } = await import("@upstash/redis");
  const redis = Redis.fromEnv();

  const entries = [];
  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(cursor, { count: 500 });
    for (const key of keys) entries.push({ key, ttl: await redis.ttl(key) });
    cursor = String(next);
  } while (cursor !== "0");

  const today = new Date().toISOString().slice(0, 10);
  const plan = planCleanup(entries, today);
  const perFamily = (list) =>
    FAMILIES.map((f) => `${f} ${list.filter((k) => (k.key ?? k).startsWith(`${f}:`)).length}`).join(", ");

  console.log(`=== analytics retention cleanup — ${apply ? "APPLY" : "dry run"} — ${today} ===`);
  console.log(`keys scanned:                     ${entries.length}`);
  console.log(`already carry an expiry (left):   ${plan.hasExpiry.length}  (${perFamily(plan.hasExpiry)})`);
  console.log(`other families (left):            ${plan.other.length}`);
  console.log(`no expiry, within ${RETENTION_DAYS} days -> expire: ${plan.expireAt.length}  (${perFamily(plan.expireAt)})`);
  console.log(`no expiry, older than ${RETENTION_DAYS} days -> delete: ${plan.deleteOverdue.length}  (${perFamily(plan.deleteOverdue)})`);
  console.log(`no expiry, day in the future -> delete:  ${plan.deleteFuture.length}`);
  console.log(`no expiry, day unreadable -> delete:     ${plan.deleteUnreadable.length}`);
  // Key names carry a date and nothing else, so listing the odd ones is safe.
  for (const key of [...plan.deleteFuture, ...plan.deleteUnreadable]) console.log(`    ${key}`);

  if (!apply) {
    console.log("\nNothing was changed. Re-run with --apply to do the above.");
    return;
  }
  for (const { key, at } of plan.expireAt) await redis.expireat(key, at);
  for (const key of [...plan.deleteOverdue, ...plan.deleteFuture, ...plan.deleteUnreadable]) {
    await redis.del(key);
  }
  console.log("\nApplied.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`FAIL: ${err.message}`);
    process.exit(1);
  });
}
