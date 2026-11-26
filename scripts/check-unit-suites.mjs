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
 *      as a whole `run:` command by a workflow that triggers on pull_request -> a suite
 *      that cannot turn a pull request red. `npm run test:unit || true` does not count,
 *      nor a continued or folded line, a `name:` or a comment that mentions the script,
 *      nor a step or job with `continue-on-error`.
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

// ---- Reading the workflows -------------------------------------------------------------------
// The workflows are read by indentation, not by a YAML library (no dependency in six repos). What
// is understood: comments, the `on:` trigger in its three spellings, `run:` values (single line,
// literal `|` and folded `>` blocks), and `continue-on-error` on the step or on the job.

const indentOf = (line) => line.match(/^ */)[0].length;

// Drop a YAML comment: `#` at the start or after whitespace, outside quotes on that line.
function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i).trimEnd();
  }
  return line.trimEnd();
}

// True when the top-level `on:` names pull_request (not pull_request_target).
function triggersOnPullRequest(lines) {
  const at = lines.findIndex((l) => /^["']?on["']?\s*:/.test(l));
  if (at < 0) return false;
  const rest = lines[at].replace(/^["']?on["']?\s*:\s*/, "");
  if (rest) return /\bpull_request\b(?!_)/.test(rest);
  let child = -1;
  for (const line of lines.slice(at + 1)) {
    if (!line.trim()) continue;
    const ind = indentOf(line);
    if (ind === 0) break;
    if (child < 0) child = ind;
    if (ind === child && /^\s*(?:-\s*pull_request\s*$|pull_request\s*:)/.test(line)) return true;
  }
  return false;
}

const tolerant = (value) => value.trim() !== "" && value.trim() !== "false";

// Every shell command a `run:` executes, with whether a failure of it can be swallowed by
// `continue-on-error` on its step or its job.
function runCommands(lines) {
  const out = [];
  lines.forEach((line, i) => {
    const m = line.match(/^(\s*)(-\s+)?run:\s*(.*)$/);
    if (!m) return;
    const keyIndent = m[1].length + (m[2] ? m[2].length : 0);
    const rest = m[3];
    let cmds;
    if (/^[|>][-+0-9]*$/.test(rest)) {
      const body = [];
      for (const l of lines.slice(i + 1)) {
        if (l.trim() && indentOf(l) <= keyIndent) break;
        if (l.trim()) body.push(l.trim());
      }
      // Folded: the lines are one command. Literal: one command per line, joined where a line
      // ends in `\` or the next one starts with `||`, `&&` or `|`.
      cmds = [];
      for (const l of rest.startsWith(">") ? [body.join(" ")] : body) {
        const prev = cmds.length - 1;
        if (prev >= 0 && (/\\$/.test(cmds[prev]) || /^(?:\|\||&&|\|)/.test(l))) cmds[prev] = `${cmds[prev]} ${l}`;
        else cmds.push(l);
      }
    } else cmds = [rest.replace(/^(["'])(.*)\1$/, "$2")];

    // The step: its `- ` line sits two columns left of the keys.
    const dashIndent = keyIndent - 2;
    let stepStart = m[2] ? i : -1;
    for (let j = i - 1; stepStart < 0 && j >= 0; j--) {
      const l = lines[j];
      if (!l.trim()) continue;
      const ind = indentOf(l);
      if (ind === dashIndent && /^\s*-\s/.test(l)) stepStart = j;
      else if (ind < keyIndent) break;
    }
    let swallowed = false;
    if (stepStart >= 0) {
      for (let j = stepStart; j < lines.length; j++) {
        const l = lines[j];
        if (j > stepStart && l.trim() && indentOf(l) <= dashIndent) break;
        const k = l.match(/^(\s*)(-\s+)?continue-on-error:\s*(.*)$/);
        if (k && k[1].length + (k[2] ? k[2].length : 0) === keyIndent && tolerant(k[3])) swallowed = true;
      }
      // The job: the `steps:` key above the step, and its siblings.
      let steps = -1;
      for (let j = stepStart - 1; j >= 0; j--) {
        const l = lines[j];
        if (l.trim() && indentOf(l) < dashIndent) {
          if (/^\s*steps\s*:/.test(l)) steps = j;
          break;
        }
      }
      if (steps >= 0) {
        const jobIndent = indentOf(lines[steps]);
        let from = steps;
        while (from > 0 && !(lines[from - 1].trim() && indentOf(lines[from - 1]) < jobIndent)) from--;
        for (let j = from; j < lines.length; j++) {
          const l = lines[j];
          if (j > steps && l.trim() && indentOf(l) < jobIndent) break;
          const k = l.match(/^(\s*)continue-on-error:\s*(.*)$/);
          if (k && k[1].length === jobIndent && tolerant(k[2])) swallowed = true;
        }
      }
    }
    for (const cmd of cmds) out.push({ cmd: cmd.trim(), swallowed });
  });
  return out;
}

const workflowDir = join(root, ".github/workflows");
const prCommands = (existsSync(workflowDir) ? readdirSync(workflowDir) : [])
  .filter((n) => /\.ya?ml$/.test(n))
  .map((n) => readFileSync(join(workflowDir, n), "utf8").split(/\r?\n/).map(stripComment))
  .filter(triggersOnPullRequest)
  .flatMap(runCommands);

const problems = [];

for (const file of SEARCHED_DIRS.flatMap((d) => walk(join(root, d))).sort()) {
  if (!named.has(file) && !globs.some((g) => g.test(file))) problems.push(`no package.json script runs ${file}`);
}

for (const name of Object.keys(scripts).filter((n) => /^test:(?:.+:)?unit$/.test(n)).sort()) {
  // The whole command must be `npm run <name>`: not `... || true`, not inside a step or job
  // whose failure is swallowed by continue-on-error.
  if (!prCommands.some(({ cmd, swallowed }) => !swallowed && cmd === `npm run ${name}`)) {
    problems.push(`no pull_request workflow runs ${name}`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`check-unit-suites: ${p}`);
  process.exit(1);
}
console.log("check-unit-suites: every test file has a script, every unit script runs in a pull_request workflow");
