/**
 * Unit tests for scripts/withhold-private-repos.sh — the 3-way disclosure withholder.
 *
 * Why this exists: public/estate-test-scope.json feeds the public, indexable /test-management
 * page AND public/stats.json. The aggregator (aggregate-test-scope.sh) deliberately keeps real
 * slugs (so live-wins-by-slug dedup works); this script runs AFTER aggregation and applies the
 * disclosure allow-list. "Withhold at the source, not the render" (#94 lesson) — the JSON is
 * itself a public asset, so a render-only filter is bypassable.
 *
 * 3-way contract (Pass-2a disclosure-config wiring, Founder-signed 2026-07-01). Args:
 *   1. named-set        = live_public ∪ named_private (JSON array)
 *   2. display_overrides = { slug: product-name } (JSON object)
 *   3. named_private    = the approved-private slugs (JSON array)
 * Per per_repo[].repo (and, identically, per missing[] string):
 *   - in named-set + in overrides + named_private → PRODUCT NAME + private:true + audited_sha:null
 *   - in named-set + in overrides + public        → PRODUCT NAME (private/audited_sha untouched)
 *   - in named-set, no override (public)          → raw slug kept
 *   - NOT in named-set                            → "privates Repo" + private:true + audited_sha:null
 *
 * HARD RULE (fail-safe by construction): a named_private slug is rendered ONLY as its product
 * name. A named_private slug WITHOUT an override is WITHHELD ("privates Repo"), never leaked raw.
 * The only raw owner/name slug that survives to the output is a PUBLIC repo. Top-level total/byType
 * are never touched, so the honest headline math is preserved.
 *
 * Run: npm run test:unit
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(__dirname, "../../scripts/withhold-private-repos.sh");

/**
 * Run the withholder. Pipe `scope` on stdin; pass the three disclosure args.
 * `overrides` defaults to `{}` and `namedPrivate` to `[]` so the pre-disclosure behaviour
 * (withhold-not-named / keep-named-slug) is exercised by the same helper.
 */
function runRaw(scope, namedSet, overrides = {}, namedPrivate = []) {
  const res = spawnSync(
    "bash",
    [SCRIPT, JSON.stringify(namedSet), JSON.stringify(overrides), JSON.stringify(namedPrivate)],
    { input: JSON.stringify(scope), encoding: "utf-8" },
  );
  assert.equal(res.status, 0, `script exited non-zero:\n${res.stderr}`);
  return res.stdout;
}

function run(scope, namedSet, overrides = {}, namedPrivate = []) {
  return JSON.parse(runRaw(scope, namedSet, overrides, namedPrivate));
}

// --- Pre-disclosure behaviour (empty overrides / named_private) still holds ---------------------

test("withholds a private repo's slug but preserves total + byType", () => {
  const out = run(
    {
      total: 15,
      byType: { unit: 15 },
      per_repo: [
        { repo: "o/secret", total: 10, byType: { unit: 10 }, audited_sha: "deadbeef" },
        { repo: "o/open", total: 5, byType: { unit: 5 }, audited_sha: null },
      ],
      missing: [],
    },
    ["o/open"],
  );
  const secret = out.per_repo[0];
  assert.equal(secret.repo, "privates Repo", "private slug must be withheld");
  assert.equal(secret.private, true, "withheld entry is flagged private:true");
  assert.equal(secret.audited_sha, null, "private repo's audited_sha is withheld too");
  assert.equal(secret.total, 10, "the count is preserved");
  assert.deepEqual(secret.byType, { unit: 10 }, "byType is preserved");
});

test("keeps a public repo's slug verbatim (in named-set, no override)", () => {
  const out = run(
    { total: 5, byType: {}, per_repo: [{ repo: "o/open", total: 5, byType: {} }], missing: [] },
    ["o/open"],
  );
  assert.equal(out.per_repo[0].repo, "o/open");
  assert.equal(out.per_repo[0].private, undefined, "a public entry is never flagged private");
});

test("fail-safe: a repo not in the named-set is withheld", () => {
  const out = run(
    { total: 7, byType: {}, per_repo: [{ repo: "o/unknown", total: 7, byType: {} }], missing: [] },
    [],
  );
  assert.equal(out.per_repo[0].repo, "privates Repo");
  assert.equal(out.per_repo[0].private, true);
});

