/**
 * Unit tests for scripts/append-test-scope-history.mjs — backlog #264 (history trendline, storage only).
 *
 * Locks the behaviours the task calls out:
 *   (a) upsert idempotency  — re-running the same date replaces, never duplicates; dates stay sorted.
 *   (b) privacy             — a raw private slug in a served history file fails the #267 leak gate.
 *   (c) row fidelity        — the row's scalar fields mirror the source, and per_repo COLLISION-SUMMING
 *                             is verlustfrei (Σ output === Σ input, colliding display names merge).
 *
 * Test (c) is deliberately decoupled from the aggregator: it asserts what the APPENDER does
 * (field-fidelity + collision-summing on a controlled fixture), not the aggregator's
 * Σ(source.per_repo)===total invariant. The real-data Omnopsis===905 line is a spot-check only.
 *
 * Run: npm run test:unit
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildHistoryRow, upsertRows, serializeHistory, parseHistory } from "../../scripts/append-test-scope-history.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const GATE = path.join(ROOT, "scripts", "check-private-slug-leak.sh");

/** A minimal POST-withhold estate-test-scope object with a controlled per_repo collision. */
function fixtureScope() {
  return {
    updatedAt: "2026-07-02T07:00:09Z",
    total: 1000,
    floor: true,
    repos: 5,
    reporting: 1,
    byType: { unit: 600, e2e: 400 },
    per_repo: [
      { repo: "Omnopsis", total: 588, private: true },
      { repo: "Omnopsis", total: 232, private: true, seeded: true }, // collides — must SUM to 820
      { repo: "neckarshore-websites/neckarshore-website", total: 150, seeded: true },
      { repo: "privates Repo", total: 20, private: true, seeded: true },
      { repo: "privates Repo", total: 10, private: true, seeded: true }, // collides — must SUM to 30
    ],
  };
}

// ── (c) row fidelity + collision-summing ────────────────────────────────────────────────────────

test("(c) scalar fields mirror the source snapshot", () => {
  const row = buildHistoryRow(fixtureScope());
  assert.equal(row.date, "2026-07-02", "date = updatedAt sliced to YYYY-MM-DD");
  assert.equal(row.total, 1000);
  assert.equal(row.floor, true);
  assert.equal(row.repos, 5);
  assert.equal(row.reporting, 1);
  assert.deepEqual(row.byType, { e2e: 400, unit: 600 }, "byType preserved (keys sorted A→Z)");
});

test("(c) per_repo collision-summing is verlustfrei: colliding display names merge, Σ preserved", () => {
  const scope = fixtureScope();
  const row = buildHistoryRow(scope);
  assert.equal(row.per_repo["Omnopsis"], 820, "3-way→2-way here: 588 + 232 summed, not overwritten");
  assert.equal(row.per_repo["privates Repo"], 30, "20 + 10 summed");
  assert.equal(row.per_repo["neckarshore-websites/neckarshore-website"], 150);

  const sumOut = Object.values(row.per_repo).reduce((a, b) => a + b, 0);
  const sumIn = scope.per_repo.reduce((a, r) => a + r.total, 0);
  assert.equal(sumOut, sumIn, "no row dropped — Σ(output buckets) === Σ(input totals)");
  assert.equal(Object.keys(row.per_repo).length, 3, "5 rows collapse to 3 distinct display names");
});

test("(c) per_repo keys are sorted A→Z (byte-stable diffs)", () => {
  const row = buildHistoryRow(fixtureScope());
  const keys = Object.keys(row.per_repo);
  assert.deepEqual(keys, [...keys].sort((a, b) => a.localeCompare(b)));
});

test("(c) throws on a missing/malformed updatedAt (no honest date → no datapoint)", () => {
  assert.throws(() => buildHistoryRow({ total: 1, per_repo: [] }), /no valid updatedAt/);
  assert.throws(() => buildHistoryRow({ updatedAt: "not-a-date", per_repo: [] }), /no valid updatedAt/);
});

test("(c) spot-check against the committed served artifact (Σ per_repo === total, Omnopsis merged)", () => {
  const src = path.join(ROOT, "public", "estate-test-scope.json");
  if (!fs.existsSync(src)) return; // artifact optional in a fresh checkout
  const scope = JSON.parse(fs.readFileSync(src, "utf-8"));
  const row = buildHistoryRow(scope);
  const sum = Object.values(row.per_repo).reduce((a, b) => a + b, 0);
  assert.equal(sum, row.total, "collision-summed per_repo reconstructs the headline total");
  if (scope.per_repo.some((r) => r.repo === "Omnopsis")) {
    assert.ok(row.per_repo["Omnopsis"] > 0, "the multiple Omnopsis products merge into one bucket");
  }
});

