# Shared Site-Quality Toolkit (SP2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@neckarshore-websites/site-quality` — one shared package that is the single source of truth for Lighthouse measurement across all four ecosystem sites — and adopt it on neckarshore.ai first.

**Architecture:** A standalone npm package (sibling dir, later a repo in the `neckarshore-websites` org) extracts the canonical Lighthouse runner out of the current per-site `scripts/lighthouse.mjs` copies. The gate-evaluation logic is split into a **pure function** (`lib/gate.mjs`) so it can be TDD'd with fast `node:test` unit tests with no Chrome spawn; the Chrome-spawning I/O (`lib/lighthouse.mjs`) gets one slow integration smoke during adoption. Three corrected profiles (Desktop · Mobile-5G · Mobile-4G) with **performance soft / accessibility+best-practices+SEO hard** gate semantics. Per-site footprint stays tiny: a `site-quality.config.json`, a ~3-line workflow, and one exact-version devDependency.

**Tech Stack:** Node ≥20 (ESM `.mjs`), `lighthouse` 13.0.3 (exact), `node:test` + `node:assert` for unit tests (zero extra deps), GitHub Packages for publishing.

---

## Source Spec

`docs/superpowers/specs/2026-06-02-shared-site-quality-architecture-design.md` §4 (SP2 only). GO: `omnopsis-planning/docs/plans/2026-06-02-linus-site-quality-toolkit-go.md`.

**This plan is SP2 only.** SP1 (org repo-migration) and SP3 (GEO layer, `lib/geo.mjs` + the six readiness proxies) are explicitly out of scope.

## File Structure

### New package — `~/Developer/projects/neckarshore-ai/site-quality/`

| # | File | Responsibility |
|---|------|----------------|
| 1 | `package.json` | Package manifest — name, bin, exports, exact `lighthouse` dep, `node:test` script, `publishConfig` |
| 2 | `defaults.mjs` | Canonical `PROFILES` (3), `HARD_CATEGORIES`, `HARD_THRESHOLD`, per-profile `perfWarningLine` |
| 3 | `lib/gate.mjs` | **PURE** gate logic — `evaluateProfile(scores, profile)` + `aggregate(results)` → `{ hardFailures, softWarnings, exitCode }`. No I/O. |
| 4 | `lib/lighthouse.mjs` | I/O — `runLighthouse()` (Chrome spawn + retry), `getScores()`, `getMetrics()`, `waitForServer()` |
| 5 | `lib/config.mjs` | `loadConfig(path)` — read `site-quality.config.json`, merge over `defaults.mjs`, resolve selected profiles + threshold/warning overrides |
| 6 | `lib/run.mjs` | CLI entry (`bin`) — read config, optional `--serve` orchestration, loop URLs × profiles, call lighthouse + gate, print, exit with `aggregate().exitCode` |
| 7 | `test/gate.test.mjs` | Fast unit tests for `lib/gate.mjs` |
| 8 | `test/defaults.test.mjs` | Fast unit tests asserting profile shape (regression guard: no `mobile-slow`/`edge-5g`; CPU equal across mobile; 5G network > 4G) |
| 9 | `test/config.test.mjs` | Fast unit tests for `loadConfig` merge/override behavior |
| 10 | `README.md` | Usage, config schema, gate semantics, SP3 seam note |
| 11 | `.gitignore` | `node_modules/`, `.lighthouse/`, `*.tgz` |

### neckarshore-website (first adopter)

| # | File | Change |
|---|------|--------|
| 12 | `site-quality.config.json` | Create — URLs/paths, profiles, overrides |
| 13 | `package.json` | Add devDependency (file: → registry), replace `lighthouse:*` scripts with `site-quality*` |
| 14 | `.npmrc` | Create — scope registry + auth token ref (for published consumption) |
| 15 | `.github/workflows/site-quality.yml` | Rename from `lighthouse.yml`; build → start → wait → `npx site-quality` |
| 16 | `scripts/lighthouse.mjs` | Delete after the package run is verified equivalent |

---

## Phases (sequenced — advisor-confirmed 2026-06-02)

1. **Phase 1 — Build package locally (TDD).** No registry, no auth. Fully unblocked today.
2. **Phase 2 — Local adoption + end-to-end smoke on neckarshore.ai** via `file:` dependency. Proves the package works against the real built site. Still no publish, no auth.
3. **Phase 3 — Publish v0.1.0 + switch neckarshore to the registry version + green CI.** Requires GitHub Packages auth (see Risk R1 — verify before executing this phase only).
4. **Phase 4 — Rollout to the remaining three sites** (templated, per-site config). Documented; executed after neckarshore proves green.

---

# Phase 1 — Build the package

