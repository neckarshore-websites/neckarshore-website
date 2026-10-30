#!/usr/bin/env node
/**
 * Dependency CVE gate with an EXPIRING allowlist.
 *
 * Replaces a bare `npm audit --audit-level=high`, which had no way to say
 * "we know about this one and it has no forward fix". Without that, a single
 * unfixable transitive advisory turns a required check permanently red and
 * blocks every merge — including the merge that fixes the OTHER advisories.
 * That is exactly what happened on 2026-07-27: `sharp` (libvips) pinned this
 * repo shut while six Next.js advisories, among them SSRF in rewrites and
 * unauthenticated disclosure of internal Server Function endpoints, sat
 * waiting behind it.
 *
 * DESIGN RULES, in order of importance:
 *
 *  1. FAIL CLOSED. Every unexpected condition exits non-zero: malformed audit
 *     JSON, an empty payload, a missing `vulnerabilities` key, an allowlist
 *     entry whose shape is wrong, an unparseable date. A gate that fails open
 *     is worse than no gate, because it reports green.
 *  2. AN ENTRY EXPIRES. Past its date the build goes red EVEN IF the advisory
 *     is gone. That forces a human to look again instead of letting a
 *     temporary acceptance become permanent silence. This mirrors the sandbox
 *     repo's decay-check.yml, where a deadline is enforced by a job rather
 *     than by memory.
 *  3. MATCH ON ADVISORY ID, NEVER ON PACKAGE NAME. npm reports a parent
 *     package as high purely because a child is (`next` shows up "via: sharp"
 *     with no advisory of its own). Allowlisting by package name would
 *     therefore suppress far more than intended, and would silently keep
 *     suppressing it after the child was fixed. Collecting the distinct GHSA
 *     ids across the whole tree sidesteps that entirely.
 *  4. NO NEW DEPENDENCY. `audit-ci` and `better-npm-audit` both solve this,
 *     and both mean adding a dependency to the thing whose job is auditing
 *     dependencies. This is a small zero-dep Node script, in the same style as
 *     scripts/check-private-slug-leak.sh.
 *
 * Usage:  node scripts/audit-gate.mjs
 * Tests:  node scripts/audit-gate.test.mjs
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/**
 * Advisories we consciously accept, each with a reason and a hard expiry.
 *
 * Adding a line here is a DECISION, not a formality. Two questions must both
 * be answered in the reason: why can this not be fixed today, and what would
 * have to change for it to be removed.
 *
 * DELIBERATELY NOT SHARED ACROSS REPOS. The logic below is duplicated in
 * oakwoodgolfclub-website, and that is the point: the ALLOWLIST is per-repo
 * because the advisory sets genuinely differ (that repo carries js-yaml via
 * gray-matter, which this one does not; this one carried postcss, which it
 * does not). A shared package would invite one list to be applied to a repo
 * whose dependency tree it does not describe — suppressing advisories nobody
 * looked at. Two files, two decisions.
 */
export const ALLOWLIST = [
  // Empty since 2026-10-24. Retired entries, newest first; the reasoning lives in the commit
  // that removed each one (`git log -G <id> -- scripts/audit-gate.mjs`):
  //   GHSA-vfj7-8cjw-p6xm  braces           2026-10-24  advisory WITHDRAWN by GitHub 2026-10-23
  //   GHSA-f88m-g3jw-g9cj  sharp            2026-09-09  fixed: next@16.3.4 widened sharp to ^0.35.4
  //   GHSA-2v37-7h3g-55p8  nanoid           2026-08-26  fixed: overrides pin nanoid 3.3.18
  //   GHSA-mh99-v99m-4gvg  brace-expansion  2026-08-12  fixed: npm audit fix after the freeze lift
  //   GHSA-rgw5-rvv9-x895  brace-expansion  2026-08-12  fixed: same
  // An entry has the shape { id, pkg, devOnly, expires: "YYYY-MM-DD", reason } and its reason
  // names the condition under which it may be removed.
];

/*
 * NOT on this list, because they were FIXED rather than accepted (2026-07-27):
 *   postcss GHSA-qx2v-qp2m-jg93 / GHSA-6g55-p6wh-862q / GHSA-r28c-9q8g-f849
 * Vulnerable range was <=8.5.17 and BOTH resolved instances fell inside it. That
 * mattered more than it first looked: the hoisted node_modules/postcss is the one
 * sanitize-html uses, so the path was reachable at RUNTIME, not only at build time.
 * A single `overrides: { postcss: "8.5.23" }` lifts every instance out of range.
 * Recorded here because "why is this not on the list" is the question a reader of
 * an allowlist actually has.
 */

