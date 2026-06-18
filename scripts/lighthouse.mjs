#!/usr/bin/env node

/**
 * Local Lighthouse audit — runs against a prod build on localhost.
 *
 * Usage:
 *   npm run lighthouse           (builds, starts, audits all profiles, stops)
 *   npm run lighthouse:quick     (skips build, assumes server is running on :3000)
 *
 * Device Matrix (3 profiles) — defined in ./lighthouse-profiles.mjs:
 *   1. Desktop    — LAN baseline, --preset=desktop, 1× CPU
 *   2. Mobile 5G  — fast network (~50 Mbps, RTT 20ms), 4× CPU
 *   3. Mobile 4G  — Lighthouse Slow-4G default (~1.6 Mbps, RTT 150ms), 4× CPU
 *
 * 5G is FASTER than 4G — the network ordering is correct. The old
 * "Mobile Slow (Edge-5G)" profile (400 Kbps / 6× CPU) was DELETED 2026-06-18:
 * 400 Kbps is slower than 4G, so the "5G" label inverted reality.
 *
 * Gate Policy (German Rauhut directive 2026-06-18):
 *   - performance is SOFT on EVERY profile — advisory warning line, never blocks.
 *     The exit code reflects ONLY hard-gate failures. No hard perf gate on 4G —
 *     we do not block on an old-tech network the audience has moved past.
 *   - accessibility / best-practices / seo are HARD @95 on every profile —
 *     deterministic categories, a drop is a real defect.
 *   - Per-metric soft override lives in each profile's `softMetrics` list.
 *
 * Full rationale + canonical design source: see ./lighthouse-profiles.mjs.
 */

import { execFileSync, spawn } from "node:child_process";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PROFILES } from "./lighthouse-profiles.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const URL = process.env.LIGHTHOUSE_URL || "http://localhost:3000";
const QUICK = process.argv.includes("--quick");
const MAX_RETRIES = 3;

// Optional: filter to a single profile via --profile=desktop|mobile-5g|mobile-4g
const profileArg = process.argv.find((a) => a.startsWith("--profile="));
const selectedProfile = profileArg ? profileArg.split("=")[1] : null;
const PROFILES_TO_RUN = selectedProfile
  ? PROFILES.filter((p) => p.name === selectedProfile)
  : PROFILES;

if (selectedProfile && PROFILES_TO_RUN.length === 0) {
  console.error(`Unknown profile: ${selectedProfile}`);
  console.error(`Available: ${PROFILES.map((p) => p.name).join(", ")}`);
  process.exit(2);
}

// ── Helpers ──────────────────────────────────────────────────────────

function log(msg) {
  console.log(`\n  ${msg}`);
}

function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        execFileSync("curl", ["-sf", url], { stdio: "ignore" });
        resolve();
      } catch {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server did not start within ${timeoutMs}ms`));
        } else {
          setTimeout(check, 500);
        }
      }
    };
    check();
  });
}

function runLighthouse(lhBin, targetUrl, outputPath, extraArgs = []) {
  const args = [
    targetUrl,
    "--output=json",
    `--output-path=${outputPath}`,
    "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance,accessibility,best-practices,seo",
    "--quiet",
    ...extraArgs,
  ];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      execFileSync(lhBin, args, { cwd: ROOT, stdio: "pipe" });
      const report = JSON.parse(readFileSync(outputPath, "utf-8"));
      if (report.categories?.performance?.score === null) {
        throw new Error("Performance score is null (likely NO_LCP trace error)");
      }
      return;
    } catch {
      if (attempt < MAX_RETRIES) {
        console.log(`  Attempt ${attempt} failed, retrying...`);
      } else {
        execFileSync(lhBin, args, { cwd: ROOT, stdio: "inherit" });
      }
    }
  }
}

function getScores(report) {
  const cats = report.categories || {};
  return {
    performance: Math.round((cats.performance?.score || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    "best-practices": Math.round((cats["best-practices"]?.score || 0) * 100),
    seo: Math.round((cats.seo?.score || 0) * 100),
  };
}

function getMetrics(report) {
  const a = report.audits || {};
  return {
    lcp: a["largest-contentful-paint"]?.numericValue,
    fcp: a["first-contentful-paint"]?.numericValue,
    tbt: a["total-blocking-time"]?.numericValue,
    cls: a["cumulative-layout-shift"]?.numericValue,
    si: a["speed-index"]?.numericValue,
  };
}

function fmtMs(n) {
  if (n == null) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${Math.round(n)}ms`;
}