// --- 3-way disclosure: product-name rewrite --------------------------------------------------

test("named_private product → product name + private:true + audited_sha:null, slug never raw", () => {
  const slug = "omnopsis-ai/omnopsis-backend";
  const raw = runRaw(
    {
      total: 50,
      byType: { unit: 50 },
      per_repo: [{ repo: slug, total: 50, byType: { unit: 50 }, audited_sha: "deadbeef" }],
      missing: [],
    },
    [slug],
    { [slug]: "Omnopsis" },
    [slug],
  );
  assert.ok(!raw.includes(slug), "HARD RULE: the raw private slug must not appear in the output");
  const entry = JSON.parse(raw).per_repo[0];
  assert.equal(entry.repo, "Omnopsis", "rendered as the product name");
  assert.equal(entry.private, true, "still flagged private:true (it IS a private repo)");
  assert.equal(entry.audited_sha, null, "a private repo's audited_sha is withheld (internal ref)");
  assert.equal(entry.total, 50, "count preserved");
});

test("public product with override → product name, NOT private, audited_sha kept", () => {
  const slug = "neckarshore-skills/obsidian-vault-autopilot";
  const out = run(
    {
      total: 20,
      byType: {},
      per_repo: [{ repo: slug, total: 20, byType: {}, audited_sha: "cafe" }],
      missing: [],
    },
    [slug],
    { [slug]: "Obsidian Vault Autopilot" },
    [], // public — not in named_private
  );
  const entry = out.per_repo[0];
  assert.equal(entry.repo, "Obsidian Vault Autopilot", "rendered as the product name (board consistency)");
  assert.equal(entry.private, undefined, "a public product is never flagged private");
  assert.equal(entry.audited_sha, "cafe", "a public repo's audited_sha is kept");
});

test("public non-product (in named-set, no override) → raw slug kept, not private", () => {
  const slug = "neckarshore-websites/goldoni-website";
  const out = run(
    { total: 15, byType: {}, per_repo: [{ repo: slug, total: 15, byType: {}, audited_sha: "beef" }], missing: [] },
    [slug],
    {},
    [],
  );
  const entry = out.per_repo[0];
  assert.equal(entry.repo, slug, "public non-product keeps its raw slug (Founder named all public)");
  assert.equal(entry.private, undefined);
  assert.equal(entry.audited_sha, "beef");
});

// --- HARD RULE fail-safe: a named_private slug WITHOUT an override never leaks --------------

test("fail-safe: named_private slug WITHOUT an override is withheld, never leaked raw", () => {
  const slug = "o/secretproduct";
  const raw = runRaw(
    { total: 9, byType: {}, per_repo: [{ repo: slug, total: 9, byType: {}, audited_sha: "s3cr3t" }], missing: [] },
    [slug], // in the named-set…
    {}, // …but the config forgot the override (malformed) …
    [slug], // …and it IS named_private → MUST fail closed, not leak.
  );
  assert.ok(!raw.includes(slug), "HARD RULE: a private slug never leaks, even with a malformed config");
  const entry = JSON.parse(raw).per_repo[0];
  assert.equal(entry.repo, "privates Repo");
  assert.equal(entry.private, true);
  assert.equal(entry.audited_sha, null);
});

test("HARD RULE: no named_private raw slug appears anywhere in the serialized output", () => {
  const namedPrivate = [
    "omnopsis-ai/omnopsis-backend",
    "omnopsis-ai/omnopsis-frontend",
    "neckarshore-mmps/phonesis-voicebank",
  ];
  const overrides = {
    "omnopsis-ai/omnopsis-backend": "Omnopsis",
    "omnopsis-ai/omnopsis-frontend": "Omnopsis",
    "neckarshore-mmps/phonesis-voicebank": "Phonesis",
  };
  const namedSet = [...namedPrivate, "neckarshore-websites/goldoni-website"];
  const raw = runRaw(
    {
      total: 30,
      byType: {},
      per_repo: [
        { repo: "omnopsis-ai/omnopsis-backend", total: 12, byType: {}, audited_sha: "a" },
        { repo: "omnopsis-ai/omnopsis-frontend", total: 8, byType: {}, audited_sha: "b" },
        { repo: "neckarshore-websites/goldoni-website", total: 10, byType: {} },
      ],
      // named_private producer slug in missing[] — the fail-closed-visible vector.
      missing: ["neckarshore-mmps/phonesis-voicebank", "neckarshore-websites/goldoni-website"],
    },
    namedSet,
    overrides,
    namedPrivate,
  );
  for (const slug of namedPrivate) {
    assert.ok(!raw.includes(slug), `named_private slug leaked raw: ${slug}`);
  }
  const out = JSON.parse(raw);
  assert.deepEqual(
    out.per_repo.map((r) => r.repo).sort(),
    ["Omnopsis", "Omnopsis", "neckarshore-websites/goldoni-website"].sort(),
  );
  assert.deepEqual(out.missing.sort(), ["Phonesis", "neckarshore-websites/goldoni-website"].sort());
});

