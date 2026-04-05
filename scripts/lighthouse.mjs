#!/usr/bin/env node

/**
 * Local Lighthouse audit — runs against a prod build on localhost.
 *
 * Usage:
 *   npm run lighthouse          (builds, starts, audits, stops)
 *   npm run lighthouse:quick    (skips build, assumes server is running on :3000)
 *
 * Thresholds (exit 1 if any score is below):
 *   Performance:    85
 *   Accessibility: 95
 *   Best Practices: 95
 *   SEO:           95
 *
 * Performance threshold is 85 (not 95) because Next.js framework JS overhead
 * costs ~12 points that are not optimizable without dropping client interactivity.
 * See 2026-04-03 session report for details.
 */

import { execFileSync, spawn } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const THRESHOLDS = {
  performance: 85,
  accessibility: 95,
  "best-practices": 95,
  seo: 95,
};

const URL = "http://localhost:3000";
const QUICK = process.argv.includes("--quick");
const MAX_RETRIES = 3;

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
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.log(`  Attempt ${attempt} failed, retrying...`);
      } else {
        execFileSync(lhBin, args, { cwd: ROOT, stdio: "inherit" });
      }
    }
  }
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

  log("Running Lighthouse audit (desktop)...");
  const reportDesktop = resolve(reportDir, "report.json");
  runLighthouse(lhBin, URL, reportDesktop, ["--preset=desktop"]);

  log("Running Lighthouse audit (mobile)...");
  const reportMobile = resolve(reportDir, "report-mobile.json");
  runLighthouse(lhBin, URL, reportMobile, [
    "--form-factor=mobile",
    "--screenEmulation.mobile",
  ]);

  const desktopResult = JSON.parse(readFileSync(reportDesktop, "utf-8"));
  const mobileResult = JSON.parse(readFileSync(reportMobile, "utf-8"));
  const failures = [];

  for (const [label, report] of [["Desktop", desktopResult], ["Mobile", mobileResult]]) {
    console.log(`\n── ${label} ──`);
    const cats = report.categories;

    for (const [key, threshold] of Object.entries(THRESHOLDS)) {
      const score = Math.round((cats[key]?.score || 0) * 100);
      const pass = score >= threshold;
      const icon = pass ? "+" : "FAIL";
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      console.log(`  ${icon} ${name}: ${score} (threshold: ${threshold})`);
      if (!pass) failures.push(`${label} ${name}: ${score} < ${threshold}`);
    }
  }

  if (failures.length > 0) {
    console.log("\nLighthouse gate FAILED:");
    for (const f of failures) console.log(`   - ${f}`);
    process.exit(1);
  } else {
    log("All scores above thresholds. Ship it.");
    process.exit(0);
  }
} finally {
  if (server) server.kill("SIGTERM");
}
