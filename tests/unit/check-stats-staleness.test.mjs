/**
 * Unit tests for scripts/check-stats-staleness.mjs — durable-estate-count Block 5 (collector
 * staleness gate). The COMPENSATING CONTROL while audited_floor lives: max() masks any silent
 * under-report from a live producer whose CI stopped emitting; this surfaces such a producer as
 * a VISIBLE warn (never silent, never a hard fail — guardrail #244: the daily publish must not
 * abort).
 *
 * Staleness signal = each producer's own stats.json `updatedAt` (the emit timestamp). A producer
 * whose updatedAt is older than the threshold either stopped pushing to main or its emit CI broke;
 * either way its contribution is potentially stale and worth a human glance. A quiet-but-healthy
 * repo also trips it — WARN-only by design, so a false-positive costs a glance, not a broken build.
 *
 * Pure classifier (list-in -> classification-out), so the logic is deterministic + unit-gated with
 * no filesystem or clock dependency (the CLI wrapper injects `now` + reads the stats dir).
 *
 * Run: npm run test:unit
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyStaleness, ageDays } from "../../scripts/check-stats-staleness.mjs";

const NOW = Date.parse("2026-07-16T12:00:00Z");
const DAY = 86_400_000;

test("ageDays: whole-day difference from an ISO timestamp against a now-epoch", () => {
  assert.equal(ageDays("2026-07-06T12:00:00Z", NOW), 10);
  assert.equal(ageDays("2026-07-16T12:00:00Z", NOW), 0);
});

test("a producer emitted today is fresh (not stale)", () => {
  const out = classifyStaleness(
    [{ repo: "neckarshore-websites/rauhut-website", updatedAt: "2026-07-16T06:00:00Z" }],
    NOW,
    14,
  );
  assert.equal(out.thresholdDays, 14);
  assert.equal(out.stale.length, 0);
  assert.equal(out.producers[0].stale, false);
  assert.equal(out.producers[0].ageDays, 0);
});

test("a producer older than the threshold is flagged stale, with its age", () => {
  const out = classifyStaleness(
    [{ repo: "neckarshore-websites/goldoni-website", updatedAt: "2026-06-01T12:00:00Z" }],
    NOW,
    14,
  );
  assert.equal(out.stale.length, 1);
  assert.equal(out.stale[0].repo, "neckarshore-websites/goldoni-website");
  assert.equal(out.stale[0].ageDays, 45);
  assert.equal(out.producers[0].stale, true);
});

test("exactly at the threshold is NOT stale; one day past IS (strictly greater than)", () => {
  const atBoundary = new Date(NOW - 14 * DAY).toISOString();
  const pastBoundary = new Date(NOW - 15 * DAY).toISOString();
  const out = classifyStaleness(
    [
      { repo: "at/boundary", updatedAt: atBoundary },
      { repo: "past/boundary", updatedAt: pastBoundary },
    ],
    NOW,
    14,
  );
  assert.deepEqual(
    out.stale.map((s) => s.repo),
    ["past/boundary"],
  );
});

test("a producer with no updatedAt (missing/unparseable) is flagged stale, not silently skipped", () => {
  const out = classifyStaleness(
    [
      { repo: "no/timestamp", updatedAt: null },
      { repo: "bad/timestamp", updatedAt: "not-a-date" },
    ],
    NOW,
    14,
  );
  assert.equal(out.stale.length, 2);
  assert.equal(out.stale[0].ageDays, null);
  assert.equal(out.producers.every((p) => p.stale), true);
});

test("stale rows are sorted oldest-first so the WARN leads with the worst offender", () => {
  const out = classifyStaleness(
    [
      { repo: "b/two", updatedAt: "2026-06-20T12:00:00Z" }, // 26d
      { repo: "a/one", updatedAt: "2026-05-01T12:00:00Z" }, // 76d
      { repo: "c/missing", updatedAt: null }, // unknown age -> last
    ],
    NOW,
    14,
  );
  assert.deepEqual(
    out.stale.map((s) => s.repo),
    ["a/one", "b/two", "c/missing"],
  );
});

test("empty producer list yields no stale rows and never throws", () => {
  const out = classifyStaleness([], NOW, 14);
  assert.deepEqual(out.stale, []);
  assert.deepEqual(out.producers, []);
});
