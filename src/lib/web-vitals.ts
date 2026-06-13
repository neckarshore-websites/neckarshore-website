// ---------------------------------------------------------------------------
// Field Core Web Vitals — pure aggregation helpers (no browser, no Next, no IO)
//
// L-NECK-FIELD-WEBVITALS-SELFHOST. The client (TrackerScript) emits one
// `web_vital` event per metric into the existing /api/track pipeline; the GET
// handler summarizes the stored samples with these helpers. Field CWV uses the
// 75th percentile (p75) — the same statistic Google's CrUX / Search Console
// report — so the lab-vs-field gap that Lighthouse-CI cannot see is closed for
// €0, first-party, cookie-free.
// ---------------------------------------------------------------------------

/** The five standard Web Vitals we collect. FID is deprecated → not tracked. */
export const WEB_VITAL_NAMES = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;

export type WebVitalName = (typeof WEB_VITAL_NAMES)[number];

export type Rating = "good" | "needs-improvement" | "poor";

/**
 * Google's "good" / "poor" boundaries per metric: [goodMax, poorMin].
 * value <= goodMax → good; value <= poorMin → needs-improvement; else → poor.
 * Source: https://web.dev/articles/vitals (thresholds, ms except CLS unitless).
 */
const THRESHOLDS: Record<WebVitalName, readonly [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

export function isWebVitalName(name: unknown): name is WebVitalName {
  return (
    typeof name === "string" &&
    (WEB_VITAL_NAMES as readonly string[]).includes(name)
  );
}

export function ratingFor(name: WebVitalName, value: number): Rating {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

/**
 * Nearest-rank percentile (deterministic, no interpolation).
 * `p` is 0–100. Empty input → 0.
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  const idx = Math.min(Math.max(rank - 1, 0), sorted.length - 1);
  return sorted[idx];
}

/** Round a metric value: CLS to 3 decimals (unitless), the rest to whole ms. */
function roundMetric(name: WebVitalName, value: number): number {
  if (name === "CLS") return Math.round(value * 1000) / 1000;
  return Math.round(value);
}

export interface WebVitalSample {
  metric: string;
  value: number;
}

export interface WebVitalSummaryEntry {
  p75: number;
  count: number;
  rating: Rating;
}

/**
 * Group raw samples by metric and report p75 + sample count + the rating of
 * that p75 value. Unknown metric names and non-finite values are dropped.
 */
export function summarizeWebVitals(
  samples: WebVitalSample[]
): Partial<Record<WebVitalName, WebVitalSummaryEntry>> {
  const byMetric = new Map<WebVitalName, number[]>();

  for (const s of samples) {
    if (!isWebVitalName(s.metric)) continue;
    if (typeof s.value !== "number" || !Number.isFinite(s.value)) continue;
    const arr = byMetric.get(s.metric) ?? [];
    arr.push(s.value);
    byMetric.set(s.metric, arr);
  }

  const out: Partial<Record<WebVitalName, WebVitalSummaryEntry>> = {};
  for (const [metric, values] of byMetric) {
    const p75 = roundMetric(metric, percentile(values, 75));
    out[metric] = { p75, count: values.length, rating: ratingFor(metric, p75) };
  }
  return out;
}
