#!/usr/bin/env node
/**
 * append-test-scope-history.mjs — backlog #264 (estate test-count history trendline, storage only).
 *
 * WHY: public/estate-test-scope.json is a point-in-time snapshot; drift over time is invisible.
 * History cannot be collected retroactively — every day the appender does NOT run is a lost
 * datapoint. This script appends/upserts ONE row per date so the trend becomes observable. There
 * is NO UI here (a /test-management sparkline is a later, separate item) — storage only.
 *
 * PRIVACY GUARANTEE (load-bearing — do NOT change the source): reads the POST-withhold artifact
 * public/estate-test-scope.json, whose per_repo[].repo are already display names (public slug,
 * product name, or "privates Repo") after scripts/withhold-private-repos.sh ran in update-stats.yml.
 * NEVER read a pre-withhold source (the aggregator output, stats-config, the seed) — that would put
 * a raw private slug into a SERVED file and trip the #267 leak gate. The workflow wires this AFTER
 * the withhold step for exactly this reason.
 *
 * per_repo COLLISION-SUMMING (a judgment call on an underspecified spec point — disclosed in the PR):
 * display names are NOT unique in the source. By design 3 rows render as "Omnopsis"
 * (backend+frontend+contracts) and up to 9 as "privates Repo". The spec asks for an object keyed by
 * display name — a naive {name: total} would silently DROP the colliding rows (last-write-wins).
 * We SUM totals per display name instead: verlustfrei, deterministic, and it preserves the headline
 * invariant Σ(per_repo values) === total. That is why per_repo has FEWER keys than there are rows.
 *
 * date = source.updatedAt sliced to YYYY-MM-DD (UTC). Snapshot-bound, NOT wall-clock — deterministic
 * (no Date.now), honest (the datapoint reflects the measurement it came from), and idempotent (re-run
 * same snapshot → same date → the row is replaced, not duplicated).
 *
 * Usage:  node scripts/append-test-scope-history.mjs      (arg-free; fixed repo-relative paths)
 * Output: public/estate-test-scope-history.jsonl (one compact JSON object per line, sorted by date).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "public", "estate-test-scope.json");
const HISTORY = path.join(ROOT, "public", "estate-test-scope-history.jsonl");

/** Sort an object's keys A→Z (case-insensitive) into a fresh object — byte-stable output. */
function sortKeys(obj) {
  const out = {};
  for (const k of Object.keys(obj).sort((a, b) => a.localeCompare(b))) out[k] = obj[k];
  return out;
}

/**
 * Build the one history row from a POST-withhold estate-test-scope object.
 * Collision-safe: per_repo sums totals per display name (see header). Throws on a missing/malformed
 * updatedAt — a datapoint with no honest date is worse than no datapoint.
 */
export function buildHistoryRow(scope) {
  const date = String(scope?.updatedAt ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`append-test-scope-history: source has no valid updatedAt (got: ${JSON.stringify(scope?.updatedAt)})`);
  }
  const perRepo = {};
  for (const r of scope.per_repo ?? []) {
    const name = r?.repo;
    if (name == null) continue;
    perRepo[name] = (perRepo[name] ?? 0) + (Number(r.total) || 0);
  }
  return {
    date,
    total: Number(scope.total) || 0,
    floor: scope.floor === true,
    repos: Number(scope.repos) || 0,
    reporting: Number(scope.reporting) || 0,
    byType: sortKeys(scope.byType ?? {}),
    per_repo: sortKeys(perRepo),
  };
}

/**
 * Upsert `row` into `rows` keyed by `date` (idempotent — same date replaces, never duplicates).
 * Returns a NEW array sorted by date ascending (ISO dates sort lexically === chronologically).
 */
export function upsertRows(rows, row) {
  const byDate = new Map();
  for (const r of rows) byDate.set(r.date, r);
  byDate.set(row.date, row); // upsert: replace this date's row if present
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Parse JSONL text into rows. Skips blank lines AND self-heals past a malformed/partial line
 * (skip + warn) instead of throwing — a single corrupt line must never permanently stall all
 * future appends (the workflow step is fail-open, so an uncaught throw would silently stop history
 * collection forever, which is exactly the "lost datapoint" failure #264 exists to prevent).
 */
export function parseHistory(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (!l) continue;
    try {
      rows.push(JSON.parse(l));
    } catch {
      console.warn(`append-test-scope-history: skipping malformed history line: ${l.slice(0, 80)}`);
    }
  }
  return rows;
}

/** Read an existing JSONL history file into rows (empty if absent). */
function readHistory(file) {
  if (!fs.existsSync(file)) return [];
  return parseHistory(fs.readFileSync(file, "utf-8"));
}

/** Serialize rows to newline-terminated JSONL (one compact object per line, no trailing blank line). */
export function serializeHistory(rows) {
  return rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
}

function run() {
  const scope = JSON.parse(fs.readFileSync(SOURCE, "utf-8"));
  const row = buildHistoryRow(scope);
  const rows = upsertRows(readHistory(HISTORY), row);
  fs.writeFileSync(HISTORY, serializeHistory(rows));
  console.log(
    `append-test-scope-history: upserted ${row.date} — total=${row.total} repos=${row.repos} ` +
      `reporting=${row.reporting} per_repo_keys=${Object.keys(row.per_repo).length} (${rows.length} row(s) total)`,
  );
}

// CLI when invoked directly; importable (buildHistoryRow / upsertRows / serializeHistory) for tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) run();
