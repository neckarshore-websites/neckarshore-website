import { repoType, type RepoType } from "@/lib/repo-types";

/**
 * Pure helpers for the /test-management breakdown (neckarshore-website #370): tests per
 * repository and per test level, and the per-level totals.
 *
 * Kept framework-free so it is unit-tested in isolation (tests/unit/test-breakdown.test.ts).
 * The page calls `assertBreakdown` while it is prerendered, so a set of numbers that does not
 * add up stops `next build` instead of reaching the public page (Founder order, #370).
 */

/** One per_repo row of public/estate-test-scope.json, already disclosure-processed at the source. */
export interface RepoRow {
  repo: string;
  total: number;
  byType?: Record<string, number>;
  private?: boolean;
}

/** The fields the page and the homepage tile both read; they must agree. */
export interface ScopeTotals {
  total: number;
  byType: Record<string, number>;
  untyped_total: number;
  floor: boolean;
}

/** The runner-counted test levels, smallest scope first. Unknown keys from the data follow A→Z. */
export const LEVEL_LABELS: Record<string, string> = {
  unit: "Unit",
  integration: "Integration",
  e2e: "End-to-End",
  smoke: "Smoke",
};
const LEVEL_ORDER = Object.keys(LEVEL_LABELS);

/** The literal the withholding script writes for an anonymized private repository. */
export const WITHHELD = "privates Repo";

export interface LevelColumn {
  key: string;
  label: string;
}

const sum = (parts: Record<string, number> | undefined): number =>
  Object.values(parts ?? {}).reduce((s, n) => s + n, 0);

const isSplit = (r: RepoRow): boolean => Object.keys(r.byType ?? {}).length > 0;

/**
 * The level columns: the four known levels always, then every other key that appears in the
 * totals or in any row, A→Z, labelled by its raw key. A new key from a producer therefore gets
 * a column instead of silently dropping out of the table.
 */
export function levelColumns(byType: Record<string, number>, rows: RepoRow[]): LevelColumn[] {
  const seen = new Set<string>(Object.keys(byType));
  for (const r of rows) for (const k of Object.keys(r.byType ?? {})) seen.add(k);
  const unknown = [...seen]
    .filter((k) => !LEVEL_ORDER.includes(k))
    .sort((a, b) => a.localeCompare(b));
  return [...LEVEL_ORDER, ...unknown].map((key) => ({ key, label: LEVEL_LABELS[key] ?? key }));
}

/**
 * Every way the breakdown could contradict itself or the homepage tile. Returns the problems
 * instead of throwing so the unit test can name each one; `assertBreakdown` throws on any.
 */
export function breakdownProblems(
  estate: ScopeTotals & { per_repo: RepoRow[] },
  tile: ScopeTotals | null | undefined,
): string[] {
  const problems: string[] = [];

  // 1. The parts sum to the headline. An applied audited_floor makes the headline larger than
  //    the parts by construction; that case fails here on purpose, so a person decides how the
  //    page shows it instead of the page printing a sum that does not add up.
  const typed = sum(estate.byType);
  if (typed + estate.untyped_total !== estate.total) {
    problems.push(
      `levels ${typed} + ohne Zuordnung ${estate.untyped_total} = ${typed + estate.untyped_total}, headline is ${estate.total}`,
    );
  }

  // 2. Every split row adds up to its own total.
  for (const r of estate.per_repo) {
    if (isSplit(r) && sum(r.byType) !== r.total) {
      problems.push(`a row (${r.repo}) splits into ${sum(r.byType)}, its total is ${r.total}`);
    }
  }

  // 3. "ohne Zuordnung" is exactly the rows without a split.
  const unsplit = estate.per_repo.filter((r) => !isSplit(r)).reduce((s, r) => s + r.total, 0);
  if (unsplit !== estate.untyped_total) {
    problems.push(`rows without a split hold ${unsplit}, ohne Zuordnung says ${estate.untyped_total}`);
  }

  // 4. Each level column of the table sums to that level's total.
  for (const { key } of levelColumns(estate.byType, estate.per_repo)) {
    const column = estate.per_repo.reduce((s, r) => s + (r.byType?.[key] ?? 0), 0);
    const declared = estate.byType[key] ?? 0;
    if (column !== declared) problems.push(`column ${key} sums to ${column}, total says ${declared}`);
  }

  // 5. Same numbers as the homepage tile (public/stats.json testScope).
  if (!tile) {
    problems.push("public/stats.json has no testScope, so the tile and the page cannot be compared");
  } else {
    if (tile.total !== estate.total) problems.push(`tile total ${tile.total} != page total ${estate.total}`);
    if (tile.floor !== estate.floor) problems.push(`tile floor ${tile.floor} != page floor ${estate.floor}`);
    if (tile.untyped_total !== estate.untyped_total) {
      problems.push(`tile untyped_total ${tile.untyped_total} != page ${estate.untyped_total}`);
    }
    const keys = new Set([...Object.keys(tile.byType ?? {}), ...Object.keys(estate.byType)]);
    for (const k of keys) {
      if ((tile.byType?.[k] ?? 0) !== (estate.byType[k] ?? 0)) {
        problems.push(`tile ${k} ${tile.byType?.[k] ?? 0} != page ${k} ${estate.byType[k] ?? 0}`);
      }
    }
  }

  return problems;
}