function fmtCls(n) {
  if (n == null) return "—";
  return n.toFixed(3);
}

function fmtDelta(current, previous) {
  if (previous == null) return "";
  const diff = current - previous;
  if (diff === 0) return " (±0)";
  const sign = diff > 0 ? "+" : "";
  return ` (${sign}${diff} vs last)`;
}

function capitalizeKey(key) {
  return key
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

// ── Main ─────────────────────────────────────────────────────────────

let server;

try {
  if (!QUICK) {
    log("Building production bundle...");
    execFileSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });

    log("Starting production server...");
    server = spawn("npm", ["run", "start"], {
      cwd: ROOT,
      stdio: "pipe",
      detached: false,
    });

    await waitForServer(URL);
    log("Server ready.");
  } else {
    log("Quick mode — assuming server is running on :3000");
  }

  const reportDir = resolve(ROOT, ".lighthouse");
  mkdirSync(reportDir, { recursive: true });
  const lhBin = resolve(ROOT, "node_modules/.bin/lighthouse");

  const hardFailures = [];
  const softWarnings = [];
  const summary = [];

  for (const profile of PROFILES_TO_RUN) {
    const reportPath = resolve(reportDir, profile.reportFile);

    // Capture previous scores for delta-awareness BEFORE overwriting the file.
    let previousScores = null;
    if (existsSync(reportPath)) {
      try {
        previousScores = getScores(JSON.parse(readFileSync(reportPath, "utf-8")));
      } catch {
        // Ignore malformed previous report.
      }
    }

    log(`Running Lighthouse audit (${profile.label})...`);
    runLighthouse(lhBin, URL, reportPath, profile.lhArgs);

    const report = JSON.parse(readFileSync(reportPath, "utf-8"));
    const scores = getScores(report);
    const metrics = getMetrics(report);

    console.log(`\n── ${profile.label} [${profile.gate}] ──`);

    for (const [key, score] of Object.entries(scores)) {
      const delta = fmtDelta(score, previousScores?.[key]);
      const threshold = profile.thresholds?.[key];

      if (threshold != null) {
        const pass = score >= threshold;
        // A metric is soft if the whole profile is soft OR it is listed in the
        // profile's per-metric softMetrics override (e.g. performance everywhere).
        const isSoftMetric =
          profile.gate === "soft" || profile.softMetrics?.includes(key);
        const icon = pass ? "  ✓" : isSoftMetric ? "  ⚠" : "  ✗";
        console.log(
          `${icon} ${capitalizeKey(key)}: ${score} (threshold: ${threshold})${delta}`
        );
        if (!pass) {
          const failure = `${profile.label} ${capitalizeKey(key)}: ${score} < ${threshold}`;
          if (isSoftMetric) {
            softWarnings.push(failure);
          } else {
            hardFailures.push(failure);
          }
        }
      } else {
        // No threshold set (soft profile, Stage 2 pending) — report only.
        console.log(`  · ${capitalizeKey(key)}: ${score}${delta}`);
      }
    }

    console.log(
      `    LCP: ${fmtMs(metrics.lcp)} | FCP: ${fmtMs(metrics.fcp)} | ` +
        `TBT: ${fmtMs(metrics.tbt)} | CLS: ${fmtCls(metrics.cls)} | ` +
        `SI: ${fmtMs(metrics.si)}`
    );

    summary.push({ profile: profile.label, gate: profile.gate, scores, metrics });
  }

  if (softWarnings.length > 0) {
    console.log("\n⚠ Soft warnings (reported, not blocking):");
    for (const w of softWarnings) console.log(`   - ${w}`);
  }

  if (hardFailures.length > 0) {
    console.log("\n✗ Lighthouse hard gate FAILED:");
    for (const f of hardFailures) console.log(`   - ${f}`);
    process.exit(1);
  }

  log("All hard gates passed. Ship it.");
  process.exit(0);
} finally {
  if (server) server.kill("SIGTERM");
}
