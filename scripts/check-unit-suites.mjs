#!/usr/bin/env node
/**
 * Completeness guard for the hand-written unit-suite lists.
 *
 * WHY: the unit suites are wired by hand in two places (package.json scripts and
 * the workflows under .github/workflows). A test file that nobody adds to a script
 * runs nowhere and CI stays green. Ported from oakwoodgolfclub-website#258, where
 * tests/search/route.test.ts had sat unrun from June to November (Lenin report
 * 2026-10-17-f, row 17).
 *
 * It fails when:
 *   1. a *.test.{ts,tsx,mts,mjs,js,cjs} file under tests/, scripts/ or src/ is
 *      named by no package.json script, neither by its path nor by a glob such as
 *      "tests/unit/*.test.ts"                     -> a test file no runner executes;
 *   2. `test:unit` or a `test:<name>:unit` script is not run, on a line of its own,
 *      by a workflow that triggers on pull_request -> a suite that cannot turn a
 *      pull request red. A line such as `npm run test:unit || true` does not count,
 *      nor one continued by a trailing `\` or by a next line starting with `||`, `&&`
 *      or `|` (a folded `run: >` block). The workflow is read as text, not parsed as
 *      YAML; those are the continuations it recognises.
 *
 * The same file is copied into each website repository; keep the copies identical.
 *
 * Usage:  npm run check:unit-suites
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

// CHECK_UNIT_SUITES_ROOT lets the unit test point the guard at a fixture checkout.
const root = process.env.CHECK_UNIT_SUITES_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..");

const TEST_FILE = /\.test\.(ts|tsx|mts|mjs|js|cjs)$/;
const SEARCHED_DIRS = ["tests", "scripts", "src"];

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (TEST_FILE.test(name)) out.push(relative(root, full).split(sep).join("/"));
  }
  return out;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Minimal glob: `**/` any depth (also none), `**` anything, `*` within one segment, `?` one char.
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") {
        re += "(?:.*/)?";
        i += 2;
      } else {
        re += ".*";
        i += 1;
      }
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += escapeRegExp(c);
  }
  return new RegExp(`^${re}$`);
}

const scripts = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts ?? {};

// Every word of every script, split on whitespace and shell operators (`;`, `&&`, `|`,
// parentheses, redirects), quotes and a leading ./ removed.
const words = Object.values(scripts)
  .flatMap((cmd) => cmd.split(/[\s;&|()<>]+/))
  .map((w) => w.replace(/^["']|["']$/g, "").replace(/^\.\//, ""))
  .filter(Boolean);
const named = new Set(words.filter((w) => !/[*?]/.test(w)));
const globs = words.filter((w) => /[*?]/.test(w)).map(globToRegExp);

const workflowDir = join(root, ".github/workflows");
const prWorkflows = (existsSync(workflowDir) ? readdirSync(workflowDir) : [])
  .filter((n) => /\.ya?ml$/.test(n))
  .map((n) => readFileSync(join(workflowDir, n), "utf8"))
  // `on: pull_request`, `on: [push, pull_request]`, a `- pull_request` list item or a
  // `pull_request:` key; not pull_request_target.
  .filter((text) => /^\s*(?:on:.*\bpull_request\b(?!_)|-\s*pull_request\s*$|pull_request\s*:)/m.test(text));

const problems = [];

for (const file of SEARCHED_DIRS.flatMap((d) => walk(join(root, d))).sort()) {
  if (!named.has(file) && !globs.some((g) => g.test(file))) problems.push(`no package.json script runs ${file}`);
}

for (const name of Object.keys(scripts).filter((n) => /^test:(?:.+:)?unit$/.test(n)).sort()) {
  // Anchored: a commented-out `# npm run x` line, or `npm run x || true`, does not count.
  const runs = new RegExp(`^[ \\t]*(?:-[ \\t]*)?(?:run:[ \\t]*)?npm run ${escapeRegExp(name)}[ \\t]*$`);
  const runsAlone = (text) => {
    const lines = text.split(/\r?\n/);
    return lines.some((line, i) => runs.test(line) && !/^\s*(?:\|\||&&|\|)/.test(lines[i + 1] ?? ""));
  };
  if (!prWorkflows.some(runsAlone)) problems.push(`no pull_request workflow runs ${name}`);
}

if (problems.length) {
  for (const p of problems) console.error(`check-unit-suites: ${p}`);
  process.exit(1);
}
console.log("check-unit-suites: every test file has a script, every unit script runs in a pull_request workflow");
