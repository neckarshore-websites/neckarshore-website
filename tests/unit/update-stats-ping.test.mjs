/**
 * Gate for the last step of update-stats.yml, the ping to the external dead man's switch.
 *
 * It reads the SHIPPED workflow and executes the SHIPPED run block with a stub curl, so the test
 * cannot pass on a copy of the logic. Why this step matters: from 2026-10-22 to 10-28 both reporters
 * wrote to issue #323 and nobody read it. This ping is the only route that leaves GitHub.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKFLOW = readFileSync(".github/workflows/update-stats.yml", "utf8");

// Split on step starts at job-step indentation; the last chunk is the last step of the job.
const steps = WORKFLOW.split(/^ {6}- (?=name:|uses:)/m).slice(1);
const pingStep = steps.at(-1);

function runBlock(step) {
  const lines = step.split("\n");
  const start = lines.findIndex((l) => l.trim() === "run: |");
  assert.notEqual(start, -1, "the ping step needs a run block");
  return lines
    .slice(start + 1)
    .map((l) => l.slice(10))
    .join("\n");
}

function execute({ url, status, curlExit = 0 }) {
  const dir = mkdtempSync(join(tmpdir(), "ping-"));
  const log = join(dir, "curl.log");
  const stub = join(dir, "curl");
  writeFileSync(stub, `#!/bin/sh\nfor a in "$@"; do last="$a"; done\necho "$last" >> "${log}"\nexit ${curlExit}\n`);
  chmodSync(stub, 0o755);
  const result = spawnSync("bash", ["-eo", "pipefail", "-c", runBlock(pingStep)], {
    env: { PATH: `${dir}:${process.env.PATH}`, PING_URL: url, JOB_STATUS: status },
    encoding: "utf8",
  });
  let called = [];
  try {
    called = readFileSync(log, "utf8").trim().split("\n");
  } catch {
    // no log file means curl was never called
  }
  return { exit: result.status, stdout: result.stdout, called };
}

test("the ping is the last step of the job", () => {
  assert.match(pingStep, /^name: Lebenszeichen senden/);
});

test("it runs on every outcome and can never turn the job red", () => {
  assert.match(pingStep, /^ {8}if: always\(\)$/m);
  assert.match(pingStep, /^ {8}continue-on-error: true$/m);
});

test("the ping address comes from the secret and stands nowhere in the public file", () => {
  assert.match(pingStep, /PING_URL: \$\{\{ secrets\.STATS_HEALTHCHECK_URL \}\}/);
  assert.doesNotMatch(WORKFLOW, /hc-ping\.com|healthchecks\.io\/ping/);
});

test("a green job pings the plain address", () => {
  const r = execute({ url: "https://ping.example/abc", status: "success" });
  assert.equal(r.exit, 0);
  assert.deepEqual(r.called, ["https://ping.example/abc"]);
});

test("a red or cancelled job pings /fail", () => {
  for (const status of ["failure", "cancelled"]) {
    const r = execute({ url: "https://ping.example/abc", status });
    assert.equal(r.exit, 0);
    assert.deepEqual(r.called, ["https://ping.example/abc/fail"]);
  }
});

test("a missing secret warns visibly and calls nothing", () => {
  const r = execute({ url: "", status: "success" });
  assert.equal(r.exit, 0);
  assert.deepEqual(r.called, []);
  assert.match(r.stdout, /::warning::STATS_HEALTHCHECK_URL/);
});

test("an unreachable switch warns and stays green", () => {
  const r = execute({ url: "https://ping.example/abc", status: "success", curlExit: 7 });
  assert.equal(r.exit, 0);
  assert.match(r.stdout, /::warning::Lebenszeichen/);
});

test("the shipped run block is valid bash", () => {
  execFileSync("bash", ["-n", "-c", runBlock(pingStep)]);
});
