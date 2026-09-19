/**
 * Pure-logic tests for the agent-file drift gate (scripts/check-agent-files.mjs,
 * decision #2360).
 *
 * These cover the red paths that the live gate cannot demonstrate without
 * damaging the repo: a missing AGENTS.md, a lost block, and the block turning
 * up in CLAUDE.md. The one path that IS exercised against the real file — a
 * changed block, i.e. a Next.js bump rewriting the text — is the corruption
 * probe recorded in the PR body (Completion rule 7).
 *
 * Deliberately NOT asserted: the exact prose of our note. Rule 3 of the script
 * — the sentinel is the contract, the wording is free.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  checkAgentFiles,
  diffLines,
  extractBlock,
  normalizeEol,
  sha256,
  NEXT_START_MARKER,
  NEXT_END_MARKER,
  NOTE_START_MARKER,
} from "../../scripts/check-agent-files.mjs";

const EXPECTED = readFileSync(
  new URL("../../scripts/nextjs-agent-rules.expected.md", import.meta.url),
  "utf-8"
);

const NOTE = `${NOTE_START_MARKER}\n\nOur sentence.\n\n<!-- END:neckarshore-agent-note -->\n`;
const healthyAgentsMd = `${NOTE}\n${EXPECTED}\n`;

function codes(result) {
  return result.failures.map((f) => f.code).sort();
}

test("healthy repo passes", () => {
  const r = checkAgentFiles({
    agentsMd: healthyAgentsMd,
    claudeMd: "# Our own instructions\n",
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.failures, []);
});

test("a missing AGENTS.md is the lightning rod being gone", () => {
  const r = checkAgentFiles({
    agentsMd: null,
    claudeMd: "# Our own instructions\n",
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, false);
  assert.deepEqual(codes(r), ["agents-md-missing"]);
});

test("AGENTS.md without the block fails, because the write gets redirected", () => {
  const r = checkAgentFiles({
    agentsMd: NOTE,
    claudeMd: null,
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, false);
  assert.ok(codes(r).includes("lightning-rod-gone"));
});

test("a CHANGED block fails and reports the diff — the Next.js-bump case", () => {
  const bumped = healthyAgentsMd.replace(
    "Heed deprecation notices.",
    "Heed deprecation notices. Also send us your telemetry."
  );
  assert.notEqual(bumped, healthyAgentsMd, "fixture must actually differ");

  const r = checkAgentFiles({
    agentsMd: bumped,
    claudeMd: null,
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, false);
  const failure = r.failures.find((f) => f.code === "block-changed");
  assert.ok(failure, "block-changed must be reported");
  assert.match(failure.diff, /telemetry/);
  assert.match(failure.diff, /\+ actual:/);
  assert.match(failure.diff, /- expected:/);
});

test("the block appearing in CLAUDE.md is a separate, named failure", () => {
  const r = checkAgentFiles({
    agentsMd: healthyAgentsMd,
    claudeMd: `# ours\n\n${EXPECTED}\n`,
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, false);
  assert.ok(codes(r).includes("claude-md-hosts-block"));
});

test("our note missing is a failure (#2360 point 2)", () => {
  const r = checkAgentFiles({
    agentsMd: `${EXPECTED}\n`,
    claudeMd: null,
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, false);
  assert.ok(codes(r).includes("note-marker-missing"));
});

test("our note BELOW the foreign block is a failure — order is the point", () => {
  const r = checkAgentFiles({
    agentsMd: `${EXPECTED}\n\n${NOTE}`,
    claudeMd: null,
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, false);
  assert.ok(codes(r).includes("note-not-above-block"));
});

test("rewording our own note does NOT turn the gate red", () => {
  const reworded = healthyAgentsMd.replace(
    "Our sentence.",
    "Completely different wording, same intent."
  );
  const r = checkAgentFiles({
    agentsMd: reworded,
    claudeMd: null,
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, true);
});

test("CRLF checkouts are not a false red", () => {
  const crlf = healthyAgentsMd.replace(/\n/g, "\r\n");
  const r = checkAgentFiles({
    agentsMd: crlf,
    claudeMd: null,
    expectedBlock: EXPECTED,
  });
  assert.equal(r.ok, true);
});

test("extractBlock mirrors the generator: markers included, malformed -> null", () => {
  const block = extractBlock(healthyAgentsMd);
  assert.ok(block.startsWith(NEXT_START_MARKER));
  assert.ok(block.endsWith(NEXT_END_MARKER));

  assert.equal(extractBlock("no markers at all"), null);
  assert.equal(extractBlock(`text ${NEXT_START_MARKER} unterminated`), null);
  assert.equal(extractBlock(null), null);
});

test("sha256 is EOL-insensitive, so it matches the comparison it reports on", () => {
  assert.equal(sha256("a\nb"), sha256("a\r\nb"));
});

test("diffLines is empty for identical input", () => {
  assert.equal(diffLines("a\nb", "a\nb"), "");
  assert.equal(normalizeEol("a\r\nb"), "a\nb");
});
