// Regression tests for scripts/check-repo-inventory.mjs, run against a fixture checkout.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const check = join(dirname(fileURLToPath(import.meta.url)), "../../scripts/check-repo-inventory.mjs");

function fixture({ config = 3, publicRepos = 1, privateCount = 2, tile = 3, skip = [] } = {}) {
  const root = mkdtempSync(join(tmpdir(), "repo-inventory-"));
  mkdirSync(join(root, "public"));
  const files = {
    "stats-config.json": { repos: Array.from({ length: config }, (_, i) => ({ name: `r${i}` })) },
    "public/repositories.json": {
      privateCount,
      repos: Array.from({ length: publicRepos }, (_, i) => ({ name: `p${i}`, visibility: "public" })),
    },
    "public/stats.json": { repos: tile },
  };
  for (const [rel, body] of Object.entries(files)) {
    if (!skip.includes(rel)) writeFileSync(join(root, rel), JSON.stringify(body));
  }
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [check], {
    env: { ...process.env, CHECK_REPO_INVENTORY_ROOT: root },
    encoding: "utf8",
  });
}

test("passes when config, inventory and tile agree", () => {
  const r = run(fixture());
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /3 repositories/);
});

test("fails when the inventory counts fewer than the config", () => {
  const r = run(fixture({ config: 4, tile: 4 }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /repositories\.json counts 3 \(1 public \+ 2 private\), stats-config\.json lists 4/);
});

test("fails when the tile differs from the config", () => {
  const r = run(fixture({ tile: 2 }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /stats\.json repos is 2, stats-config\.json lists 3/);
});

test("fails closed on a missing file", () => {
  const r = run(fixture({ skip: ["public/stats.json"] }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /cannot read public\/stats\.json/);
});

test("fails closed on a non-integer privateCount", () => {
  const r = run(fixture({ privateCount: "2" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /integer privateCount/);
});
