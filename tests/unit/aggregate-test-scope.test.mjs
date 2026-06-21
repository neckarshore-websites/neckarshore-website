/**
 * Unit tests for scripts/aggregate-test-scope.sh — the estate test-scope aggregator.
 *
 * Why this exists: the script is the load-bearing "honest estate test number" logic
 * (Charter Artifact 6). The no-double-count rule (byType additive, lenses excluded) and
 * fail-closed-visible behaviour (a declared producer whose stats.json is missing/unparseable
 * → 0 + WARN + missing[]) are exactly the bug-prone parts. They are tested here against the
 * EXACT production code path: the script is pure dir-in → JSON-out, so the unit test exercises
 * the same jq aggregation that runs in CI. Only the curl fetch (a thin shim) lives in the
 * workflow YAML and is out of scope here (covered by the Task-2 workflow_dispatch dry-run).
 *
 * Contract: docs/reference/stats-json-contract.md (neckarshore-planning).
 * Run: npm run test:unit
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(__dirname, "../../scripts/aggregate-test-scope.sh");

/** owner/name → the per-repo file name the aggregator looks up in the stats dir. */
function statsFileName(owner, name) {
  return `${owner}__${name}.json`;
}

/**
 * Build an isolated fixture tree and run the aggregator against it.
 * @param repos  [{ owner, name, statsPath, stats }] — `stats` written to the dir
 *               (object → JSON, string → verbatim, undefined → file omitted = missing).
 * @returns { json, stdout, stderr, status }
 */
function runAggregator(repos) {
  const root = mkdtempSync(path.join(tmpdir(), "agg-test-scope-"));
  try {
    const statsDir = path.join(root, "stats");
    mkdirSync(statsDir);

    const config = {
      repos: repos.map(({ owner, name, statsPath }) => ({
        owner,
        name,
        ...(statsPath !== undefined ? { statsPath } : {}),
      })),
    };
    const configPath = path.join(root, "stats-config.json");
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    for (const { owner, name, stats } of repos) {
      if (stats === undefined) continue; // missing file
      const file = path.join(statsDir, statsFileName(owner, name));
      writeFileSync(file, typeof stats === "string" ? stats : JSON.stringify(stats));
    }

    const result = spawnSync("bash", [SCRIPT, configPath, statsDir], {
      encoding: "utf8",
    });
    let json;
    try {
      json = JSON.parse(result.stdout);
    } catch {
      json = null;
    }
    return { json, stdout: result.stdout, stderr: result.stderr, status: result.status };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("aggregates total + byType additively, excludes lenses, reports missing producer", () => {
  const { json, status } = runAggregator([
    {
      owner: "fix",
      name: "a",
      statsPath: "any/stats.json",
      stats: {
        repo: "fix/a",
        audited_sha: "aaa111",
        tests: { total: 215, byType: { unit: 19, e2e: 196 }, lenses: { seo_geo: 44 } },
        endpoints: 10,
        updatedAt: "2026-06-21T00:00:00Z",
      },
    },
    {
      owner: "fix",
      name: "b",
      statsPath: "any/stats.json",
      stats: {
        repo: "fix/b",
        audited_sha: "bbb222",
        tests: { total: 81, byType: { unit: 81 } },
        updatedAt: "2026-06-21T00:00:00Z",
      },
    },
    { owner: "fix", name: "c", statsPath: "any/stats.json", stats: undefined },
  ]);

  assert.equal(status, 0, "aggregator must exit 0 even with a missing producer (fail-soft)");
  assert.ok(json, "stdout must be valid JSON");

  // total = 215 + 81 (lenses NOT summed)
  assert.equal(json.total, 296);
  // byType merge-add; lenses (seo_geo) excluded entirely
  assert.deepEqual(json.byType, { unit: 100, e2e: 196 });
  assert.ok(!("seo_geo" in json.byType), "lenses must never leak into estate byType");

  assert.equal(json.reporting, 2);
  assert.equal(json.expected, 3);
  assert.deepEqual(json.missing, ["fix/c"]);
});

test("fail-soft: a producer with total but no byType still contributes its total", () => {
  // Mirrors the live omnopsis-backend old shape (tests.total present, byType absent)
  // before Bob's Task-1 producer lands. It must NOT be dropped to missing/0.
  const { json, status } = runAggregator([
    {
      owner: "omnopsis-ai",
      name: "omnopsis-backend",
      statsPath: "backend/stats.json",
      stats: { repo: "omnopsis-ai/omnopsis-backend", tests: { total: 551 }, endpoints: 96 },
    },
  ]);

  assert.equal(status, 0);
  assert.ok(json);
  assert.equal(json.total, 551);
  assert.deepEqual(json.byType, {}, "absent byType degrades to empty, not a crash");
  assert.equal(json.reporting, 1);
  assert.equal(json.expected, 1);
  assert.deepEqual(json.missing, []);
});

test("fail-closed-visible: an unparseable stats.json → 0 + WARN + missing[]", () => {
  const { json, stderr, status } = runAggregator([
    {
      owner: "fix",
      name: "broken",
      statsPath: "any/stats.json",
      stats: "this is not json {{{",
    },
  ]);

  assert.equal(status, 0, "a broken producer must not fail the whole run");
  assert.ok(json);
  assert.equal(json.total, 0);
  assert.deepEqual(json.byType, {});
  assert.equal(json.reporting, 0);
  assert.equal(json.expected, 1);
  assert.deepEqual(json.missing, ["fix/broken"]);
  assert.match(stderr, /WARN/, "a missing/unparseable producer must emit a visible WARN");
});

test("repos without a statsPath are not producers (not counted in expected)", () => {
  const { json, status } = runAggregator([
    {
      owner: "fix",
      name: "producer",
      statsPath: "s.json",
      stats: { repo: "fix/producer", tests: { total: 7, byType: { unit: 7 } } },
    },
    { owner: "fix", name: "not-a-producer", statsPath: undefined, stats: undefined },
  ]);

  assert.equal(status, 0);
  assert.ok(json);
  assert.equal(json.total, 7);
  assert.equal(json.expected, 1, "only repos with a statsPath are expected producers");
  assert.equal(json.reporting, 1);
  assert.deepEqual(json.missing, []);
});

test("missing[] is sorted A→Z", () => {
  const { json } = runAggregator([
    { owner: "z", name: "z", statsPath: "s.json", stats: undefined },
    { owner: "a", name: "a", statsPath: "s.json", stats: undefined },
    { owner: "m", name: "m", statsPath: "s.json", stats: undefined },
  ]);
  assert.deepEqual(json.missing, ["a/a", "m/m", "z/z"]);
});
