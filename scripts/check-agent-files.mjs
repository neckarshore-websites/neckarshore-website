#!/usr/bin/env node
/**
 * Drift gate for the FOREIGN-WRITTEN block in AGENTS.md.
 *
 * WHY THIS EXISTS
 * ---------------
 * `next dev` writes into our instruction files without asking. Measured
 * 2026-09-18: the generator lives at
 * `node_modules/next/dist/server/lib/generate-agent-files.js`, has no
 * opt-out switch (no env var, no config key), and targets BOTH `AGENTS.md`
 * and `CLAUDE.md`. Five repos have carried its block since March 2026.
 *
 * The reflex — delete the block — makes things WORSE, and that is the whole
 * reason this gate has the shape it has. The generator picks its target file
 * like this (read from the source, not inferred):
 *
 *     if AGENTS.md exists AND (AGENTS.md hosts the block OR CLAUDE.md does not)
 *          -> write AGENTS.md, skip CLAUDE.md
 *     else if CLAUDE.md exists
 *          -> write CLAUDE.md
 *     else
 *          -> create both
 *
 * So an AGENTS.md carrying the block is a LIGHTNING ROD: it keeps `next dev`
 * out of `CLAUDE.md`, the file that actually steers agent behaviour. Remove
 * the block and the foreign write is redirected there instead.
 *
 * Decision MASCHIN #2360 (2026-09-18), under Founder referral:
 *   1. The block STAYS in AGENTS.md — deliberately, not tolerated.
 *   2. A sentence of OURS sits directly above it, so a reader meets our text
 *      before the tool's.
 *   3. CLAUDE.md must never host the block. If it does, the lightning rod has
 *      burned through.
 *   4. The gate checks whether the block CHANGES, not whether it EXISTS. The
 *      risk is a silent extension on the next Next.js bump, not its presence.
 *
 * DESIGN RULES, in order of importance:
 *
 *  1. THE EXPECTED VALUE IS CHECKED IN, NEVER READ FROM `node_modules`.
 *     Comparing the installed block against the generator's own output would
 *     be a gate that agrees with whatever the tool currently says — it can
 *     never go red on a version bump, which is the single event it exists to
 *     catch. `scripts/nextjs-agent-rules.expected.md` is the arbiter.
 *  2. THE EXPECTED VALUE IS THE BLOCK ITSELF, NOT ONLY ITS HASH. #2360 asks
 *     for the diff in the error message, and a hash cannot produce one. The
 *     hash is printed alongside for a quick eyeball; the text is what is
 *     compared.
 *  3. OUR SENTENCE IS GUARDED BY A SENTINEL, NOT BY ITS PROSE. The note
 *     carries `<!-- BEGIN:neckarshore-agent-note -->`; the gate asserts the
 *     sentinel exists and sits ABOVE the nextjs marker. Rewording our own
 *     text must not turn this gate red — only losing or misplacing it should.
 *  4. IT READS THE REAL FILES IN THE REPO. The unit test covers the pure
 *     logic; this script is the half that looks at the shipped artifact.
 *     Wiring only the unit test would produce a green check that never opened
 *     AGENTS.md.
 *  5. EOL IS NORMALISED BEFORE COMPARING. The generator rewrites the block in
 *     whatever line ending the file already uses (`detectEol`), so a CRLF
 *     checkout would otherwise be a permanent false red.
 *  6. NO NEW DEPENDENCY. Zero-dep Node, same house style as
 *     scripts/audit-gate.mjs and scripts/check-repo-list.mjs.
 *
 * NOTE ON THE TOOL'S OWN ADVICE: the block literally instructs readers to
 * commit it ("committing it with your work keeps the tree clean"). We do
 * commit it — because of decision #2360 point 1, NOT because the tool
 * recommends it. A foreign tool does not get to set our commit policy.
 *
 * Usage:  node scripts/check-agent-files.mjs      (npm run check:agent-files)
 * Tests:  node --test tests/unit/check-agent-files.test.mjs   (pure part)
 */

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const NEXT_START_MARKER = "<!-- BEGIN:nextjs-agent-rules -->";
export const NEXT_END_MARKER = "<!-- END:nextjs-agent-rules -->";
export const NOTE_START_MARKER = "<!-- BEGIN:neckarshore-agent-note -->";

/** Rule 5: compare content, not line endings. */
export function normalizeEol(s) {
  return s.replace(/\r\n/g, "\n");
}

/**
 * Same extraction semantics as the generator's own `extractAgentRulesBlock`:
 * from the start marker through the END of the end marker, or null when the
 * markers are absent or out of order.
 */
export function extractBlock(content) {
  if (content == null) return null;
  const start = content.indexOf(NEXT_START_MARKER);
  if (start === -1) return null;
  const end = content.indexOf(NEXT_END_MARKER, start);
  if (end === -1) return null;
  return content.slice(start, end + NEXT_END_MARKER.length);
}

