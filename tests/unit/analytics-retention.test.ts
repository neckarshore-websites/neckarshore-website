/**
 * Guards for the analytics retention rules (planning#2877).
 *
 * Five questions, each with a failure behind it:
 * 1. Does every key /api/track writes get an expiry? (Until 2026-10-05 none did.)
 * 2. Can a later write push an expiry out? (Then "90 days" would mean "90 days
 *    after the last write".)
 * 3. Is the visitor id salted, and is the salt short-lived? (Unsalted, the id
 *    can be recomputed for a known IP address and user agent forever.)
 * 4. Does the route take day and time from the server? (The day names the
 *    storage key; a client-chosen day makes the expiry uncheckable.)
 * 5. Does the one-off cleanup sort old keys the way the DPO ruled?
 *
 * WHAT THIS CANNOT DO: prove that the production store honours EXPIRE. That is
 * a read of one key's TTL on the live store after deploy — see the PR body.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createRedisStore,
  RETENTION_DAYS,
  RETENTION_SECONDS,
  SALT_TTL_SECONDS,
  type RedisLike,
  type RedisTx,
} from "../../src/lib/analytics-store";
import { dailyVisitorHash, pickCampaign, referrerHost, serverNow } from "../../src/lib/visitor-hash";
import { planCleanup, printable, RETENTION_DAYS as CLEANUP_DAYS } from "../../scripts/track-retention-cleanup.mjs";

type Call = [string, ...unknown[]];

/** A fake that records calls and honours SET NX — nothing else. */
function fakeRedis(): { redis: RedisLike; calls: Call[] } {
  const calls: Call[] = [];
  const strings = new Map<string, string>();
  const redis: RedisLike = {
    multi() {
      // Records the queued commands as ONE entry at exec() — so the test sees
      // whether write and expiry travelled together.
      const queued: unknown[][] = [];
      const tx: RedisTx = {
        lpush(key, value) {
          queued.push(["lpush", key, value]);
          return tx;
        },
        sadd(key, value) {
          queued.push(["sadd", key, value]);
          return tx;
        },
        expire(key, seconds, option) {
          queued.push(["expire", key, seconds, option]);
          return tx;
        },
        async exec() {
          calls.push(["exec", ...queued]);
        },
      };
      return tx;
    },
    async lrange() {
      return [];
    },
    async scard() {
      return 0;
    },
    async set(key, value, opts) {
      calls.push(["set", key, opts]);
      if (!strings.has(key)) strings.set(key, value);
    },
    async get(key) {
      return strings.get(key) ?? null;
    },
  };
  return { redis, calls };
}

/* 1 + 2. Every write carries an expiry, and it cannot be extended ------------- */

test("push writes the event and its 90-day expiry in one transaction", async () => {
  const { redis, calls } = fakeRedis();
  await createRedisStore(redis).push("events:2026-10-05", "{}");
  assert.deepEqual(calls, [
    ["exec", ["lpush", "events:2026-10-05", "{}"], ["expire", "events:2026-10-05", RETENTION_SECONDS, "NX"]],
  ]);
});

test("addToSet writes the visitor and its 90-day expiry in one transaction", async () => {
  const { redis, calls } = fakeRedis();
  await createRedisStore(redis).addToSet("visitors:2026-10-05", "abc");
  assert.deepEqual(calls, [
    ["exec", ["sadd", "visitors:2026-10-05", "abc"], ["expire", "visitors:2026-10-05", RETENTION_SECONDS, "NX"]],
  ]);
});

test("the retention period is 90 days, in the store and in the cleanup script", () => {
  assert.equal(RETENTION_DAYS, 90);
  assert.equal(RETENTION_SECONDS, 90 * 24 * 60 * 60);
  assert.equal(CLEANUP_DAYS, RETENTION_DAYS);
});

test("the privacy page states the same retention period as the code", () => {
  const seite = readFileSync(new URL("../../src/app/datenschutz/page.tsx", import.meta.url), "utf8");
  const flach = seite.replace(/\s+/g, " ");
  assert.ok(
    flach.includes(`werden ${RETENTION_DAYS} Tage nach dem ersten Eintrag dieses Tages automatisch gelöscht`),
    "privacy page does not name the retention period",
  );
  // The three sentences the DPO struck (planning#2877) must not come back.
  for (const weg of ["anonymisiert", "nicht auf IP-Adresse oder Person rückführbar", "kein personenbezogenes Datum persistiert", "Es werden keine Daten an Dritte übermittelt"]) {
    assert.ok(!flach.includes(weg), `struck wording is back on the privacy page: ${weg}`);
  }
  assert.ok(flach.includes("Upstash, Inc. (USA)"), "privacy page does not name Upstash");
});

/* 3. Salted, and the salt is short-lived ------------------------------------- */

test("the daily salt is created once per day and expires within 25 hours", async () => {
  const { redis, calls } = fakeRedis();
  const store = createRedisStore(redis);
  const first = await store.dailySalt("2026-10-05");
  const again = await store.dailySalt("2026-10-05");
  const next = await store.dailySalt("2026-10-06");

  assert.equal(first, again, "a second request on the same day must read the same salt");
  assert.notEqual(first, next, "a new day must get a new salt");
  assert.ok(first.length >= 64, "salt is too short");
  assert.ok(SALT_TTL_SECONDS <= 25 * 60 * 60, "the salt must not outlive its day by more than an hour");
  for (const [name, , opts] of calls.filter((c) => c[0] === "set")) {
    assert.deepEqual([name, opts], ["set", { nx: true, ex: SALT_TTL_SECONDS }]);
  }
});