/**
 * `overrides` in package.json, each with a reason and a hard expiry (planning #1961).
 *
 * WHY THIS EXISTS: an override is an acceptance in disguise, and it ages AGAINST the repair.
 * `nanoid` left the allowlist above on 2026-08-26 for an override, trading an entry that turned
 * this gate red on its own for a pin that nothing ever mentioned again. By 2026-10-29 the
 * `postcss: 8.5.23` pin held sanitize-html BELOW its own declared range (^8.5.27) — a lift had
 * become a cap — and neither pin was needed any more: next@16.4.3 pins postcss 8.5.23 itself
 * and nanoid resolves to 3.3.20 unaided. Both were removed in the same change as this register.
 *
 * THE RULE: every key under `overrides` needs an entry here, and every entry needs an override.
 * An entry expires like an allowlist line; past its date the gate goes red until someone re-
 * decides. The reason names the condition under which the override may go ("drop once every
 * parent's range resolves >= x by itself"). Match on the override KEY exactly as written in
 * package.json (`brace-expansion@^2` is its own key).
 *
 * Shape: { "<override key>": { expires: "YYYY-MM-DD", reason: "..." } }
 */
export const OVERRIDES = {
  // Empty since 2026-10-29 (nanoid 3.3.18 and postcss 8.5.23 removed, see above).
};

const GATED = new Set(["high", "critical"]);

function die(message) {
  console.error(`\n[31mFAIL: ${message}[0m`);
  process.exit(1);
}

/** Runs npm audit and returns the parsed payload. npm exits non-zero when it finds
 *  anything, so a non-zero exit is expected and only the STDOUT matters. */