### Task 1: Scaffold the package

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/site-quality/package.json`
- Create: `~/Developer/projects/neckarshore-ai/site-quality/.gitignore`

- [ ] **Step 1: Create the package directory and init git**

```bash
mkdir -p ~/Developer/projects/neckarshore-ai/site-quality/lib ~/Developer/projects/neckarshore-ai/site-quality/test
cd ~/Developer/projects/neckarshore-ai/site-quality && git init -q && echo "init"
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "@neckarshore-websites/site-quality",
  "version": "0.1.0",
  "description": "Shared Lighthouse quality gate for neckarshore-ecosystem websites.",
  "type": "module",
  "bin": { "site-quality": "lib/run.mjs" },
  "exports": {
    ".": "./lib/run.mjs",
    "./defaults": "./defaults.mjs",
    "./gate": "./lib/gate.mjs",
    "./config": "./lib/config.mjs"
  },
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "node --test test/"
  },
  "dependencies": {
    "lighthouse": "13.0.3"
  },
  "files": ["lib/", "defaults.mjs", "README.md"],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/neckarshore-websites/site-quality.git"
  },
  "license": "UNLICENSED"
}
```

- [ ] **Step 3: Write `.gitignore`**

```
node_modules/
.lighthouse/
*.tgz
```

- [ ] **Step 4: Install dependencies**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && npm install --save-exact`
Expected: `lighthouse@13.0.3` installed, `package-lock.json` created, no errors.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && git add -A && git commit -m "chore: scaffold @neckarshore-websites/site-quality package"
```

---

### Task 2: `defaults.mjs` — canonical profiles + gate constants

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/site-quality/defaults.mjs`
- Test: `~/Developer/projects/neckarshore-ai/site-quality/test/defaults.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
// test/defaults.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PROFILES,
  HARD_CATEGORIES,
  HARD_THRESHOLD,
} from "../defaults.mjs";

test("exactly three profiles with the corrected names", () => {
  const names = PROFILES.map((p) => p.name).sort();
  assert.deepEqual(names, ["desktop", "mobile-4g", "mobile-5g"]);
});

test("the mislabeled slow profile is gone (regression guard)", () => {
  const names = PROFILES.map((p) => p.name);
  assert.ok(!names.includes("mobile-slow"));
  assert.ok(!names.includes("edge-5g"));
});

test("both mobile profiles share CPU 4x — only the network differs", () => {
  const m5 = PROFILES.find((p) => p.name === "mobile-5g");
  const m4 = PROFILES.find((p) => p.name === "mobile-4g");
  const cpuOf = (p) =>
    p.lhArgs.find((a) => a.startsWith("--throttling.cpuSlowdownMultiplier="));
  assert.equal(cpuOf(m5), "--throttling.cpuSlowdownMultiplier=4");
  assert.equal(cpuOf(m4), "--throttling.cpuSlowdownMultiplier=4");
});

test("5G network is faster than 4G (throughput + lower RTT)", () => {
  const tp = (name) => {
    const p = PROFILES.find((x) => x.name === name);
    const a = p.lhArgs.find((x) => x.startsWith("--throttling.throughputKbps="));
    return Number(a.split("=")[1]);
  };
  const rtt = (name) => {
    const p = PROFILES.find((x) => x.name === name);
    const a = p.lhArgs.find((x) => x.startsWith("--throttling.rttMs="));
    return Number(a.split("=")[1]);
  };
  assert.ok(tp("mobile-5g") > tp("mobile-4g"));
  assert.ok(rtt("mobile-5g") < rtt("mobile-4g"));
});

test("hard categories exclude performance (performance is soft)", () => {
  assert.deepEqual([...HARD_CATEGORIES].sort(), [
    "accessibility",
    "best-practices",
    "seo",
  ]);
  assert.ok(!HARD_CATEGORIES.includes("performance"));
  assert.equal(HARD_THRESHOLD, 95);
});

test("every profile carries a numeric perfWarningLine", () => {
  for (const p of PROFILES) {
    assert.equal(typeof p.perfWarningLine, "number");
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && node --test test/defaults.test.mjs`
Expected: FAIL — `Cannot find module '../defaults.mjs'`.

- [ ] **Step 3: Write `defaults.mjs`**

