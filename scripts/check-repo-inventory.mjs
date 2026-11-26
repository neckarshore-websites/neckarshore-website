#!/usr/bin/env node
/**
 * Generation-time check: the three repository counts agree.
 *
 * WHY HERE AND NOT IN THE PR SUITE: public/repositories.json and public/stats.json are
 * written only by update-stats.yml on main. Until 2026-11-26, TC-CNT-078 (e2e) demanded
 * `repos.length + privateCount === stats-config.json length` on every pull request, so a
 * PR that added a repository to stats-config.json was red until someone hand-edited
 * privateCount in repositories.json and then `repos` in stats.json for TC-STAT-010 (done by
 * hand at least three times, MASCHIN routing 2026-10-06, point 4). The equality is a
 * property of the generated files, so it is checked where they are generated: after the
 * write, before the commit, fail-closed. A wrong count then stops the run, nothing is
 * committed and yesterday's numbers stay live.
 *
 * It fails when:
 *   1. repositories.json `repos.length + privateCount` differs from the stats-config.json total;
 *   2. stats.json `repos` (the Repositories tile) differs from that total;
 *   3. a file is missing or a count is not a non-negative integer.
 *
 * Usage:  node scripts/check-repo-inventory.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// CHECK_REPO_INVENTORY_ROOT lets the unit test point the check at a fixture checkout.
const root = process.env.CHECK_REPO_INVENTORY_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), "utf8"));
  } catch (err) {
    console.error(`check-repo-inventory: cannot read ${rel}: ${err.message}`);
    process.exit(1);
  }
}

const isCount = (n) => Number.isInteger(n) && n >= 0;

const config = readJson("stats-config.json");
const inventory = readJson("public/repositories.json");
const stats = readJson("public/stats.json");

const problems = [];
const configTotal = Array.isArray(config.repos) ? config.repos.length : NaN;
if (!isCount(configTotal)) problems.push("stats-config.json has no repos list");
if (!Array.isArray(inventory.repos) || !isCount(inventory.privateCount)) {
  problems.push("public/repositories.json needs a repos list and an integer privateCount");
}
if (!isCount(stats.repos)) problems.push("public/stats.json needs an integer repos");

if (!problems.length) {
  const served = inventory.repos.length + inventory.privateCount;
  if (served !== configTotal) {
    problems.push(
      `public/repositories.json counts ${served} (${inventory.repos.length} public + ${inventory.privateCount} private), stats-config.json lists ${configTotal}`,
    );
  }
  if (stats.repos !== configTotal) {
    problems.push(`public/stats.json repos is ${stats.repos}, stats-config.json lists ${configTotal}`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`check-repo-inventory: ${p}`);
  process.exit(1);
}
console.log(`check-repo-inventory: ${configTotal} repositories in config, inventory and tile`);
