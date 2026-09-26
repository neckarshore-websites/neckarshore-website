#!/usr/bin/env node
/**
 * Guard for `agentRules: false` (decision #2360, revised by the Founder 2026-09-25).
 *
 * WHY THIS EXISTS
 * ---------------
 * Next 16 writes AGENTS.md / CLAUDE.md on `next dev` when it detects an AI coding
 * agent. The first #2360 ruling (2026-09-18) assumed there was no opt-out and kept
 * the generated block in AGENTS.md as a lightning rod, pinned by a drift gate. That
 * premise was false: `agentRules: false` in next.config turns generation off, and the
 * installed next (16.3.5 here) has the key. So the block and its pinning gate are gone, and
 * this script guards the switch instead.
 *
 * It fails when:
 *   1. next.config.ts no longer sets `agentRules: false`   -> the generator is back on;
 *   2. an AGENTS.md is committed                           -> a generated file slipped in;
 *   3. CLAUDE.md carries the nextjs-agent-rules block       -> the generator already wrote.
 *
 * It reads the REAL config (imported through tsx, so a commented-out key does not count)
 * and the REAL files in the checkout. The unit test covers the pure verdict and would be
 * green without ever opening next.config.ts, so CI runs both.
 *
 * Usage:  npm run check:agent-files
 * Tests:  tests/unit/check-agent-files.test.mjs, part of `npm run test:unit` (pure part)
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const NEXT_START_MARKER = "<!-- BEGIN:nextjs-agent-rules -->";

/** The whole verdict, as a pure function. */
export function checkAgentFiles({ agentRules, agentsMdExists, claudeMd }) {
  const failures = [];

  if (agentRules !== false) {
    failures.push({
      code: "switch-off",
      message:
        `next.config.ts has agentRules = ${JSON.stringify(agentRules)}, expected false. ` +
        "Without it `next dev` writes its own AGENTS.md / CLAUDE.md again (#2360).",
    });
  }

  if (agentsMdExists) {
    failures.push({
      code: "agents-md-present",
      message:
        "AGENTS.md is committed. It is a generated file under #2360 and no longer " +
        "belongs in the repo; our own instructions live in CLAUDE.md.",
    });
  }

  if (claudeMd != null && claudeMd.includes(NEXT_START_MARKER)) {
    failures.push({
      code: "claude-md-hosts-block",
      message:
        "CLAUDE.md carries the nextjs-agent-rules block: the generator has written " +
        "into the file that steers agent behaviour. Remove the block and check the switch.",
    });
  }

  return { ok: failures.length === 0, failures };
}

async function main() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const configPath = join(repoRoot, "next.config.ts");

  let agentRules;
  try {
    const mod = await import(pathToFileURL(configPath).href);
    agentRules = mod.default?.agentRules;
  } catch (error) {
    // Fail closed: a config we cannot read yields no verdict, never a pass.
    console.error(`FAIL  could not import ${configPath}: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  const claudePath = join(repoRoot, "CLAUDE.md");
  const result = checkAgentFiles({
    agentRules,
    agentsMdExists: existsSync(join(repoRoot, "AGENTS.md")),
    claudeMd: existsSync(claudePath) ? readFileSync(claudePath, "utf-8") : null,
  });

  if (result.ok) {
    console.log("OK  agentRules is false, no AGENTS.md, CLAUDE.md carries no generated block.");
    process.exit(0);
  }

  console.error("FAIL  agent-file guard (#2360)\n");
  for (const f of result.failures) console.error(`  [${f.code}] ${f.message}`);
  process.exit(1);
}

// Only run when invoked directly, so the unit test can import the pure part.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
