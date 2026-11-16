/**
 * Gate for the test page's sum check in update-stats.yml (scripts/check-test-page-data.ts).
 *
 * It runs the SHIPPED script on a copy of the shipped data: green as committed, red when one
 * repository's count is changed so the parts no longer add up. And it reads the SHIPPED workflow
 * to assert the check runs before the commit step, which is the whole point of the step.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function copyData() {
  const dir = mkdtempSync(join(tmpdir(), "test-page-data-"));
  mkdirSync(join(dir, "public"));
  for (const f of ["public/estate-test-scope.json", "public/stats.json", "disclosure-config.json"]) {
    cpSync(f, join(dir, f));
  }
  return dir;
}

function check(dir) {
  return spawnSync("npx", ["tsx", "scripts/check-test-page-data.ts", dir], { encoding: "utf8" });
}

test("the committed data passes the test page sum check", () => {
  const r = check(copyData());
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /test page data OK/);
});

test("one repository count off by one fails the check", () => {
  const dir = copyData();
  const file = join(dir, "public/estate-test-scope.json");
  const data = JSON.parse(readFileSync(file, "utf8"));
  data.per_repo[0].total += 1;
  writeFileSync(file, JSON.stringify(data));
  const r = check(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /::error::/);
});

test("update-stats.yml runs the check before it commits", () => {
  const wf = readFileSync(".github/workflows/update-stats.yml", "utf8");
  const checkAt = wf.indexOf("scripts/check-test-page-data.ts");
  const commitAt = wf.indexOf("- name: Commit and push");
  assert.ok(checkAt > 0, "the check step is missing");
  assert.ok(checkAt < commitAt, "the check must run before the commit");
});
