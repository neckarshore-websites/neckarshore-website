/**
 * Canonical Lighthouse profiles for neckarshore.ai.
 *
 * Pure data module — NO side effects — so it can be imported by both the
 * runner (`lighthouse.mjs`) and the regression test (`lighthouse-profiles.test.mjs`).
 *
 * ── Three profiles (corrected 2026-06-18, German Rauhut directive) ──────────
 *   1. Desktop    — LAN baseline, `--preset=desktop`, 1× CPU
 *   2. Mobile 5G  — fast network (~50 Mbps, RTT 20 ms), 4× CPU
 *   3. Mobile 4G  — Lighthouse Slow-4G default (~1.6 Mbps, RTT 150 ms), 4× CPU
 *
 * Network ordering is now CORRECT: 5G is faster than 4G.
 *
 * The pre-2026-06-18 "Mobile Slow (Edge-5G)" profile (400 Kbps / 6× CPU) is
 * DELETED. 400 Kbps is *slower* than 4G, so the "5G" label inverted reality —
 * a mislabel first flagged 2026-04-10, re-diagnosed in the 2026-06-02
 * site-quality architecture design, and finally corrected here. Sub-4G traffic
 * is out of scope: the target audience (DACH-Mittelstand CTOs) is 5G-default,
 * and we do not gate quality on an unserviceable edge-of-coverage scenario.
 *
 * ── Gate semantics (German Rauhut directive 2026-06-18) ─────────────────────
 *   - performance is SOFT on EVERY profile — an advisory warning line, never a
 *     hard gate. Perf scores track shared-runner CPU jitter (especially the 1×
 *     desktop preset, where a fast static page's composite score swings with
 *     runner TBT noise: observed {70, 86, 93, 98, 100} at LCP <1s / CLS 0.004).
 *     A hard perf gate cried wolf and was admin-bypassed repeatedly. Visibility
 *     is kept (warning + logged LCP/TBT/CLS + run-to-run delta); the auto-block
 *     is dropped. Explicitly: NO hard perf gate on 4G — we do not block on an
 *     old-tech network the audience has moved past.
 *   - accessibility / best-practices / seo are HARD @95 on every profile. These
 *     are deterministic (the site hits 100) — a drop is a real defect, not noise.
 *
 * The per-metric soft override is expressed via `softMetrics`. A metric listed
 * there warns instead of failing the build, even on an otherwise-hard profile.
 *
 * Canonical design source:
 *   docs/superpowers/specs/2026-06-02-shared-site-quality-architecture-design.md §4.3–4.5
 */

// Deterministic categories — hard @95 on every profile.
const HARD_CATEGORIES = {
  accessibility: 95,
  "best-practices": 95,
  seo: 95,
};

// Shared mobile emulation flags (form-factor + screen). Network/CPU differ per profile.
const MOBILE_BASE = ["--form-factor=mobile", "--screenEmulation.mobile"];

export const PROFILES = [
  {
    name: "desktop",
    label: "Desktop",
    gate: "hard", // a11y/bp/seo are hard; performance is soft (see softMetrics)
    softMetrics: ["performance"],
    lhArgs: ["--preset=desktop"],
    thresholds: {
      // Soft warning line — runner-variable, never blocks (see header).
      performance: 80,
      ...HARD_CATEGORIES,
    },
    reportFile: "report-desktop.json",
  },
  {
    name: "mobile-5g",
    label: "Mobile — 5G",
    gate: "hard",
    softMetrics: ["performance"],
    lhArgs: [
      ...MOBILE_BASE,
      "--throttling-method=simulate",
      "--throttling.rttMs=20",
      "--throttling.throughputKbps=51200", // ~50 Mbps — conservative representative 5G
      "--throttling.cpuSlowdownMultiplier=4",
    ],
    thresholds: {
      performance: 90, // soft warning line
      ...HARD_CATEGORIES,
    },
    reportFile: "report-mobile-5g.json",
  },
  {
    name: "mobile-4g",
    label: "Mobile — 4G",
    gate: "hard",
    softMetrics: ["performance"],
    lhArgs: [
      ...MOBILE_BASE,
      "--throttling-method=simulate",
      "--throttling.rttMs=150",
      "--throttling.throughputKbps=1638", // ~1.6 Mbps — Lighthouse Slow-4G default
      "--throttling.cpuSlowdownMultiplier=4",
    ],
    thresholds: {
      performance: 90, // soft warning line — visibility canary, never blocks
      ...HARD_CATEGORIES,
    },
    reportFile: "report-mobile-4g.json",
  },
];
