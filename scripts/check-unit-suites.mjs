#!/usr/bin/env node
/**
 * Completeness guard for the hand-written unit-suite lists.
 *
 * WHY: the unit suites are wired by hand in two places (package.json scripts and
 * .github/workflows/unit.yml). test:unit names its files one by one, so a new
 * test file that nobody adds to that line runs nowhere and CI stays green. Ported
 * from oakwoodgolfclub-website#258, where tests/search/route.test.ts had sat unrun
 * from June to November (Lenin report 2026-10-17-f, row 17).
 *
 * It fails when:
 *   1. a *.test.ts / *.test.mjs file under tests/ or scripts/ is named by no
 *      package.json script                      -> a test file no runner executes;
 *   2. a `test:<name>:unit` script is not run by unit.yml -> a suite that cannot
 *      turn a pull request red.
 *
 * Usage:  npm run check:unit-suites
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// CHECK_UNIT_SUITES_ROOT lets the unit test point the guard at a fixture checkout.
const root = process.env.CHECK_UNIT_SUITES_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.test\.(ts|mjs)$/.test(name)) out.push(relative(root, full));
  }
  return out;
}

const scripts = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts;
const scriptText = Object.values(scripts).join("\n");
const unitYml = readFileSync(join(root, ".github/workflows/unit.yml"), "utf8");

const problems = [];

for (const file of [...walk(join(root, "tests")), ...walk(join(root, "scripts"))].sort()) {
  if (!scriptText.includes(file)) problems.push(`no package.json script runs ${file}`);
}

for (const name of Object.keys(scripts).filter((n) => /^test:.+:unit$/.test(n)).sort()) {
  // Anchored: a commented-out `# npm run test:x:unit` line does not count as running it.
  if (!new RegExp(`^[ \\t]*(?:-[ \\t]*)?(?:run:[ \\t]*)?npm run ${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(unitYml)) {
    problems.push(`unit.yml does not run ${name}`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`check-unit-suites: ${p}`);
  process.exit(1);
}
console.log("check-unit-suites: every test file has a script, every unit script runs in unit.yml");
