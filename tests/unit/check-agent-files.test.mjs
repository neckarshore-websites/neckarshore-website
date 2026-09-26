/**
 * Pure-logic tests for the agentRules guard (scripts/check-agent-files.mjs, #2360 revised
 * 2026-09-25). The live half — importing the real next.config.ts and reading the real
 * files — is `npm run check:agent-files`; its corruption probe is recorded in the PR body.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { checkAgentFiles, NEXT_START_MARKER } from "../../scripts/check-agent-files.mjs";

const healthy = { agentRules: false, agentsMdExists: false, claudeMd: "# CLAUDE.md\n\nOur text.\n" };

function codes(result) {
  return result.failures.map((f) => f.code).sort();
}

test("healthy repo passes", () => {
  const result = checkAgentFiles(healthy);
  assert.equal(result.ok, true);
  assert.deepEqual(result.failures, []);
});

test("a missing switch fails", () => {
  assert.deepEqual(codes(checkAgentFiles({ ...healthy, agentRules: undefined })), ["switch-off"]);
});

test("agentRules: true fails", () => {
  assert.deepEqual(codes(checkAgentFiles({ ...healthy, agentRules: true })), ["switch-off"]);
});

test("a committed AGENTS.md fails", () => {
  assert.deepEqual(codes(checkAgentFiles({ ...healthy, agentsMdExists: true })), ["agents-md-present"]);
});

test("the generated block in CLAUDE.md fails", () => {
  const claudeMd = `${healthy.claudeMd}\n${NEXT_START_MARKER}\nforeign text\n<!-- END:nextjs-agent-rules -->\n`;
  assert.deepEqual(codes(checkAgentFiles({ ...healthy, claudeMd })), ["claude-md-hosts-block"]);
});

test("a missing CLAUDE.md is not this guard's failure", () => {
  assert.equal(checkAgentFiles({ ...healthy, claudeMd: null }).ok, true);
});