// ── (a) upsert idempotency ───────────────────────────────────────────────────────────────────────

test("(a) re-running the same date replaces the row (idempotent — exactly one row per date)", () => {
  const day1a = buildHistoryRow(fixtureScope());
  let rows = upsertRows([], day1a);
  assert.equal(rows.length, 1);

  // Same date, changed numbers → still one row, carrying the newer values.
  const day1b = buildHistoryRow({ ...fixtureScope(), total: 1234 });
  rows = upsertRows(rows, day1b);
  assert.equal(rows.length, 1, "same date must not duplicate");
  assert.equal(rows[0].total, 1234, "the re-run's values win");
});

test("(a) distinct dates accumulate and stay sorted ascending", () => {
  let rows = [];
  rows = upsertRows(rows, buildHistoryRow({ ...fixtureScope(), updatedAt: "2026-07-03T07:00:00Z" }));
  rows = upsertRows(rows, buildHistoryRow({ ...fixtureScope(), updatedAt: "2026-07-01T07:00:00Z" }));
  rows = upsertRows(rows, buildHistoryRow({ ...fixtureScope(), updatedAt: "2026-07-02T07:00:00Z" }));
  assert.deepEqual(rows.map((r) => r.date), ["2026-07-01", "2026-07-02", "2026-07-03"]);
});

test("(a) parseHistory self-heals past a malformed line (skip + warn) and keeps valid rows", () => {
  const good1 = JSON.stringify({ date: "2026-07-01", total: 1, per_repo: {} });
  const good2 = JSON.stringify({ date: "2026-07-02", total: 2, per_repo: {} });
  const rows = parseHistory(`${good1}\n{ this is not json\n\n${good2}\n`);
  assert.equal(rows.length, 2, "the one corrupt line is skipped — it must not stall future appends");
  assert.deepEqual(rows.map((r) => r.date), ["2026-07-01", "2026-07-02"]);
});

test("(a) serializeHistory is newline-terminated JSONL, one object per line, no trailing blank", () => {
  const rows = [buildHistoryRow(fixtureScope())];
  const out = serializeHistory(rows);
  assert.ok(out.endsWith("\n"), "file ends with exactly one newline");
  assert.ok(!out.endsWith("\n\n"), "no trailing blank line");
  const lines = out.split("\n").filter(Boolean);
  assert.equal(lines.length, 1);
  assert.doesNotThrow(() => JSON.parse(lines[0]), "each line is valid JSON");
});

// ── (b) privacy: a raw private slug in a served history file must fail the #267 leak gate ─────────

/** Run the #267 leak gate against `scanDir`. Returns spawnSync result. */
function runGate(scanDir) {
  return spawnSync("bash", [GATE, scanDir], { cwd: ROOT, encoding: "utf-8" });
}

test("(b) a history file with a display-name per_repo passes the leak gate (clean)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hist-clean-"));
  try {
    // per_repo as the appender writes it: display names only.
    const row = { date: "2026-07-02", total: 820, per_repo: { Omnopsis: 820, "privates Repo": 30 } };
    fs.writeFileSync(path.join(dir, "estate-test-scope-history.jsonl"), JSON.stringify(row) + "\n");
    const res = runGate(dir);
    assert.equal(res.status, 0, `display-name history must pass:\n${res.stdout}\n${res.stderr}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("(b) a history file leaking a RAW private slug in per_repo fails the leak gate (exit 1)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hist-leak-"));
  try {
    // Regression guard: if the appender ever read a pre-withhold source, a raw private slug would
    // reach this served file. omnopsis-ai/omnopsis-backend is named_private → must render "Omnopsis".
    const row = { date: "2026-07-02", total: 588, per_repo: { "omnopsis-ai/omnopsis-backend": 588 } };
    fs.writeFileSync(path.join(dir, "estate-test-scope-history.jsonl"), JSON.stringify(row) + "\n");
    const res = runGate(dir);
    assert.equal(res.status, 1, "a raw private slug in a served history file must fail the gate");
    assert.match(res.stderr, /omnopsis-ai\/omnopsis-backend/, "the offending slug is reported");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
