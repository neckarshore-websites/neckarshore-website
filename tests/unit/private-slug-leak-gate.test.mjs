/**
 * Unit tests for scripts/check-private-slug-leak.sh — the durable #267 privacy gate.
 *
 * The gate fails a PR if a PRIVATE repo slug appears raw in any SERVED artifact under public/.
 * It is the systemic guard for the leak class that recurred one surface removed (#94/#95): it
 * scans the served output, using the build-config (stats-config − repositories.json ∪ named_private)
 * as its authoritative known-private source. These tests lock the three behaviours that matter:
 *
 *   1. GREEN on the committed tree — the served artifacts are clean (post disclosure-config).
 *   2. DETECTS a real leak — a known-private slug in a served file fails the gate (exit 1).
 *   3. FAIL-SAFE, no false red — a live-public-but-stale-private slug (clearpath-52) is allowed,
 *      and a genuinely-private slug (incl. a named_private product's raw slug) is caught.
 *
 * Run: npm run test:unit   (also runnable standalone: npm run check:privacy)
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SCRIPT = path.join(ROOT, "scripts", "check-private-slug-leak.sh");

/** Run the gate against `scanDir` (default: the repo's real public/). Returns {status, stdout, stderr}. */
function runGate(scanDir) {
  const args = [SCRIPT];
  if (scanDir) args.push(scanDir);
  return spawnSync("bash", args, { cwd: ROOT, encoding: "utf-8" });
}

/** Write a single served-file fixture containing `content` into a fresh temp dir; return the dir. */
function fixtureDir(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "privacy-gate-"));
  fs.writeFileSync(path.join(dir, "served.json"), content);
  return dir;
}

test("GREEN: the committed public/ surface has no private slug (gate passes)", () => {
  const res = runGate();
  assert.equal(res.status, 0, `gate should pass on the committed tree:\n${res.stdout}\n${res.stderr}`);
});

test("DETECTS: a known-private slug in a served file fails the gate (exit 1)", () => {
  const dir = fixtureDir('{"per_repo":[{"repo":"neckarshore-ai/observatory","total":30}]}');
  try {
    const res = runGate(dir);
    assert.equal(res.status, 1, "a private slug in a served file must fail the gate");
    assert.match(res.stderr, /neckarshore-ai\/observatory/, "the offending slug is reported");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("DETECTS: a named_private product's RAW slug still fails (it must render as its product name)", () => {
  const dir = fixtureDir('{"per_repo":[{"repo":"omnopsis-ai/omnopsis-backend","total":588}]}');
  try {
    const res = runGate(dir);
    assert.equal(res.status, 1, "omnopsis-backend raw slug must fail — the page shows 'Omnopsis'");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("FAIL-SAFE: a live-public-but-stale-private slug (clearpath-52) is allowed (no false red)", () => {
  // clearpath-52 is private:true in stats-config yet LIVE-public (in repositories.json). The
  // complement-of-live-public source excludes it from known-private → it may appear named.
  const dir = fixtureDir('{"per_repo":[{"repo":"neckarshore-mmps/clearpath-52","total":0}]}');
  try {
    const res = runGate(dir);
    assert.equal(res.status, 0, `clearpath-52 is live-public and must not red the gate:\n${res.stderr}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("ALLOWED: a public slug and a product display-name never trip the gate", () => {
  const dir = fixtureDir(
    '{"per_repo":[{"repo":"neckarshore-websites/goldoni-website"},{"repo":"Omnopsis"},{"repo":"privates Repo"}]}',
  );
  try {
    const res = runGate(dir);
    assert.equal(res.status, 0, `public slug + product name + anonymized label are all fine:\n${res.stderr}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
