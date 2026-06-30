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

/**
 * Floor a test total to the nearest 100 below — the PUBLIC estate count is published as a
 * round, floor-framed number (e.g. `2.611 → 2.600`), never the over-precise figure (backlog
 * #244). Paired with the load-bearing "+" the tile appends when `testScope.floor` is set, so
 * the rendered "2.600+" always under-states the true count: honest by construction, and never
 * above the floor. Totals < 100 are returned truncated (no zeroing of a small real count);
 * non-positive / non-finite → 0.
 */
export function flooredTotal(total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  if (total < 100) return Math.trunc(total);
  return Math.floor(total / 100) * 100;
}