export function runAudit() {
  let raw;
  try {
    raw = execFileSync("npm", ["audit", "--json"], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (err) {
    raw = err.stdout;
    // No stdout at all means npm itself failed (offline, bad registry, no lockfile).
    // That is NOT "no vulnerabilities" — fail closed.
    if (!raw || !raw.trim()) {
      die(`npm audit produced no output (exit ${err.status}). Cannot verify — refusing to pass.`);
    }
  }
  return raw;
}

/** Extracts the distinct gated advisories from an npm-audit payload. Throws rather
 *  than returning empty on anything it does not recognise. */
export function collectAdvisories(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("npm audit did not return valid JSON — refusing to pass.");
  }
  if (!data || typeof data !== "object") {
    throw new Error("npm audit JSON was not an object — refusing to pass.");
  }
  if (!("vulnerabilities" in data)) {
    throw new Error(
      "npm audit JSON has no `vulnerabilities` key — the format changed or the run failed. " +
        "Refusing to pass.",
    );
  }

  const found = new Map();
  for (const entry of Object.values(data.vulnerabilities)) {
    if (!entry || !GATED.has(entry.severity)) continue;
    for (const via of entry.via ?? []) {
      // Strings are parent-package pointers, not advisories. Only objects carry an id.
      if (typeof via !== "object" || via === null) continue;
      const id = String(via.url ?? "").split("/").pop();
      if (!id) continue;
      found.set(id, { id, title: via.title ?? "(no title)", pkg: entry.name ?? via.name ?? "?" });
    }
  }
  return found;
}

/** Validates allowlist shape and returns the entries that are past their date. */
export function findExpired(allowlist, today) {
  const expired = [];
  for (const entry of allowlist) {
    if (!entry?.id || !entry?.expires || !entry?.reason) {
      throw new Error(`allowlist entry is missing id/expires/reason: ${JSON.stringify(entry)}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.expires)) {
      throw new Error(`allowlist entry ${entry.id} has a malformed expires date: ${entry.expires}`);
    }
    if (entry.expires < today) expired.push(entry);
  }
  return expired;
}

/**
 * Holds package.json `overrides` against the OVERRIDES register. Returns the problems found;
 * throws on a malformed register entry (fail closed, like findExpired).
 *   unregistered: an override with no entry — nobody wrote down why or until when
 *   expired:      an entry past its date — re-decide, do not just extend
 *   orphaned:     an entry whose override is gone — drop the line
 */
export function checkOverrides(overrides, register, today) {
  const keys = Object.keys(overrides ?? {});
  const result = { unregistered: [], expired: [], orphaned: [] };
  for (const [key, entry] of Object.entries(register)) {
    if (!entry?.expires || !entry?.reason) {
      throw new Error(`overrides register entry "${key}" is missing expires/reason`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.expires)) {
      throw new Error(`overrides register entry "${key}" has a malformed expires date: ${entry.expires}`);
    }
    if (!keys.includes(key)) result.orphaned.push(key);
    else if (entry.expires < today) result.expired.push({ key, ...entry });
  }
  result.unregistered = keys.filter((k) => !Object.hasOwn(register, k));
  return result;
}

/** package.json's `overrides`, read from the file the install actually used. */
export function readOverrides(path = new URL("../package.json", import.meta.url)) {
  return JSON.parse(readFileSync(path, "utf8")).overrides ?? {};
}

export function evaluate(raw, allowlist, today) {
  const found = collectAdvisories(raw);
  const expired = findExpired(allowlist, today);
  const allowed = new Map(allowlist.map((e) => [e.id, e]));

  const unlisted = [...found.values()].filter((a) => !allowed.has(a.id));
  const suppressed = [...found.values()].filter((a) => allowed.has(a.id));

  // Listed, not reported, not expired: the entry no longer does anything. Expired entries are
  // reported as expired instead, so a line is never named twice.
  const stale = allowlist.filter((e) => !found.has(e.id) && !expired.includes(e));

  return { found, unlisted, suppressed, expired, allowed, stale };
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  let result;
  let ov;
  try {
    result = evaluate(runAudit(), ALLOWLIST, today);
    ov = checkOverrides(readOverrides(), OVERRIDES, today);
  } catch (err) {
    die(err.message);
    return;
  }

  console.log("=== Dependency CVE gate (high/critical, expiring allowlist) ===\n");

  if (result.suppressed.length) {
    console.log("Accepted advisories — each expires and will turn this gate red:");
    for (const a of result.suppressed) {
      const e = result.allowed.get(a.id);
      console.log(`  [33m~[0m ${a.id}  ${a.pkg}${e.devOnly ? "  [dev-only]" : ""}`);
      console.log(`      ${a.title}`);
      console.log(`      expires ${e.expires} — ${e.reason}`);
    }
    console.log("");
  }

  if (result.stale.length) {
    console.log("Listed but no longer reported — drop these lines, after reading WHY it is gone:");
    for (const e of result.stale) {
      console.log(`  [36m·[0m ${e.id}  ${e.pkg}  https://github.com/advisories/${e.id}`);
    }
    console.log("    fixed (a version in the tree), or withdrawn (the advisory page says so, or");
    console.log(`    gh api /advisories/<id> -q .withdrawn_at)? The removal commit names which.`);
    console.log("");
  }

  if (result.expired.length) {
    console.error("[31mEXPIRED allowlist entries — re-decide, do not just extend:[0m");
    for (const e of result.expired) {
      console.error(`  [31mx[0m ${e.id}  ${e.pkg}  expired ${e.expires}`);
      console.error(`      ${e.reason}`);
    }
  }

  if (result.unlisted.length) {
    console.error("[31mUNACCEPTED high/critical advisories:[0m");
    for (const a of result.unlisted) {
      console.error(`  [31mx[0m ${a.id}  ${a.pkg}`);
      console.error(`      ${a.title}`);
    }
  }

  if (ov.unregistered.length) {
    console.error("[31mOVERRIDES without a register entry (scripts/audit-gate.mjs OVERRIDES):[0m");
    for (const k of ov.unregistered) console.error(`  [31mx[0m ${k}  — add { expires, reason }, or drop the override`);
  }
  if (ov.expired.length) {
    console.error("[31mEXPIRED overrides — is the pin still needed, and is it now a cap?[0m");
    for (const e of ov.expired) console.error(`  [31mx[0m ${e.key}  expired ${e.expires} — ${e.reason}`);
  }
  if (ov.orphaned.length) {
    console.error("[31mRegister entries without an override — drop the line:[0m");
    for (const k of ov.orphaned) console.error(`  [31mx[0m ${k}`);
  }
  const ovProblems = ov.unregistered.length + ov.expired.length + ov.orphaned.length;

  if (result.expired.length || result.unlisted.length || ovProblems) {
    die(
      `${result.unlisted.length} unaccepted advisory/advisories, ` +
        `${result.expired.length} expired allowlist entry/entries, ` +
        `${ovProblems} override problem(s).`,
    );
  }

  console.log(
    `[32mPASS[0m — ${result.found.size} gated advisory/advisories, all explicitly accepted and unexpired.`,
  );
}

// Only run when invoked directly, so the tests can import the pure helpers.
if (process.argv[1] && process.argv[1].endsWith("audit-gate.mjs")) main();
