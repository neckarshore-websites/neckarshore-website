/**
 * Format a `testScope.byType` map into the Tests-tile breakdown sub-line.
 *
 * Rules:
 * - sorted A→Z by test type (global sorting NFR; the plan's "unit · e2e" is illustrative only),
 * - zero/absent/non-positive types hidden,
 * - counts rendered in de-DE (thousands dot, matching the tile's main numbers),
 * - returns `null` when there is nothing to show, so the caller renders no sub-line at all.
 *
 * Kept pure + framework-free so it is unit-tested in isolation (tests/unit/stats-breakdown.test.ts)
 * — coverage does not depend on the live stats.json having a populated byType yet.
 */
export function breakdownLine(
  byType: Record<string, number> | null | undefined,
): string | null {
  if (!byType) return null;
  const parts = Object.entries(byType)
    .filter(([, n]) => typeof n === "number" && n > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, n]) => `${n.toLocaleString("de-DE")} ${type}`);
  return parts.length ? parts.join(" · ") : null;
}

// flooredTotal (round-down-to-100 display framing, backlog #244) was REMOVED 2026-07-10:
// Founder directive — the tile shows the EXACT audited figure (e.g. "3.391+"), never a rounded
// one; a rounded number reads as pseudo-precision. The load-bearing "+" stays (testScope.floor):
// the exact figure is still a FLOOR of the true estate count.
