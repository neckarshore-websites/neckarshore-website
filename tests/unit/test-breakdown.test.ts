/**
 * Unit tests for the /test-management breakdown (src/lib/test-breakdown.ts, #370).
 *
 * The bug-prone bits: the sum check that stops the build (each way the numbers can disagree is
 * named separately), level columns that keep an unknown producer key instead of dropping it,
 * and the display names — three repositories share "Omnopsis" and must be told apart without a
 * slug, while "privates Repo" rows stay anonymous.
 *
 * Run: npm run test:unit
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertBreakdown,
  breakdownProblems,
  displayRows,
  levelColumns,
  unsplitCount,
  type RepoRow,
} from "../../src/lib/test-breakdown";

const ROWS: RepoRow[] = [
  { repo: "Omnopsis", total: 86, byType: { smoke: 1, unit: 85 }, private: true },
  { repo: "privates Repo", total: 33, byType: {}, private: true },
  { repo: "Omnopsis", total: 593, byType: { e2e: 263, integration: 27, unit: 303 }, private: true },
  { repo: "neckarshore-websites/neckarshore-website", total: 960, byType: { e2e: 598, unit: 362 } },
  { repo: "privates Repo", total: 214, byType: { unit: 214 }, private: true },
  { repo: "Omnopsis", total: 227, byType: { e2e: 23, unit: 204 }, private: true },
  { repo: "neckarshore-ai/test-stats-action", total: 40, byType: {} },
];

const BY_TYPE = { e2e: 884, integration: 27, smoke: 1, unit: 1168 };
const ESTATE = { total: 2153, byType: BY_TYPE, untyped_total: 73, floor: true, per_repo: ROWS };
const TILE = { total: 2153, byType: { ...BY_TYPE }, untyped_total: 73, floor: true };

test("consistent data → no problems, assertBreakdown does not throw", () => {
  assert.deepEqual(breakdownProblems(ESTATE, TILE), []);
  assert.doesNotThrow(() => assertBreakdown(ESTATE, TILE));
});

test("parts that do not sum to the headline are refused", () => {
  const p = breakdownProblems({ ...ESTATE, total: 2154 }, { ...TILE, total: 2154 });
  assert.ok(p.some((m) => m.includes("headline is 2154")), p.join("\n"));
  assert.throws(() => assertBreakdown({ ...ESTATE, total: 2154 }, { ...TILE, total: 2154 }), /does not add up/);
});

test("a row whose split does not match its own total is refused", () => {
  const rows = ROWS.map((r) => (r.total === 960 ? { ...r, total: 961 } : r));
  const p = breakdownProblems({ ...ESTATE, total: 2154, per_repo: rows }, { ...TILE, total: 2154 });
  assert.ok(p.some((m) => m.includes("splits into 960, its total is 961")), p.join("\n"));
});

test("'ohne Zuordnung' must equal the rows without a split", () => {
  const p = breakdownProblems({ ...ESTATE, untyped_total: 74, total: 2154 }, { ...TILE, untyped_total: 74, total: 2154 });
  assert.ok(p.some((m) => m.includes("rows without a split hold 73")), p.join("\n"));
});

test("a level column that does not sum to its declared total is refused", () => {
  const byType = { ...BY_TYPE, unit: 1167, e2e: 885 };
  const p = breakdownProblems({ ...ESTATE, byType }, { ...TILE, byType });
  assert.ok(p.some((m) => m.startsWith("column unit sums to 1168")), p.join("\n"));
  assert.ok(p.some((m) => m.startsWith("column e2e sums to 884")), p.join("\n"));
});

test("page and tile must agree on total, floor, untyped_total and every level", () => {
  assert.ok(breakdownProblems(ESTATE, { ...TILE, floor: false }).some((m) => m.includes("floor")));
  assert.ok(breakdownProblems(ESTATE, { ...TILE, untyped_total: 0 }).some((m) => m.includes("untyped_total")));
  assert.ok(
    breakdownProblems(ESTATE, { ...TILE, byType: { ...BY_TYPE, unit: 1 } }).some((m) => m.includes("tile unit 1")),
  );
  assert.ok(breakdownProblems(ESTATE, null).some((m) => m.includes("no testScope")));
});

test("an applied audited floor (headline above the parts) fails on purpose", () => {
  const p = breakdownProblems({ ...ESTATE, total: 3000 }, { ...TILE, total: 3000 });
  assert.ok(p.length > 0);
});

test("levelColumns: four known levels in fixed order, unknown keys A→Z after them", () => {
  assert.deepEqual(
    levelColumns({ unit: 1 }, []).map((c) => c.label),
    ["Unit", "Integration", "End-to-End", "Smoke"],
  );
  const cols = levelColumns({ unit: 1, perf: 2 }, [{ repo: "x/y", total: 3, byType: { contract: 3 } }]);
  assert.deepEqual(
    cols.map((c) => c.key),
    ["unit", "integration", "e2e", "smoke", "contract", "perf"],
  );
});

test("displayRows: largest first, shared names numbered by size, withheld rows anonymous", () => {
  const rows = displayRows(ROWS);
  assert.deepEqual(
    rows.map((r) => r.total),
    [960, 593, 227, 214, 86, 40, 33],
  );
  assert.deepEqual(
    rows.filter((r) => r.name.startsWith("Omnopsis")).map((r) => r.name),
    ["Omnopsis · 1\u00a0von\u00a03", "Omnopsis · 2\u00a0von\u00a03", "Omnopsis · 3\u00a0von\u00a03"],
  );
  // Withheld rows keep the literal label, unnumbered, no type.
  const withheld = rows.filter((r) => r.withheld);
  assert.equal(withheld.length, 2);
  for (const r of withheld) {
    assert.equal(r.name, "privates Repo");
    assert.equal(r.type, null);
  }
  // Public slug → last segment + type; product name → type unknown.
  const site = rows.find((r) => r.total === 960)!;
  assert.equal(site.name, "neckarshore-website");
  assert.equal(site.type, "Webseite");
  assert.equal(rows.find((r) => r.total === 593)!.type, null);
  // Keys are unique (React list keys).
  assert.equal(new Set(rows.map((r) => r.key)).size, rows.length);
});

test("displayRows: a row without a split carries split null, never zeros", () => {
  const rows = displayRows(ROWS);
  assert.equal(rows.find((r) => r.total === 40)!.split, null);
  assert.equal(rows.find((r) => r.total === 33)!.split, null);
  assert.deepEqual(rows.find((r) => r.total === 86)!.split, { smoke: 1, unit: 85 });
  assert.equal(unsplitCount(ROWS), 2);
});

test("displayRows: a name used once gets no number", () => {
  const rows = displayRows([{ repo: "ClearPath", total: 110, byType: { unit: 110 } }]);
  assert.equal(rows[0].name, "ClearPath");
});