/** Minimal line diff — enough to see WHAT the tool changed. */
export function diffLines(expected, actual) {
  const e = normalizeEol(expected).split("\n");
  const a = normalizeEol(actual).split("\n");
  const out = [];
  for (let i = 0; i < Math.max(e.length, a.length); i++) {
    if (e[i] === a[i]) continue;
    if (e[i] !== undefined) out.push(`  - expected: ${JSON.stringify(e[i])}`);
    if (a[i] !== undefined) out.push(`  + actual:   ${JSON.stringify(a[i])}`);
  }
  return out.join("\n");
}

export function sha256(s) {
  return createHash("sha256").update(normalizeEol(s), "utf8").digest("hex");
}

/**
 * The whole verdict, as a pure function. `agentsMd` / `claudeMd` are file
 * contents or null when the file does not exist.
 */
export function checkAgentFiles({ agentsMd, claudeMd, expectedBlock }) {
  const failures = [];

  if (agentsMd == null) {
    failures.push({
      code: "agents-md-missing",
      message:
        "AGENTS.md does not exist. The lightning rod is gone: the next `next dev` " +
        "run will write its block into CLAUDE.md instead (#2360 point 3).",
    });
    return { ok: false, failures };
  }

  const installed = extractBlock(agentsMd);

  if (installed === null) {
    failures.push({
      code: "lightning-rod-gone",
      message:
        "AGENTS.md carries no nextjs-agent-rules block. Decision #2360 point 1 " +
        "keeps it deliberately — without it, `next dev` redirects its write " +
        "into CLAUDE.md, the file that steers agent behaviour.",
    });
  } else if (normalizeEol(installed) !== normalizeEol(expectedBlock)) {
    failures.push({
      code: "block-changed",
      message:
        "The nextjs-agent-rules block in AGENTS.md differs from the checked-in " +
        "expected value. A Next.js bump most likely rewrote it. Read the diff, " +
        "decide whether we accept the new text, then update " +
        "scripts/nextjs-agent-rules.expected.md in the SAME commit.",
      diff: diffLines(expectedBlock, installed),
    });
  }

  if (claudeMd != null && claudeMd.includes(NEXT_START_MARKER)) {
    failures.push({
      code: "claude-md-hosts-block",
      message:
        "CLAUDE.md hosts the nextjs-agent-rules block. The lightning rod has " +
        "burned through (#2360 point 3) — a foreign tool is now writing into " +
        "the file that steers agent behaviour. Restore the block in AGENTS.md " +
        "and remove it from CLAUDE.md.",
    });
  }

  const noteIdx = agentsMd.indexOf(NOTE_START_MARKER);
  if (noteIdx === -1) {
    failures.push({
      code: "note-marker-missing",
      message:
        `AGENTS.md is missing ${NOTE_START_MARKER}. #2360 point 2 requires our ` +
        "own sentence above the foreign block, so a reader meets our text first.",
    });
  } else if (installed !== null) {
    const nextIdx = agentsMd.indexOf(NEXT_START_MARKER);
    if (noteIdx > nextIdx) {
      failures.push({
        code: "note-not-above-block",
        message:
          "Our note sits BELOW the nextjs-agent-rules block. #2360 point 2 " +
          "requires it directly above — a reader must meet our text first.",
      });
    }
  }

  return { ok: failures.length === 0, failures };
}

function tryRead(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function main() {
  // Rule 4: resolve from this file, so the gate reads the repo's real files
  // no matter which directory CI invokes it from.
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const expectedPath = join(repoRoot, "scripts", "nextjs-agent-rules.expected.md");

  const expectedBlock = tryRead(expectedPath);
  if (expectedBlock == null) {
    // Fail closed: no expected value means no verdict, never a pass.
    console.error(`FAIL  expected-value file missing: ${expectedPath}`);
    process.exit(1);
  }

  const result = checkAgentFiles({
    agentsMd: tryRead(join(repoRoot, "AGENTS.md")),
    claudeMd: tryRead(join(repoRoot, "CLAUDE.md")),
    expectedBlock,
  });

  if (result.ok) {
    console.log(
      `OK  AGENTS.md block matches scripts/nextjs-agent-rules.expected.md ` +
        `(sha256 ${sha256(expectedBlock).slice(0, 16)}…), our note sits above it, ` +
        `CLAUDE.md is blockless.`
    );
    process.exit(0);
  }

  console.error("FAIL  agent-file drift gate (#2360)\n");
  for (const f of result.failures) {
    console.error(`  [${f.code}] ${f.message}`);
    if (f.diff) console.error(`\n${f.diff}\n`);
  }
  process.exit(1);
}

// Only run when invoked directly, so the unit test can import the pure parts.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