```javascript
// defaults.mjs
//
// Canonical, single-source-of-truth measurement config for all four sites.
//
// Gate semantics (spec §4.4):
//   - accessibility / best-practices / seo  → HARD  (deterministic; below threshold ⇒ exit 1)
//   - performance                           → SOFT  (runner-variance-prone; warns, never blocks)
//
// Profiles (spec §4.3):
//   - Both mobile profiles use CPU 4×; ONLY the network throttle differs, so the
//     measured 5G→4G delta is a pure network signal, uncontaminated by CPU effects.
//   - Lighthouse has no native 5G preset — Mobile-5G is an explicit fast-network mobile
//     profile (low RTT, high throughput). The old 400 Kbps / 6× "Edge-5G" is DELETED;
//     sub-4G is out of scope (unserviceable audience).

export const HARD_CATEGORIES = ["accessibility", "best-practices", "seo"];
export const HARD_THRESHOLD = 95;

// Categories Lighthouse must compute. Performance included so the soft warning line works.
export const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const MOBILE_BASE = ["--form-factor=mobile", "--screenEmulation.mobile"];

export const PROFILES = [
  {
    name: "desktop",
    label: "Desktop",
    lhArgs: ["--preset=desktop"],
    // Advisory floor. Real Desktop scores ~87–95; ~19pp runner spread (spec §4.4).
    // Soft gate ⇒ no n≥3 lock required; tune from data, never blocks.
    perfWarningLine: 75,
  },
  {
    name: "mobile-5g",
    label: "Mobile — 5G",
    lhArgs: [
      ...MOBILE_BASE,
      "--throttling-method=simulate",
      "--throttling.rttMs=20",
      "--throttling.throughputKbps=51200", // ~50 Mbps — conservative representative 5G
      "--throttling.cpuSlowdownMultiplier=4",
    ],
    perfWarningLine: 80,
  },
  {
    name: "mobile-4g",
    label: "Mobile — 4G",
    lhArgs: [
      ...MOBILE_BASE,
      "--throttling-method=simulate",
      "--throttling.rttMs=150",
      "--throttling.throughputKbps=1638", // ~1.6 Mbps — Lighthouse Slow-4G default
      "--throttling.cpuSlowdownMultiplier=4",
    ],
    perfWarningLine: 70,
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && node --test test/defaults.test.mjs`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && git add defaults.mjs test/defaults.test.mjs && git commit -m "feat: canonical 3-profile defaults with soft-perf gate semantics"
```

---

### Task 3: `lib/gate.mjs` — pure gate logic

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/site-quality/lib/gate.mjs`
- Test: `~/Developer/projects/neckarshore-ai/site-quality/test/gate.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
// test/gate.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateProfile, aggregate } from "../lib/gate.mjs";

const profile = {
  name: "desktop",
  label: "Desktop",
  perfWarningLine: 75,
};

const allGood = {
  performance: 92,
  accessibility: 100,
  "best-practices": 100,
  seo: 100,
};

test("all scores good → no failures, no warnings", () => {
  const r = evaluateProfile(allGood, profile);
  assert.deepEqual(r.hardFailures, []);
  assert.deepEqual(r.softWarnings, []);
});

test("accessibility below 95 → hard failure", () => {
  const r = evaluateProfile({ ...allGood, accessibility: 90 }, profile);
  assert.equal(r.hardFailures.length, 1);
  assert.match(r.hardFailures[0], /Desktop.*Accessibility.*90.*95/);
  assert.deepEqual(r.softWarnings, []);
});

test("best-practices and seo below 95 → two hard failures", () => {
  const r = evaluateProfile(
    { ...allGood, "best-practices": 80, seo: 70 },
    profile
  );
  assert.equal(r.hardFailures.length, 2);
});

test("performance below warning line → soft warning, NOT a hard failure", () => {
  const r = evaluateProfile({ ...allGood, performance: 60 }, profile);
  assert.deepEqual(r.hardFailures, []);
  assert.equal(r.softWarnings.length, 1);
  assert.match(r.softWarnings[0], /Desktop.*Performance.*60.*75/);
});

test("performance at or above warning line → no warning", () => {
  const r = evaluateProfile({ ...allGood, performance: 75 }, profile);
  assert.deepEqual(r.softWarnings, []);
});

test("aggregate: any hard failure → exitCode 1", () => {
  const a = evaluateProfile({ ...allGood, seo: 50 }, profile);
  const b = evaluateProfile(allGood, profile);
  const agg = aggregate([a, b]);
  assert.equal(agg.exitCode, 1);
  assert.equal(agg.hardFailures.length, 1);
});

test("aggregate: only soft warnings → exitCode 0", () => {
  const a = evaluateProfile({ ...allGood, performance: 40 }, profile);
  const agg = aggregate([a]);
  assert.equal(agg.exitCode, 0);
  assert.equal(agg.softWarnings.length, 1);
  assert.equal(agg.hardFailures.length, 0);
});

test("aggregate: clean → exitCode 0", () => {
  const agg = aggregate([evaluateProfile(allGood, profile)]);
  assert.equal(agg.exitCode, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && node --test test/gate.test.mjs`
Expected: FAIL — `Cannot find module '../lib/gate.mjs'`.

- [ ] **Step 3: Write `lib/gate.mjs`**

```javascript
// lib/gate.mjs
//
// PURE gate logic — no I/O, no Chrome. Given a profile's category scores, decide
// hard failures (block) vs soft warnings (advisory). This is the unit-tested core.

import { HARD_CATEGORIES, HARD_THRESHOLD } from "../defaults.mjs";

function pretty(key) {
  return key
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/**
 * Evaluate one profile's scores.
 * @param {Record<string, number>} scores - { performance, accessibility, "best-practices", seo }
 * @param {{ name: string, label: string, perfWarningLine: number, thresholds?: object }} profile
 * @returns {{ hardFailures: string[], softWarnings: string[] }}
 */
export function evaluateProfile(scores, profile) {
  const hardFailures = [];
  const softWarnings = [];

  // Hard categories — below threshold blocks. Per-profile threshold override allowed.
  for (const cat of HARD_CATEGORIES) {
    const threshold = profile.thresholds?.[cat] ?? HARD_THRESHOLD;
    const score = scores[cat];
    if (typeof score === "number" && score < threshold) {
      hardFailures.push(
        `${profile.label} ${pretty(cat)}: ${score} < ${threshold} (hard)`
      );
    }
  }

  // Performance — soft. Below the warning line warns, never blocks.
  const perf = scores.performance;
  if (typeof perf === "number" && perf < profile.perfWarningLine) {
    softWarnings.push(
      `${profile.label} Performance: ${perf} < ${profile.perfWarningLine} (soft/advisory)`
    );
  }

  return { hardFailures, softWarnings };
}

/**
 * Aggregate per-profile results into a final verdict.
 * @param {Array<{ hardFailures: string[], softWarnings: string[] }>} results
 * @returns {{ hardFailures: string[], softWarnings: string[], exitCode: number }}
 */
export function aggregate(results) {
  const hardFailures = results.flatMap((r) => r.hardFailures);
  const softWarnings = results.flatMap((r) => r.softWarnings);
  return {
    hardFailures,
    softWarnings,
    exitCode: hardFailures.length > 0 ? 1 : 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && node --test test/gate.test.mjs`
