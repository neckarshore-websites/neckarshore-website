import fs from "node:fs";
import path from "node:path";
import { assertBreakdown, type RepoRow, type ScopeTotals } from "@/lib/test-breakdown";
import { grandTotal, tableGroups } from "@/lib/test-table";

/**
 * The data behind /test-management, and the one place that checks it adds up.
 *
 * Two callers run the same check: the page while it is prerendered (`next build` fails on a
 * wrong sum) and `scripts/check-test-page-data.ts` in update-stats.yml BEFORE the daily commit.
 * The second exists because update-stats commits to main without a build: a broken sum would
 * otherwise land on main and fail every deploy after it (MASCHIN 2026-11-14, point 4).
 */
export interface EstateScope extends ScopeTotals {
  repos: number;
  // `repo` is already disclosure-processed at the source (scripts/withhold-private-repos.sh):
  // "privates Repo" (anonymized), a product display-name (approved-private OR public product), or
  // a raw owner/name slug (public non-product). `private: true` flags a private repo (withheld OR
  // shown by product name) — it is NOT the anonymized signal (the literal "privates Repo" is).
  // The count is always real, whichever shape the name takes.
  per_repo: RepoRow[];
  updatedAt?: string;
}

export function loadEstateScope(root: string = process.cwd()): EstateScope {
  const file = path.join(root, "public", "estate-test-scope.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  return {
    total: raw.total ?? 0,
    repos: raw.repos ?? (Array.isArray(raw.per_repo) ? raw.per_repo.length : 0),
    floor: raw.floor ?? false,
    per_repo: Array.isArray(raw.per_repo) ? raw.per_repo : [],
    byType: raw.byType ?? {},
    untyped_total: raw.untyped_total ?? 0,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
}

/** The homepage tile's source (public/stats.json testScope); the page must agree with it. */
export function loadTileScope(root: string = process.cwd()): ScopeTotals | null {
  const file = path.join(root, "public", "stats.json");
  const scope = JSON.parse(fs.readFileSync(file, "utf-8")).testScope;
  if (!scope) return null;
  return {
    total: scope.total ?? 0,
    byType: scope.byType ?? {},
    untyped_total: scope.untyped_total ?? 0,
    floor: scope.floor ?? false,
  };
}

/**
 * Throws when the parts do not add up, the page and the tile disagree, or the grouped table
 * does not sum to the headline. Returns the groups so the page does not compute them twice.
 */
export function assertTestPageData(
  scope: EstateScope,
  tile: ScopeTotals | null,
  overrides: Record<string, string>,
) {
  assertBreakdown(scope, tile);
  const groups = tableGroups(scope.per_repo, overrides);
  const grand = grandTotal(groups);
  if (grand.total !== scope.total) {
    throw new Error(
      `/test-management: the grouped table sums to ${grand.total}, the headline is ${scope.total}; refusing to render it`,
    );
  }
  return { groups, grand };
}