// --- missing[] 3-way ------------------------------------------------------------------------

test("missing[] 3-way: product-name / raw-slug / privates Repo, LENGTH preserved", () => {
  const out = run(
    {
      total: 0,
      byType: {},
      per_repo: [],
      missing: [
        "omnopsis-ai/omnopsis-backend", // named_private + override → product name
        "neckarshore-websites/goldoni-website", // public, no override → raw slug
        "neckarshore-ai/dev-environment", // not in named-set → withheld
      ],
    },
    ["omnopsis-ai/omnopsis-backend", "neckarshore-websites/goldoni-website"],
    { "omnopsis-ai/omnopsis-backend": "Omnopsis" },
    ["omnopsis-ai/omnopsis-backend"],
  );
  assert.equal(out.missing.length, 3, "the count of missing producers stays readable");
  assert.deepEqual(out.missing, ["Omnopsis", "neckarshore-websites/goldoni-website", "privates Repo"]);
});

test("missing[] absent → tolerated (defaults to [])", () => {
  const out = run({ total: 0, byType: {}, per_repo: [] }, ["o/open"]);
  assert.deepEqual(out.missing, []);
});

// --- Headline math + honesty invariants -----------------------------------------------------

test("top-level total + byType are never touched (headline math intact)", () => {
  const out = run(
    {
      total: 2611,
      byType: { unit: 302, e2e: 259, integration: 27 },
      per_repo: [{ repo: "o/secret", total: 2611, byType: { unit: 2611 } }],
      missing: [],
    },
    [],
  );
  assert.equal(out.total, 2611);
  assert.deepEqual(out.byType, { unit: 302, e2e: 259, integration: 27 });
});

test("honesty invariant: Σ per_repo.total is unchanged by disclosure", () => {
  const scope = {
    total: 30,
    byType: {},
    per_repo: [
      { repo: "omnopsis-ai/omnopsis-backend", total: 10, byType: {} }, // → Omnopsis
      { repo: "neckarshore-websites/goldoni-website", total: 12, byType: {} }, // → raw slug
      { repo: "o/c", total: 8, byType: {} }, // → withheld
    ],
    missing: [],
  };
  const out = run(
    scope,
    ["omnopsis-ai/omnopsis-backend", "neckarshore-websites/goldoni-website"],
    { "omnopsis-ai/omnopsis-backend": "Omnopsis" },
    ["omnopsis-ai/omnopsis-backend"],
  );
  const sum = out.per_repo.reduce((s, r) => s + r.total, 0);
  assert.equal(sum, 30, "disclosure must not change the summed total");
  assert.equal(sum, out.total, "Σ per_repo.total still equals the headline total");
});

// --- Byte-canonical output (matches the aggregator's `jq -s -S`) -----------------------------

test("-S sort: output is key-canonical (byte-identical after a second jq -S pass)", () => {
  const raw = runRaw(
    {
      // Deliberately unsorted top-level keys to prove the script canonicalizes them.
      missing: ["o/x"],
      per_repo: [{ total: 3, repo: "o/x", byType: {} }],
      byType: { unit: 3 },
      total: 3,
    },
    ["o/x"],
  );
  const second = spawnSync("jq", ["-S", "."], { input: raw, encoding: "utf-8" });
  assert.equal(second.status, 0, second.stderr);
  assert.equal(raw, second.stdout, "output must already be -S canonical (a second -S pass is a no-op)");
});