Expected: PASS — 8 tests.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && git add lib/gate.mjs test/gate.test.mjs && git commit -m "feat: pure gate logic — hard A11y/BP/SEO, soft performance"
```

---

### Task 4: `lib/config.mjs` — config load + merge

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/site-quality/lib/config.mjs`
- Test: `~/Developer/projects/neckarshore-ai/site-quality/test/config.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
// test/config.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveConfig } from "../lib/config.mjs";

function tmpConfig(obj) {
  const dir = mkdtempSync(join(tmpdir(), "sq-"));
  const p = join(dir, "site-quality.config.json");
  writeFileSync(p, JSON.stringify(obj));
  return p;
}

test("defaults: all three profiles, baseUrl + paths from file", () => {
  const p = tmpConfig({ baseUrl: "http://localhost:3000", paths: ["/"] });
  const cfg = resolveConfig(p);
  assert.equal(cfg.baseUrl, "http://localhost:3000");
  assert.deepEqual(cfg.paths, ["/"]);
  assert.deepEqual(
    cfg.profiles.map((x) => x.name).sort(),
    ["desktop", "mobile-4g", "mobile-5g"]
  );
});

test("profile subset selection by name", () => {
  const p = tmpConfig({
    baseUrl: "http://x",
    paths: ["/"],
    profiles: ["desktop"],
  });
  const cfg = resolveConfig(p);
  assert.deepEqual(cfg.profiles.map((x) => x.name), ["desktop"]);
});

test("threshold override is attached to the matching profile", () => {
  const p = tmpConfig({
    baseUrl: "http://x",
    paths: ["/"],
    thresholdOverrides: { desktop: { seo: 90 } },
  });
  const cfg = resolveConfig(p);
  const d = cfg.profiles.find((x) => x.name === "desktop");
  assert.equal(d.thresholds.seo, 90);
});

test("perf warning override replaces the default line", () => {
  const p = tmpConfig({
    baseUrl: "http://x",
    paths: ["/"],
    perfWarningOverrides: { desktop: 60 },
  });
  const cfg = resolveConfig(p);
  const d = cfg.profiles.find((x) => x.name === "desktop");
  assert.equal(d.perfWarningLine, 60);
});

test("unknown profile name throws a clear error", () => {
  const p = tmpConfig({ baseUrl: "http://x", paths: ["/"], profiles: ["foo"] });
  assert.throws(() => resolveConfig(p), /Unknown profile: foo/);
});

test("missing baseUrl throws", () => {
  const p = tmpConfig({ paths: ["/"] });
  assert.throws(() => resolveConfig(p), /baseUrl/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && node --test test/config.test.mjs`
Expected: FAIL — `Cannot find module '../lib/config.mjs'`.

- [ ] **Step 3: Write `lib/config.mjs`**

```javascript
// lib/config.mjs
//
// Read a site's site-quality.config.json and merge it over canonical defaults.
// The resolved config is a plain object the runner consumes directly.

import { readFileSync } from "node:fs";
import { PROFILES } from "../defaults.mjs";

/**
 * @param {string} configPath - path to site-quality.config.json
 * @returns {{ baseUrl: string, paths: string[], profiles: object[] }}
 */
export function resolveConfig(configPath) {
  const raw = JSON.parse(readFileSync(configPath, "utf-8"));

  if (!raw.baseUrl || typeof raw.baseUrl !== "string") {
    throw new Error("site-quality.config.json: baseUrl (string) is required");
  }
  const paths = Array.isArray(raw.paths) && raw.paths.length ? raw.paths : ["/"];

  // Select profiles (default: all). Validate names against the canonical set.
  const selected = raw.profiles ?? PROFILES.map((p) => p.name);
  const profiles = selected.map((name) => {
    const base = PROFILES.find((p) => p.name === name);
    if (!base) {
      const known = PROFILES.map((p) => p.name).join(", ");
      throw new Error(`Unknown profile: ${name} (known: ${known})`);
    }
    // Clone so overrides never mutate the shared defaults object.
    const profile = { ...base, lhArgs: [...base.lhArgs] };
    const thr = raw.thresholdOverrides?.[name];
    if (thr) profile.thresholds = { ...thr };
    const warn = raw.perfWarningOverrides?.[name];
    if (typeof warn === "number") profile.perfWarningLine = warn;
    return profile;
  });

  return { baseUrl: raw.baseUrl.replace(/\/$/, ""), paths, profiles };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && node --test test/config.test.mjs`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && git add lib/config.mjs test/config.test.mjs && git commit -m "feat: config loader with profile selection + per-profile overrides"
```

---

### Task 5: `lib/lighthouse.mjs` — Chrome-spawning I/O (extracted)

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/site-quality/lib/lighthouse.mjs`

> **Note:** This module is I/O — it spawns Chrome. It is NOT unit-tested (per the pure/I-O split). It is verified by the integration smoke in Phase 2 Task 8. The functions are extracted verbatim-in-spirit from the current `neckarshore-website/scripts/lighthouse.mjs` (lines 111–203), generalized to take an explicit `lhBin` + `cwd`.

- [ ] **Step 1: Write `lib/lighthouse.mjs`** (no test step — see note)

