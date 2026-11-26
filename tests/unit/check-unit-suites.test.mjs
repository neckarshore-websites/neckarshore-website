// Regression tests for scripts/check-unit-suites.mjs, run against a fixture checkout.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const guard = join(dirname(fileURLToPath(import.meta.url)), "../../scripts/check-unit-suites.mjs");

function fixture({ scripts, unitYml, files }) {
  const root = mkdtempSync(join(tmpdir(), "unit-suites-"));
  mkdirSync(join(root, ".github/workflows"), { recursive: true });
  mkdirSync(join(root, "tests"));
  mkdirSync(join(root, "scripts"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts }));
  writeFileSync(join(root, ".github/workflows/unit.yml"), unitYml);
  for (const f of files) writeFileSync(join(root, f), "");
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [guard], {
    env: { ...process.env, CHECK_UNIT_SUITES_ROOT: root },
    encoding: "utf8",
  });
}

const scripts = { "test:a:unit": "node --test tests/a.test.mjs" };
const files = ["tests/a.test.mjs"];

test("passes when every file has a script and every unit script runs", () => {
  const r = run(fixture({ scripts, files, unitYml: "        run: |\n          npm run test:a:unit\n" }));
  assert.equal(r.status, 0, r.stderr);
});

test("passes for a single-line run step", () => {
  const r = run(fixture({ scripts, files, unitYml: "      - run: npm run test:a:unit\n" }));
  assert.equal(r.status, 0, r.stderr);
});

test("fails on a test file no script names", () => {
  const r = run(fixture({ scripts, files: [...files, "tests/b.test.ts"], unitYml: "  npm run test:a:unit\n" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no package\.json script runs tests\/b\.test\.ts/);
});

test("fails when unit.yml does not run a unit script", () => {
  const r = run(fixture({ scripts, files, unitYml: "  npm run lint\n" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /unit\.yml does not run test:a:unit/);
});

test("fails when the unit script is only commented out in unit.yml", () => {
  const r = run(fixture({ scripts, files, unitYml: "          # npm run test:a:unit\n" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /unit\.yml does not run test:a:unit/);
});
