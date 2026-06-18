/**
 * Regression guard for the Lighthouse profile definitions.
 *
 * Why this exists: the "Edge-5G" mislabel (a 400 Kbps profile named after the
 * fastest network tier) was flagged 2026-04-10, re-diagnosed 2026-06-02, and
 * still shipped wrong — it took until 2026-06-18 to correct. This test locks
 * the correction so the swap cannot silently drift back a fourth time.
 *
 * Run: npm run test:lighthouse:unit
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { PROFILES } from "./lighthouse-profiles.mjs";

const byName = Object.fromEntries(PROFILES.map((p) => [p.name, p]));

/** Extract a numeric --throttling.<key>=<n> value from a profile's lhArgs. */
function throttle(profile, key) {
  const prefix = `--throttling.${key}=`;
  const arg = profile.lhArgs.find((a) => a.startsWith(prefix));
  return arg ? Number(arg.slice(prefix.length)) : undefined;
}

test("exactly the three canonical profiles, in order", () => {
  assert.deepEqual(
    PROFILES.map((p) => p.name),
    ["desktop", "mobile-5g", "mobile-4g"]
  );
});

test("the retired Edge-5G / mobile-slow profile is gone", () => {
  const names = PROFILES.map((p) => p.name);
  assert.ok(!names.includes("mobile-slow"), "mobile-slow must not exist");
  assert.ok(!names.includes("edge-5g"), "edge-5g must not exist");
  for (const p of PROFILES) {
    assert.ok(
      !/edge|slow/i.test(p.label),
      `label "${p.label}" must not reference Edge/Slow`
    );
  }
});

test("5G is faster than 4G — higher throughput, lower latency", () => {
  assert.ok(
    throttle(byName["mobile-5g"], "throughputKbps") >
      throttle(byName["mobile-4g"], "throughputKbps"),
    "5G throughput must exceed 4G"
  );
  assert.ok(
    throttle(byName["mobile-5g"], "rttMs") < throttle(byName["mobile-4g"], "rttMs"),
    "5G RTT must be lower than 4G"
  );
});

test("mobile profiles differ only by network — CPU throttle is equal", () => {
  assert.equal(
    throttle(byName["mobile-5g"], "cpuSlowdownMultiplier"),
    throttle(byName["mobile-4g"], "cpuSlowdownMultiplier"),
    "both mobile profiles must use the same CPU multiplier (network-only delta)"
  );
});

test("performance is SOFT on every profile (advisory, never blocks)", () => {
  for (const p of PROFILES) {
    assert.ok(
      p.softMetrics?.includes("performance"),
      `profile "${p.name}" must list performance in softMetrics`
    );
  }
});

test("accessibility / best-practices / seo are HARD @95 on every profile", () => {
  for (const p of PROFILES) {
    for (const cat of ["accessibility", "best-practices", "seo"]) {
      assert.equal(p.thresholds[cat], 95, `${p.name}.${cat} threshold must be 95`);
      assert.ok(
        !p.softMetrics?.includes(cat),
        `${p.name}.${cat} must stay a hard gate (not in softMetrics)`
      );
    }
  }
});