test("without a salt the store refuses instead of handing out a recomputable id", async () => {
  const { redis } = fakeRedis();
  redis.get = async () => null;
  await assert.rejects(createRedisStore(redis).dailySalt("2026-10-05"), /salt unavailable/);
});

test("the visitor id depends on the salt", () => {
  const a = dailyVisitorHash("s:one", "203.0.113.7", "UA", "2026-10-05");
  const b = dailyVisitorHash("s:two", "203.0.113.7", "UA", "2026-10-05");
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.notEqual(a, b);
});

/* 4. Server time only --------------------------------------------------------- */

test("serverNow derives the day from the given clock", () => {
  assert.deepEqual(serverNow(new Date("2026-10-05T23:59:59.000Z")), {
    timestamp: "2026-10-05T23:59:59.000Z",
    day: "2026-10-05",
  });
});

test("the route never reads a timestamp from the request body", () => {
  const route = readFileSync(new URL("../../src/app/api/track/route.ts", import.meta.url), "utf8");
  assert.doesNotMatch(route, /body\.timestamp/);
  assert.match(route, /serverNow\(\)/);
  assert.match(route, /store\.dailySalt\(day\)/);
});

test("printable() makes a hostile key name inert", () => {
  // Key names were client-influenced before this change (the day came from the
  // request body), so one may carry terminal escape sequences or line breaks.
  assert.equal(printable("events:\u001b[2J\u001b[31mowned\nFAKE LINE"), '"events:\\u001b[2J\\u001b[31mowned\\nFAKE LINE"');
  assert.equal(printable("events:2026-10-05"), '"events:2026-10-05"');
  assert.ok(printable("x".repeat(500)).length <= 130);
});

/* 4b. Data minimisation at write time ----------------------------------------- */

test("only the hostname of a referrer is kept", () => {
  assert.equal(referrerHost("https://www.google.com/search?q=private+words&token=abc"), "google.com");
  assert.equal(referrerHost("https://example.org:8443/a/b#frag"), "example.org");
  assert.equal(referrerHost("javascript:alert(1)"), null);
  assert.equal(referrerHost("not a url"), null);
  assert.equal(referrerHost(""), null);
  assert.equal(referrerHost(undefined), null);
});

test("only the six campaign keys the privacy page names are kept", () => {
  assert.deepEqual(pickCampaign({ utm_source: "rauhut", ref: "x", email: "a@b.c", utm_term: 7 }), {
    utm_source: "rauhut",
    ref: "x",
  });
  assert.equal(pickCampaign({ email: "a@b.c" }), null);
  assert.equal(pickCampaign("utm_source=x"), null);
  assert.equal(pickCampaign({ utm_source: "y".repeat(500) })?.utm_source.length, 200);
});

test("the route stores the cut referrer and the picked campaign keys, never the raw fields", () => {
  const route = readFileSync(new URL("../../src/app/api/track/route.ts", import.meta.url), "utf8");
  assert.match(route, /referrer: referrerHost\(body\.referrer\)/);
  assert.match(route, /utm: pickCampaign\(body\.utm\)/);
  assert.doesNotMatch(route, /body\.(referrer|utm) \|\|/);
});

/* 5. The one-off cleanup ------------------------------------------------------ */

test("planCleanup sorts keys without an expiry by the day in their name", () => {
  const plan = planCleanup(
    [
      { key: "events:2026-10-01", ttl: -1 }, // within 90 days -> expire at day + 90
      { key: "visitors:2026-07-07", ttl: -1 }, // exactly 90 days old -> still kept
      { key: "events:2026-07-06", ttl: -1 }, // 91 days -> overdue
      { key: "events:2099-01-01", ttl: -1 }, // future -> delete
      { key: "events:2026-02-31", ttl: -1 }, // not a date -> delete
      { key: "events:garbage", ttl: -1 }, // not a date -> delete
      { key: "visitors:2026-10-04", ttl: 5000 }, // already expiring -> untouched
      { key: "salt:2026-10-05", ttl: 3000 }, // other family -> untouched
      { key: "something-else", ttl: -1 }, // other family -> untouched, even without expiry
    ],
    "2026-10-05",
  );
  assert.deepEqual(plan.expireAt, [
    { key: "events:2026-10-01", at: Date.UTC(2026, 11, 30) / 1000 },
    { key: "visitors:2026-07-07", at: Date.UTC(2026, 9, 5) / 1000 },
  ]);
  assert.deepEqual(plan.deleteOverdue, ["events:2026-07-06"]);
  assert.deepEqual(plan.deleteFuture, ["events:2099-01-01"]);
  assert.deepEqual(plan.deleteUnreadable, ["events:2026-02-31", "events:garbage"]);
  assert.deepEqual(plan.hasExpiry, ["visitors:2026-10-04"]);
  assert.deepEqual(plan.other, ["salt:2026-10-05", "something-else"]);
});
