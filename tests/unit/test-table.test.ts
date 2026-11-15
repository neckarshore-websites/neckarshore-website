/**
 * Unit tests for the grouped /test-management table (src/lib/test-table.ts).
 *
 * The bug-prone bits: the group is derived from three row shapes (public slug, product display
 * name, withheld "privates Repo"); withheld rows must never get a category of their own and are
 * summed into one line; a display name whose repositories fall into different categories stops
 * the build instead of being placed by guess; and the four level columns always add up.
 *
 * Run: npm run test:unit
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { andereParts, grandTotal, tableGroups, typeByDisplayName } from "../../src/lib/test-table";
import type { RepoRow } from "../../src/lib/test-breakdown";

const OVERRIDES = {
  "neckarshore-mmps/snakeoil-check": "Snakeoil-Check",
  "neckarshore-mmps/trustscope": "TrustScope",
  "neckarshore-skills/mailbox-autopilot": "Mailbox Autopilot",
  "omnopsis-ai/omnopsis-backend": "Omnopsis",
  "omnopsis-ai/omnopsis-contracts": "Omnopsis",
  "omnopsis-ai/omnopsis-frontend": "Omnopsis",
};

const ROWS: RepoRow[] = [
  { repo: "privates Repo", total: 1452, byType: { integration: 1397, unit: 55 }, private: true },
  { repo: "TrustScope", total: 348, byType: { e2e: 74, unit: 274 } },
  { repo: "Snakeoil-Check", total: 241, byType: { e2e: 8, unit: 233 }, private: true },
  { repo: "Mailbox Autopilot", total: 2010, byType: { integration: 47, unit: 1963 } },
  { repo: "neckarshore-websites/neckarshore-website", total: 973, byType: { e2e: 600, unit: 373 } },
  { repo: "Omnopsis", total: 593, byType: { e2e: 263, integration: 27, unit: 303 }, private: true },
  { repo: "Omnopsis", total: 86, byType: { smoke: 1, unit: 85 }, private: true },
  { repo: "neckarshore-ai/test-stats-action", total: 50, byType: {}, seeded: true },
  { repo: "privates Repo", total: 109, byType: {}, private: true, seeded: true },
];
const TOTAL = ROWS.reduce((s, r) => s + r.total, 0);

test("groups come in display order, each derived from its row shape", () => {
  const groups = tableGroups(ROWS, OVERRIDES);
  assert.deepEqual(
    groups.map((g) => [g.id, g.label, g.open]),
    [
      ["mmp", "MMPs", true],
      ["web", "Websites", true],
      ["produkt", "Omnopsis", false], // a group with one product only is named after it
      ["skill", "Skills", false],
      ["weitere", "Weitere", false],
    ],
  );
  const mmp = groups.find((g) => g.id === "mmp")!;
  assert.deepEqual(mmp.rows.map((r) => r.name), ["TrustScope", "Snakeoil-Check"], "product names → MMP, largest first");
  const web = groups.find((g) => g.id === "web")!;
  assert.deepEqual(web.rows.map((r) => r.name), ["neckarshore.ai"], "public slug → readable label");
  const omn = groups.find((g) => g.id === "produkt")!;
  assert.deepEqual(omn.rows.map((r) => r.name), ["Omnopsis · 1 von 2", "Omnopsis · 2 von 2"]);
});

test("withheld private rows get no category and are summed into one line, last in Weitere", () => {
  const weitere = tableGroups(ROWS, OVERRIDES).find((g) => g.id === "weitere")!;
  const last = weitere.rows.at(-1)!;
  assert.equal(last.name, "2 private Repositories");
  assert.equal(last.repoCount, 2);
  assert.equal(last.total, 1561);
  assert.deepEqual([last.unit, last.integration, last.e2e, last.andere], [55, 1397, 0, 109]);
  assert.equal(last.seeded, true, "one seeded part marks the summed line");
  assert.equal(weitere.repoCount, 3, "the summed line counts as the repositories it stands for");
  for (const g of tableGroups(ROWS, OVERRIDES)) {
    if (g.id === "weitere") continue;
    assert.ok(!g.rows.some((r) => r.name.includes("privat")), `${g.id} holds no withheld row`);
  }
});

test("a row without a split is marked unsplit and counts fully as Andere", () => {
  const tool = tableGroups(ROWS, OVERRIDES)
    .find((g) => g.id === "weitere")!
    .rows.find((r) => r.name === "test-stats-action")!;
  assert.equal(tool.unsplit, true);
  assert.equal(tool.seeded, true);
  assert.equal(tool.andere, 50);
});

test("every row, every group and the grand total add up across the four columns", () => {
  const groups = tableGroups(ROWS, OVERRIDES);
  for (const g of groups) {
    for (const r of [...g.rows, g.sums]) {
      assert.equal(r.unit + r.integration + r.e2e + r.andere, r.total);
    }
    assert.equal(g.rows.reduce((s, r) => s + r.total, 0), g.sums.total);
  }
  assert.equal(grandTotal(groups).total, TOTAL);
});

test("a display name whose repositories fall into different categories stops the build", () => {
  assert.throws(
    () => typeByDisplayName({ ...OVERRIDES, "neckarshore-mmps/omnopsis-lite": "Omnopsis" }),
    /different categories/,
  );
});

test("a product name that disclosure-config.json does not know stops the build", () => {
  assert.throws(() => tableGroups([{ repo: "Unknown Product", total: 1, byType: { unit: 1 } }], OVERRIDES), /refusing to guess/);
});

test("andereParts names smoke and unsplit tests separately", () => {
  assert.deepEqual(andereParts(ROWS), { smokeAndOther: 1, unsplit: 159, unsplitRepos: 2 });
});