```javascript
// lib/lighthouse.mjs
//
// Chrome-spawning I/O. Extracted from the per-site scripts/lighthouse.mjs and
// generalized. No gate logic lives here (see lib/gate.mjs).

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { CATEGORIES } from "../defaults.mjs";

const MAX_RETRIES = 3;

export function waitForServer(url, timeoutMs = 30_000) {
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

/**
 * Run Lighthouse against targetUrl, writing JSON to outputPath. Retries on
 * NO_LCP / null-performance flakes. Throws if all retries fail.
 */
export function runLighthouse(lhBin, targetUrl, outputPath, extraArgs, cwd) {
  const args = [
    targetUrl,
    "--output=json",
    `--output-path=${outputPath}`,
    "--chrome-flags=--headless=new --no-sandbox",
    `--only-categories=${CATEGORIES.join(",")}`,
    "--quiet",
    ...extraArgs,
  ];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      execFileSync(lhBin, args, { cwd, stdio: "pipe" });
      const report = JSON.parse(readFileSync(outputPath, "utf-8"));
      if (report.categories?.performance?.score === null) {
        throw new Error("Performance score is null (likely NO_LCP trace error)");
      }
      return report;
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.log(`  Attempt ${attempt} failed, retrying...`);
      } else {
        throw err;
      }
    }
  }
}

export function getScores(report) {
  const c = report.categories || {};
  return {
    performance: Math.round((c.performance?.score || 0) * 100),
    accessibility: Math.round((c.accessibility?.score || 0) * 100),
    "best-practices": Math.round((c["best-practices"]?.score || 0) * 100),
    seo: Math.round((c.seo?.score || 0) * 100),
  };
}

export function getMetrics(report) {
  const a = report.audits || {};
  return {
    lcp: a["largest-contentful-paint"]?.numericValue,
    fcp: a["first-contentful-paint"]?.numericValue,
    tbt: a["total-blocking-time"]?.numericValue,
    cls: a["cumulative-layout-shift"]?.numericValue,
    si: a["speed-index"]?.numericValue,
  };
}
```

- [ ] **Step 2: Verify it imports cleanly**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && node -e "import('./lib/lighthouse.mjs').then(m => console.log(Object.keys(m).join(',')))"`
Expected: `waitForServer,runLighthouse,getScores,getMetrics`

- [ ] **Step 3: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && git add lib/lighthouse.mjs && git commit -m "feat: extract Chrome-spawning Lighthouse I/O module"
```

---

### Task 6: `lib/run.mjs` — CLI entry

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/site-quality/lib/run.mjs`

> **Note:** Orchestration glue (config → loop URLs×profiles → gate → print → exit). Verified end-to-end by the Phase 2 smoke. The optional `--serve` block reuses `waitForServer` to preserve one-command local DX; CI does build/start itself and calls without `--serve`.

- [ ] **Step 1: Write `lib/run.mjs`**

```javascript
#!/usr/bin/env node
// lib/run.mjs
//
// CLI entry for @neckarshore-websites/site-quality.
//
// Usage (server already running — the CI path):
//   npx site-quality                 # reads ./site-quality.config.json
//   npx site-quality --config=path/to/config.json
//
// Usage (one-command local — build + serve + audit + stop):
//   npx site-quality --serve         # requires a "serve" block in the config