export function assertBreakdown(
  estate: ScopeTotals & { per_repo: RepoRow[] },
  tile: ScopeTotals | null | undefined,
): void {
  const problems = breakdownProblems(estate, tile);
  if (problems.length > 0) {
    throw new Error(
      `/test-management: the test breakdown does not add up, refusing to render it:\n- ${problems.join("\n- ")}`,
    );
  }
}

export interface DisplayRow {
  key: string;
  name: string;
  type: RepoType | null;
  withheld: boolean;
  total: number;
  /** null = the producer reports no split by level ("nicht aufgeteilt"). */
  split: Record<string, number> | null;
}

/**
 * The table rows, largest first, in the three disclosure shapes the source produces:
 *   · withheld — the literal "privates Repo": no name, no type.
 *   · product  — a display name without "/": shown as is, type "—" (the slug is gone, so the
 *                type is not guessed).
 *   · slug     — a public "owner/name": its last segment, type from repoType().
 * Rows that share a display name (three repositories are all "Omnopsis") get "· k von n" by
 * size, which tells them apart without revealing which repository is which.
 */
export function displayRows(rows: RepoRow[]): DisplayRow[] {
  const ranked = rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.total - a.r.total || a.i - b.i)
    .map(({ r }) => r);

  const baseName = (r: RepoRow): string =>
    r.repo === WITHHELD ? WITHHELD : r.repo.includes("/") ? r.repo.split("/").pop()! : r.repo;

  const counts = new Map<string, number>();
  for (const r of ranked) {
    if (r.repo === WITHHELD) continue;
    counts.set(baseName(r), (counts.get(baseName(r)) ?? 0) + 1);
  }

  const running = new Map<string, number>();
  return ranked.map((r, rank) => {
    const withheld = r.repo === WITHHELD;
    const base = baseName(r);
    const n = withheld ? 1 : (counts.get(base) ?? 1);
    let name = base;
    if (n > 1) {
      const k = (running.get(base) ?? 0) + 1;
      running.set(base, k);
      // Non-breaking inside "k von n" so a narrow column wraps as "Omnopsis ·" / "1 von 3".
      name = `${base} · ${k}\u00a0von\u00a0${n}`;
    }
    return {
      key: withheld ? `private-${rank}` : `${r.repo}-${rank}`,
      name,
      type: !withheld && r.repo.includes("/") ? repoType(r.repo) : null,
      withheld,
      total: r.total,
      split: isSplit(r) ? { ...r.byType } : null,
    };
  });
}

/** How many rows carry no split — the repositories behind "ohne Zuordnung". */
export function unsplitCount(rows: RepoRow[]): number {
  return rows.filter((r) => !isSplit(r)).length;
}
