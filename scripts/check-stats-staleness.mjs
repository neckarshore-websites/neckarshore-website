#!/usr/bin/env node
/**
 * check-stats-staleness.mjs — durable-estate-count Block 5 (collector staleness gate).
 *
 * WHY THIS EXISTS (the compensating control): while the seed's `audited_floor` lives, the collector
 * publishes total = max(live+seed sum, audited_floor). That max() MASKS a silent under-report — a
 * live producer whose CI stopped emitting (dead workflow, broken emit job, force-pushed-away stats
 * branch) keeps contributing its LAST emitted number, or is quietly floored over, with no signal.
 * This gate makes that condition VISIBLE: any fetched producer whose stats.json `updatedAt` is older
 * than the threshold is surfaced as a WARN (stderr + the public job summary). It NEVER fails the run
 * (guardrail #244 — the daily stats publish must keep going) and NEVER edits the served artifact.
 *
 * Staleness signal = `updatedAt` (the producer's own emit timestamp), NOT the audited_sha commit date:
 * updatedAt is already in the fetched stats.json (no extra GitHub API round-trip) and is exactly the
 * "when did this producer's CI last emit" fact the gate cares about. A quiet-but-healthy repo (no
 * pushes for N days) also trips it — that is intentional: WARN-only, so a false-positive costs a human
 * glance, never a broken build, and a genuinely dead producer can no longer hide behind max().
 *
 * Pure core (`classifyStaleness`) is list-in -> classification-out: deterministic, no fs, no clock —
 * the CLI wrapper injects `now` and reads the fetched-stats dir. Mirrors the aggregate-test-scope.sh
 * separation (bug-prone logic unit-gated; I/O in the caller).
 *
 * CLI usage (from update-stats.yml, AFTER the fetch loop):
 *   node scripts/check-stats-staleness.mjs <stats-config.json> <stats-dir> [thresholdDays] [nowISO]
 *   - stats-dir holds one file per fetched producer, named "<owner>__<name>.json" (same as the
 *     aggregator's input). Only repos that declare a statsPath are EXPECTED producers.
 * Exit code: ALWAYS 0 (fail-open). Emits a `### Estate staleness` block to $GITHUB_STEP_SUMMARY.
 *
 * Run (tests): npm run test:unit
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Default staleness threshold. Producers emit on push->main; 14 days is lenient enough that a
 *  normally-active repo never trips it, tight enough that a dead emit job surfaces within two weeks. */
export const DEFAULT_THRESHOLD_DAYS = 14;

/**
 * ageDays — whole days between an ISO `updatedAt` and a now-epoch (ms).
 * Returns null when `updatedAt` is missing/unparseable (an unknown-age producer is treated as stale
 * by the classifier — a missing timestamp is itself a staleness signal, never a silent skip).
 */
export function ageDays(updatedAt, nowMs) {
  if (!updatedAt) return null;
  const t = Date.parse(updatedAt);
  if (Number.isNaN(t)) return null;
  return Math.floor((nowMs - t) / 86_400_000);
}

/**
 * classifyStaleness — pure staleness classification over a producer list.
 * @param {{repo: string, updatedAt: string|null}[]} producers
 * @param {number} nowMs   epoch milliseconds treated as "now"
 * @param {number} thresholdDays  a producer strictly OLDER than this is stale
 * @returns {{thresholdDays:number, now:string, producers:Array, stale:Array}}
 *   `stale` is sorted oldest-first (worst offender leads the WARN); unknown-age rows sort last.
 */
export function classifyStaleness(producers, nowMs, thresholdDays = DEFAULT_THRESHOLD_DAYS) {
  const classified = producers.map((p) => {
    const age = ageDays(p.updatedAt, nowMs);
    // Unknown age (null) is stale: a producer that declared a statsPath but has no parseable
    // emit timestamp is exactly the silent-failure case this gate exists to surface.
    const stale = age === null || age > thresholdDays;
    return { repo: p.repo, updatedAt: p.updatedAt ?? null, ageDays: age, stale };
  });

  const stale = classified
    .filter((p) => p.stale)
    .sort((a, b) => {
      // Oldest-first; a null age (unknown, worst-signal-but-unrankable) sorts after all known ages.
      if (a.ageDays === null && b.ageDays === null) return 0;
      if (a.ageDays === null) return 1;
      if (b.ageDays === null) return -1;
      return b.ageDays - a.ageDays;
    })
    .map(({ repo, updatedAt, ageDays: age }) => ({ repo, updatedAt, ageDays: age }));

  return { thresholdDays, now: new Date(nowMs).toISOString(), producers: classified, stale };
}

// --- CLI wrapper (I/O; the pure core above is what the unit test exercises) ---

function isMain() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function readExpectedProducers(configPath, statsDir) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const expected = (config.repos ?? []).filter((r) => r.statsPath);
  return expected.map((r) => {
    const file = path.join(statsDir, `${r.owner}__${r.name}.json`);
    let updatedAt = null;
    try {
      updatedAt = JSON.parse(fs.readFileSync(file, "utf8")).updatedAt ?? null;
    } catch {
      updatedAt = null; // missing/unparseable -> unknown age -> stale (surfaced, never silent)
    }
    return { repo: `${r.owner}/${r.name}`, updatedAt };
  });
}

if (isMain()) {
  const [configPath, statsDir, thresholdArg, nowArg] = process.argv.slice(2);
  if (!configPath || !statsDir) {
    console.error(
      "usage: check-stats-staleness.mjs <stats-config.json> <stats-dir> [thresholdDays] [nowISO]",
    );
    process.exit(0); // fail-open even on a usage slip — never abort the stats publish
  }

  try {
    const thresholdDays = thresholdArg ? Number(thresholdArg) : DEFAULT_THRESHOLD_DAYS;
    const nowMs = nowArg ? Date.parse(nowArg) : Date.now();
    const producers = readExpectedProducers(configPath, statsDir);
    const out = classifyStaleness(producers, nowMs, thresholdDays);

    if (out.stale.length > 0) {
      const list = out.stale
        .map((s) => `${s.repo} (${s.ageDays === null ? "no updatedAt" : `${s.ageDays}d`})`)
        .join(", ");
      console.error(
        `WARN: ${out.stale.length} estate producer(s) stale (> ${thresholdDays}d since emit): ${list}`,
      );
    } else {
      console.error(`estate staleness: all ${out.producers.length} producers fresh (<= ${thresholdDays}d)`);
    }

    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile) {
      const lines = [
        "### Estate staleness gate",
        "",
        `- threshold: **${thresholdDays}d** since last emit (\`updatedAt\`)`,
        `- ✅ fresh: **${out.producers.length - out.stale.length}**`,
        `- ⚠️ stale: **${out.stale.length}**`,
      ];
      if (out.stale.length > 0) {
        lines.push("- offending:");
        for (const s of out.stale) {
          lines.push(`  - ${s.repo} — ${s.ageDays === null ? "no updatedAt" : `${s.ageDays}d`}`);
        }
      }
      try {
        fs.appendFileSync(summaryFile, lines.join("\n") + "\n");
      } catch {
        /* summary is best-effort — never abort on a write hiccup */
      }
    }
  } catch (e) {
    // Absolute fail-open backstop: any unexpected error is a WARN, never a non-zero exit.
    console.error(`WARN: staleness gate errored (non-fatal): ${e?.message ?? e}`);
  }
  process.exit(0);
}
