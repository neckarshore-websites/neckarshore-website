// Regression tests for scripts/check-unit-suites.mjs, run against a fixture checkout.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const guard = join(dirname(fileURLToPath(import.meta.url)), "../../scripts/check-unit-suites.mjs");

const ON_PR = "on:\n  push:\n    branches: [main]\n  pull_request:\n\njobs:\n";

function fixture({ scripts, unitYml, files, workflows = {} }) {
  const root = mkdtempSync(join(tmpdir(), "unit-suites-"));
  mkdirSync(join(root, ".github/workflows"), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts }));
  writeFileSync(join(root, ".github/workflows/unit.yml"), ON_PR + unitYml);
  for (const [name, text] of Object.entries(workflows)) writeFileSync(join(root, ".github/workflows", name), text);
  for (const f of files) {
    mkdirSync(join(root, dirname(f)), { recursive: true });
    writeFileSync(join(root, f), "");
  }
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

test("fails when no workflow runs a unit script", () => {
  const r = run(fixture({ scripts, files, unitYml: "  npm run lint\n" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no pull_request workflow runs test:a:unit/);
});

test("fails when the unit script is only commented out", () => {
  const r = run(fixture({ scripts, files, unitYml: "          # npm run test:a:unit\n" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no pull_request workflow runs test:a:unit/);
});

test("fails when the unit script runs behind || true", () => {
  const r = run(fixture({ scripts, files, unitYml: "          npm run test:a:unit > /tmp/a.out 2>&1 || true\n" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no pull_request workflow runs test:a:unit/);
});

test("checks test:unit itself, not only test:<name>:unit", () => {
  const r = run(fixture({ scripts: { "test:unit": "node --test tests/a.test.mjs" }, files, unitYml: "  npm run lint\n" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no pull_request workflow runs test:unit/);
});

test("finds an unnamed test file under src/", () => {
  const r = run(fixture({ scripts, files: [...files, "src/lib/x.test.ts"], unitYml: "  npm run test:a:unit\n" }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no package\.json script runs src\/lib\/x\.test\.ts/);
});

test("does not count a path that only contains the file's path", () => {
  const r = run(
    fixture({
      scripts: { "test:a:unit": "node --test tests/a.test.mjs vendor/src/lib/x.test.ts" },
      files: [...files, "src/lib/x.test.ts"],
      unitYml: "  npm run test:a:unit\n",
    }),
  );
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no package\.json script runs src\/lib\/x\.test\.ts/);
});

test("a quoted glob names the files it matches", () => {
  const r = run(
    fixture({
      scripts: { "test:unit": 'node --import tsx --test "tests/unit/*.test.ts"' },
      files: ["tests/unit/a.test.ts", "tests/unit/b.test.ts"],
      unitYml: "      - run: npm run test:unit\n",
    }),
  );
  assert.equal(r.status, 0, r.stderr);
});

test("a glob does not reach a sibling or a deeper directory", () => {
  const r = run(
    fixture({
      scripts: { "test:unit": 'node --test "tests/unit/*.test.ts"' },
      files: ["tests/unit/a.test.ts", "tests/unit/deep/b.test.ts", "tests/db/c.test.ts"],
      unitYml: "      - run: npm run test:unit\n",
    }),
  );
  assert.equal(r.status, 1);
  assert.match(r.stderr, /tests\/unit\/deep\/b\.test\.ts/);
  assert.match(r.stderr, /tests\/db\/c\.test\.ts/);
});

test("a ** glob reaches every depth", () => {
  const r = run(
    fixture({
      scripts: { "test:unit": "node --test 'tests/**/*.test.ts'" },
      files: ["tests/a.test.ts", "tests/unit/deep/b.test.ts"],
      unitYml: "      - run: npm run test:unit\n",
    }),
  );
  assert.equal(r.status, 0, r.stderr);
});

test("a unit script in another pull_request workflow counts", () => {
  const r = run(
    fixture({
      scripts,
      files,
      unitYml: "  npm run lint\n",
      workflows: { "lighthouse.yml": ON_PR + "        run: npm run test:a:unit\n" },
    }),
  );
  assert.equal(r.status, 0, r.stderr);
});

test("a unit script only in a workflow without pull_request does not count", () => {
  const r = run(
    fixture({
      scripts,
      files,
      unitYml: "  npm run lint\n",
      workflows: { "nightly.yml": "on:\n  schedule:\n    - cron: '0 4 * * *'\n  pull_request_target:\njobs:\n        run: npm run test:a:unit\n" },
    }),
  );
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no pull_request workflow runs test:a:unit/);
});
