/**
 * Unit tests for scripts/withhold-private-repos.sh — the private-name withholder.
 *
 * Why this exists: public/estate-test-scope.json feeds the public, indexable /test-management
 * page AND public/stats.json. It must name ZERO private repos. The aggregator
 * (aggregate-test-scope.sh) deliberately keeps real slugs (so live-wins-by-slug dedup works);
 * this script runs AFTER aggregation and anonymizes every slug-bearing field whose repo is not
 * in the live public set. "Withhold at the source, not the render" (#94 lesson) — the JSON is
 * itself a public asset, so a render-only filter is bypassable.
 *
 * Contract (the complete slug-bearing field set, verified against the emitted structure):
 *   - per_repo[].repo  — the per-repo slug → "privates Repo" + private:true + audited_sha:null
 *   - missing[]        — fail-closed producer slugs → "privates Repo" (LENGTH preserved so the
 *                        reporting/expected delta stays readable)
 * Everything else is a number / bool / timestamp / byType test-type keys → never a slug.
 *
 * Fail-safe by construction: a repo is kept ONLY if its slug is explicitly in the public set;
 * anything else (private OR unknown) is withheld. Top-level total/byType are never touched, so
 * the honest headline math is preserved.
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

/** Run the withholder: pipe `scope` on stdin, pass `publicSlugs` as the JSON-array arg. */
function run(scope, publicSlugs) {
  const res = spawnSync("bash", [SCRIPT, JSON.stringify(publicSlugs)], {
    input: JSON.stringify(scope),
    encoding: "utf-8",
  });
  assert.equal(res.status, 0, `script exited non-zero:\n${res.stderr}`);
  return JSON.parse(res.stdout);
}

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

test("keeps a public repo's slug verbatim", () => {
  const out = run(
    { total: 5, byType: {}, per_repo: [{ repo: "o/open", total: 5, byType: {} }], missing: [] },
    ["o/open"],
  );
  assert.equal(out.per_repo[0].repo, "o/open");
  assert.equal(out.per_repo[0].private, undefined, "a public entry is never flagged private");
});

test("fail-safe: an unknown repo (not in the public set) is withheld", () => {
  // Empty public set → every slug withheld, even one never seen by the live fetch.
  const out = run(
    { total: 7, byType: {}, per_repo: [{ repo: "o/unknown", total: 7, byType: {} }], missing: [] },
    [],
  );
  assert.equal(out.per_repo[0].repo, "privates Repo");
  assert.equal(out.per_repo[0].private, true);
});

test("missing[] — private producer slugs anonymized, public kept, LENGTH preserved", () => {
  const out = run(
    {
      total: 0,
      byType: {},
      per_repo: [],
      // The fail-closed-visible vector: a producer whose stats.json fetch failed lands here by
      // owner/name. The only current statsPath producer is the PRIVATE omnopsis-backend.
      missing: ["o/secret", "o/open"],
    },
    ["o/open"],
  );
  assert.equal(out.missing.length, 2, "the count of missing producers stays readable");
  assert.deepEqual(out.missing, ["privates Repo", "o/open"]);
});

test("missing[] absent → tolerated (defaults to [])", () => {
  const out = run({ total: 0, byType: {}, per_repo: [] }, ["o/open"]);
  assert.deepEqual(out.missing, []);
});

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

test("honesty invariant: Σ per_repo.total is unchanged by anonymization", () => {
  const scope = {
    total: 30,
    byType: {},
    per_repo: [
      { repo: "o/a", total: 10, byType: {} },
      { repo: "o/b", total: 12, byType: {} },
      { repo: "o/c", total: 8, byType: {} },
    ],
    missing: [],
  };
  const out = run(scope, ["o/a"]);
  const sum = out.per_repo.reduce((s, r) => s + r.total, 0);
  assert.equal(sum, 30, "withholding names must not change the summed total");
  assert.equal(sum, out.total, "Σ per_repo.total still equals the headline total");
});