import { execFileSync, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { resolveConfig } from "./config.mjs";
import {
  waitForServer,
  runLighthouse,
  getScores,
  getMetrics,
} from "./lighthouse.mjs";
import { evaluateProfile, aggregate } from "./gate.mjs";

const require = createRequire(import.meta.url);

function arg(prefix, fallback) {
  const a = process.argv.find((x) => x.startsWith(prefix));
  return a ? a.slice(prefix.length) : fallback;
}

function fmtMs(n) {
  if (n == null) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${Math.round(n)}ms`;
}

const CWD = process.cwd();
const configPath = resolve(CWD, arg("--config=", "site-quality.config.json"));
const SERVE = process.argv.includes("--serve");

const cfg = resolveConfig(configPath);
const reportDir = resolve(CWD, ".lighthouse");
mkdirSync(reportDir, { recursive: true });

// Resolve the lighthouse bin from the package's own dependency tree.
const lhBin = resolve(
  require.resolve("lighthouse/package.json"),
  "..",
  "cli/index.js"
);

let server;
try {
  if (SERVE) {
    const serve = cfg.serve || {};
    if (serve.build) {
      console.log(`\n  Building (${serve.build})...`);
      execFileSync(serve.build.split(" ")[0], serve.build.split(" ").slice(1), {
        cwd: CWD,
        stdio: "inherit",
      });
    }
    if (serve.start) {
      console.log(`  Starting server (${serve.start})...`);
      server = spawn(serve.start.split(" ")[0], serve.start.split(" ").slice(1), {
        cwd: CWD,
        stdio: "pipe",
      });
      await waitForServer(cfg.baseUrl);
      console.log("  Server ready.");
    }
  }

  const results = [];

  for (const path of cfg.paths) {
    const targetUrl = `${cfg.baseUrl}${path}`;
    for (const profile of cfg.profiles) {
      const slug = `${path.replace(/[^a-z0-9]+/gi, "_") || "root"}-${profile.name}`;
      const reportPath = resolve(reportDir, `report-${slug}.json`);

      console.log(`\n── ${targetUrl}  ·  ${profile.label} ──`);
      const report = runLighthouse(
        lhBin,
        targetUrl,
        reportPath,
        profile.lhArgs,
        CWD
      );
      const scores = getScores(report);
      const metrics = getMetrics(report);
      const r = evaluateProfile(scores, profile);
      results.push(r);

      for (const [k, v] of Object.entries(scores)) {
        console.log(`    ${k}: ${v}`);
      }
      console.log(
        `    LCP ${fmtMs(metrics.lcp)} · FCP ${fmtMs(metrics.fcp)} · ` +
          `TBT ${fmtMs(metrics.tbt)} · CLS ${metrics.cls?.toFixed(3) ?? "—"} · ` +
          `SI ${fmtMs(metrics.si)}`
      );
    }
  }

  const verdict = aggregate(results);

  if (verdict.softWarnings.length) {
    console.log("\n⚠ Performance warnings (advisory, non-blocking):");
    for (const w of verdict.softWarnings) console.log(`   - ${w}`);
  }
  if (verdict.hardFailures.length) {
    console.log("\n✗ Hard gate FAILED:");
    for (const f of verdict.hardFailures) console.log(`   - ${f}`);
    process.exit(1);
  }
  console.log("\n✓ All hard gates passed.");
  process.exit(0);
} finally {
  if (server) server.kill("SIGTERM");
}
```

- [ ] **Step 2: Make it executable + verify it parses**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && chmod +x lib/run.mjs && node --check lib/run.mjs && echo "parses ok"`
Expected: `parses ok`

- [ ] **Step 3: Verify error path on missing config (no Chrome spawned)**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && node lib/run.mjs --config=/tmp/does-not-exist.json; echo "exit=$?"`
Expected: throws ENOENT, `exit` non-zero. (Confirms it fails before any audit.)

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && git add lib/run.mjs && git commit -m "feat: CLI runner — config-driven URLs × profiles, optional --serve"
```

---

### Task 7: README + full test run

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/site-quality/README.md`

- [ ] **Step 1: Write `README.md`**

````markdown
# @neckarshore-websites/site-quality

Shared Lighthouse quality gate for the neckarshore-ecosystem websites. Single source of truth — per-site footprint is one config file + a ~3-line workflow + one exact-version devDependency.

## Gate semantics

| Category | Gate | Behavior |
|----------|------|----------|
| accessibility | **hard** | below 95 ⇒ exit 1 |
| best-practices | **hard** | below 95 ⇒ exit 1 |
| seo | **hard** | below 95 ⇒ exit 1 |
| performance | **soft** | below the profile's warning line ⇒ advisory warning, exit unchanged |

Performance is soft because GitHub-Actions shared-CPU runners produce ~19pp (Desktop) / ~11pp (Mobile) score variance. Blocking on it caused repeated false failures; advisory warnings catch real drops without flapping.

## Profiles

| Key | Network | CPU |
|-----|---------|-----|
| `desktop` | LAN (`--preset=desktop`) | 1× |
| `mobile-5g` | ~50 Mbps, RTT 20 ms | 4× |
| `mobile-4g` | ~1.6 Mbps, RTT 150 ms (Slow-4G) | 4× |

Both mobile profiles use CPU 4×; only the network differs, isolating the 5G→4G network signal. Sub-4G is out of scope.

## Config — `site-quality.config.json`

```json
{
  "baseUrl": "http://localhost:3000",
  "paths": ["/"],
  "profiles": ["desktop", "mobile-5g", "mobile-4g"],
  "thresholdOverrides": { "desktop": { "seo": 90 } },
  "perfWarningOverrides": { "mobile-4g": 60 },
  "serve": { "build": "next build", "start": "next start" }
}
```

`profiles`, `thresholdOverrides`, `perfWarningOverrides`, and `serve` are optional. `serve` is only used with `--serve`.

## Usage

```bash
# CI (server already running):
npx @neckarshore-websites/site-quality

# Local one-command (build + serve + audit + stop):
npx @neckarshore-websites/site-quality --serve
```

## SP3 seam

GEO readiness measurement (`lib/geo.mjs` + six proxies) is a separate sub-project (SP3) and is **not** part of this package yet. It will bolt onto this harness in a future v0.2.
````

- [ ] **Step 2: Run the full unit suite**

Run: `cd ~/Developer/projects/neckarshore-ai/site-quality && npm test`
Expected: PASS — 20 tests (6 defaults + 8 gate + 6 config), 0 fail. No Chrome spawned, sub-second.

- [ ] **Step 3: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && git add README.md && git commit -m "docs: package README — gate semantics, profiles, config, SP3 seam"
```

---

# Phase 2 — Local adoption + end-to-end smoke on neckarshore.ai

> Uses a **`file:`** dependency — no registry, no auth. This is the integration smoke the advisor flagged: one real Lighthouse run against the built neckarshore site, proving the extracted I/O + runner work end-to-end.

### Task 8: Wire neckarshore to the local package + run end-to-end

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/neckarshore-website/site-quality.config.json`
- Modify: `~/Developer/projects/neckarshore-ai/neckarshore-website/package.json`

- [ ] **Step 1: Create `site-quality.config.json` in neckarshore-website**

Path parity with today's runner (homepage only — keeps CI time bounded; expand later).

```json
{
  "baseUrl": "http://localhost:3000",
  "paths": ["/"],
  "profiles": ["desktop", "mobile-5g", "mobile-4g"],
  "serve": { "build": "next build", "start": "next start" }
}
```

- [ ] **Step 2: Add the file: devDependency (exact, local-vendor)**

Run:
```bash
cd ~/Developer/projects/neckarshore-ai/neckarshore-website && npm install --save-dev --save-exact "file:../site-quality"
```
Expected: `package.json` devDependencies gains `"@neckarshore-websites/site-quality": "file:../site-quality"`; install succeeds.

- [ ] **Step 3: Run the package end-to-end against a built neckarshore (THE SMOKE)**

Run:
```bash
cd ~/Developer/projects/neckarshore-ai/neckarshore-website && npx site-quality --serve
echo "exit=$?"
```
Expected: builds, starts, audits `/` on all 3 profiles, prints scores + metrics + advisory perf line; `exit=0` (A11y/BP/SEO are 95+ on neckarshore today). This proves the extracted runner matches the old script's behavior.

- [ ] **Step 4: Sanity-check the verdict matches the old script**

Run: `cd ~/Developer/projects/neckarshore-ai/neckarshore-website && npm run lighthouse 2>&1 | tail -20`
Expected: old script also passes hard gates. Confirm the new package's A11y/BP/SEO numbers match the old script's within rounding. (Performance may differ — old `mobile-4g` had no explicit throttle args; new one sets them explicitly. Document any delta in the commit.)

- [ ] **Step 5: Commit (neckarshore-website)**

```bash
cd ~/Developer/projects/neckarshore-ai/neckarshore-website && git checkout -b linus/site-quality-sp2-adopt && git add site-quality.config.json package.json package-lock.json && git commit -m "feat(site-quality): adopt shared toolkit via local file: dep (Phase 2)"
```

---

# Phase 3 — Publish v0.1.0 + switch neckarshore to the registry

> **Risk gate R1 (verify BEFORE this phase only):** Publishing to `npm.pkg.github.com` under `@neckarshore-websites` needs a token with `packages:write` for the org, and CI consumption needs `packages:read`. Verify the token exists / is obtainable before executing Task 9. If not obtainable today, use the **R1 fallback** (committed tarball) and skip to a later publish. Phases 1–2 are unaffected.

### Task 9: Publish the package to GitHub Packages

**Files:**
- Create: `~/Developer/projects/neckarshore-ai/site-quality/.npmrc` (local publish auth — gitignored)

- [ ] **Step 1: Verify auth token (R1 gate)**

Run: `gh auth status && gh api /orgs/neckarshore-websites -q .login`
Expected: authenticated; org login prints. Confirm the token scope includes `write:packages` (`gh auth refresh -s write:packages` if needed).

- [ ] **Step 2: Create the GitHub repo for the package (org exists)**

Run:
```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && gh repo create neckarshore-websites/site-quality --private --source=. --remote=origin --push
```
Expected: repo created, `main` pushed.

- [ ] **Step 3: Publish v0.1.0**

Run:
```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && npm publish
```
Expected: `+ @neckarshore-websites/site-quality@0.1.0` on `npm.pkg.github.com`. (`.npmrc` with `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}` + `@neckarshore-websites:registry=https://npm.pkg.github.com`, token from env — never commit the token.)

- [ ] **Step 4: Tag the release**

```bash
cd ~/Developer/projects/neckarshore-ai/site-quality && git tag v0.1.0 && git push --tags
```

### Task 10: Switch neckarshore from file: to the registry version

**Files:**
- Modify: `~/Developer/projects/neckarshore-ai/neckarshore-website/package.json`
- Create: `~/Developer/projects/neckarshore-ai/neckarshore-website/.npmrc`
- Rename: `.github/workflows/lighthouse.yml` → `.github/workflows/site-quality.yml`
- Delete: `~/Developer/projects/neckarshore-ai/neckarshore-website/scripts/lighthouse.mjs`

- [ ] **Step 1: Add `.npmrc` for scoped registry (read auth in CI via GITHUB_TOKEN)**

```
@neckarshore-websites:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

- [ ] **Step 2: Replace file: dep with exact registry version**

Run:
```bash
cd ~/Developer/projects/neckarshore-ai/neckarshore-website && npm install --save-dev --save-exact @neckarshore-websites/site-quality@0.1.0
```
Expected: devDependency becomes `"@neckarshore-websites/site-quality": "0.1.0"` (no `^`, no `file:`).

- [ ] **Step 3: Replace lighthouse:* scripts in package.json**

Set `scripts` to:
```json
"site-quality": "site-quality",
"site-quality:local": "site-quality --serve"
```
Remove `lighthouse`, `lighthouse:quick`, `lighthouse:desktop`, `lighthouse:mobile`, `lighthouse:slow`.

- [ ] **Step 4: Rewrite the workflow as `site-quality.yml`**

```bash
cd ~/Developer/projects/neckarshore-ai/neckarshore-website && git mv .github/workflows/lighthouse.yml .github/workflows/site-quality.yml
```

Then set its contents (key changes: `NODE_AUTH_TOKEN` env for `npm ci`, invoke `npx site-quality`):

```yaml
name: Site Quality

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 6 * * 1"

jobs:
  site-quality:
    name: Lighthouse (Desktop + Mobile-5G + Mobile-4G)
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: read
      packages: read
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Build production bundle
        run: npm run build
      - name: Start server
        run: npm run start &
      - name: Wait for server
        run: |
          for i in $(seq 1 30); do
            curl -sf http://localhost:3000 > /dev/null 2>&1 && break
            sleep 1
          done
      - name: Run site-quality audit
        run: npx site-quality
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v7
        with:
          name: site-quality-reports
          path: .lighthouse/
          retention-days: 14
          include-hidden-files: true
```

- [ ] **Step 5: Delete the obsolete per-site script**

```bash
cd ~/Developer/projects/neckarshore-ai/neckarshore-website && git rm scripts/lighthouse.mjs
```

- [ ] **Step 6: Re-run end-to-end with the registry version locally**

Run: `cd ~/Developer/projects/neckarshore-ai/neckarshore-website && npm run site-quality:local; echo "exit=$?"`
Expected: same green result as Phase 2, now from the published package. `exit=0`.

- [ ] **Step 7: Run the existing e2e suite (no regressions)**

Run: `cd ~/Developer/projects/neckarshore-ai/neckarshore-website && npm run test:e2e 2>&1 | tail -15`
Expected: 53 tests pass (the change is build-tooling only; e2e unaffected).

- [ ] **Step 8: Commit + push the PR branch**

```bash
cd ~/Developer/projects/neckarshore-ai/neckarshore-website && git add -A && git commit -m "feat(site-quality): switch to published @neckarshore-websites/site-quality@0.1.0, retire scripts/lighthouse.mjs" && git push -u origin linus/site-quality-sp2-adopt
```

- [ ] **Step 9: Open PR and verify CI green (R2)**

```bash
cd ~/Developer/projects/neckarshore-ai/neckarshore-website && gh pr create --fill --base main && gh run watch
```
Expected: `Site Quality` workflow green on the PR. Verify `npm ci` resolved the org package (auth via `GITHUB_TOKEN`). **Do not merge without user approval** (deploy policy / visual acceptance is the user's call).

---

# Phase 4 — Rollout to the remaining three sites (templated)

> Executed after neckarshore proves green. Each site is the same mechanical adoption (Task 10 shape) with per-site config. Listed for completeness; can be its own execution session.

**Adoption order** (lowest-risk first, per spec §7 transfer order):

| # | Site | Repo | Current Lighthouse state | Config `paths` (start) | Notes |
|---|------|------|--------------------------|------------------------|-------|
| 1 | neckarshore.ai | neckarshore-website | active (`scripts/lighthouse.mjs`) | `["/"]` | **done in Phase 2–3** |
| 2 | rauhut.com | rauhut-website | lint-only (no gate) | `["/"]` (+ `/en` if present) | net-new workflow; verify `next build && next start` ports |
| 3 | oakwoodgolfclub.de | oakwoodgolfclub-website | active (own copy) | `["/"]` (+ key SEO routes) | retire its `scripts/lighthouse.mjs`; reconcile its thresholds to defaults |
| 4 | goldoni | goldoni-website | uncertain (spec risk #2 — earlier #80/#81/#82 calibration removed) | `["/"]` | **confirm current state first**; this is where the soft-perf design pays off |

**Per-site template (repeat of Task 10):**
1. Add `.npmrc` (scoped registry + `NODE_AUTH_TOKEN`).
2. `npm install --save-dev --save-exact @neckarshore-websites/site-quality@0.1.0`.
3. Create `site-quality.config.json` (per-site `baseUrl`/`paths`/`serve`).
4. Replace any `lighthouse:*` scripts; delete any per-site `scripts/lighthouse.mjs`.
5. Add/rename `.github/workflows/site-quality.yml`.
6. Local `npm run site-quality:local` green; e2e (if present) green.
7. PR per repo, CI green, user approval to merge.

---

## Risks

| # | Risk | Mitigation |
|---|------|------------|
| R1 | GitHub Packages publish/consume needs `packages:write`/`read` token; may not be available today | Phases 1–2 use `file:` — fully unblocked. Verify token at Phase 3 Task 9 Step 1. **Fallback:** `npm pack` a tarball, commit `vendor/site-quality-0.1.0.tgz`, depend via `file:./vendor/...tgz` (CI-valid, no auth) — throwaway bridge, document and remove once publish works. |
| R2 | New `mobile-5g`/`mobile-4g` explicit throttle args may score differently than the old implicit-default `mobile-4g` | Perf is **soft** — any delta only warns, never blocks. Phase 2 Step 4 documents the delta. |
| R3 | goldoni's current Lighthouse state unknown (spec risk #2) | Phase 4 site #4 starts with a state check before adoption. |
| R4 | CI auditing N paths × 3 profiles can exceed the 10-min timeout | Default config ships `paths: ["/"]` (parity with today). Expand paths deliberately, watching workflow duration. |
| R5 | `lighthouse` bin resolution from the package's own tree | `run.mjs` uses `require.resolve("lighthouse/package.json")` → `cli/index.js`, resolving from the installed package, not the consumer's tree. Verified by the Phase 2 smoke. |

## Self-Review (against spec §4)

| Spec §4 requirement | Covered by |
|---------------------|------------|
| §4.1 package `@neckarshore-websites/site-quality`, single source of truth | Tasks 1–7 |
| §4.1 `lib/lighthouse.mjs`, `lib/run.mjs`, `defaults.mjs` | Tasks 2, 5, 6 |
| §4.1 `lib/geo.mjs` | **SP3 — deliberately omitted** (README SP3-seam note) |
| §4.2 per-site footprint: config + ~3-line workflow + exact devDep | Tasks 8, 10 |
| §4.2 AP-1 update flow (bump version, not replace code) | exact-version dep, Task 10 Step 2 |
| §4.3 three profiles Desktop/Mobile-5G/Mobile-4G | Task 2 + `defaults.test.mjs` |
| §4.3 mobile CPU 4× equal, network-only delta; Edge-5G deleted | Task 2 + regression tests |
| §4.4 exit code reflects only hard-gate failures | `lib/gate.mjs` `aggregate()` + tests |
| §4.4 performance advisory warning line, no n≥3 lock | `defaults.mjs` `perfWarningLine` + soft-warning test |
| §4.5 hard thresholds A11y/BP/SEO = 95 | `HARD_THRESHOLD` + gate tests |
| §8 adopt neckarshore.ai first, then roll | Phases 2–3 (neckarshore), Phase 4 (rest) |
| §9.1 build/test against local vendored dep before publish | Phase 1 (file:) → Phase 3 (publish) |
