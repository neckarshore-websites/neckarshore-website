import { displayRows, WITHHELD, type RepoRow } from "@/lib/test-breakdown";
import { repoType, type RepoType } from "@/lib/repo-types";

/**
 * The grouped /test-management table (Founder-approved draft, variant B, 2026-11-14): repositories
 * grouped by category, four level columns (Unit · Integration · End-to-End · Andere), group sums,
 * a grand total.
 *
 * The group is DERIVED at render time, not read from a new data field, so the page groups
 * correctly against the public/estate-test-scope.json already on main (the daily stats run rewrites
 * that file; a PR that changed its shape would conflict every day it waits). Three row shapes:
 *   · a public "owner/name" slug    → repoType(slug)
 *   · a product display name        → the slugs that disclosure-config.json maps to that name,
 *                                      then repoType(); every slug behind one name must share a type
 *                                      (asserted — otherwise a name would be put in a group by guess)
 *   · "privates Repo" (withheld)    → no category at all: a category would narrow a private repo
 *                                      down. These rows are summed into ONE line under "Weitere".
 *
 * Pure and framework-free, unit-tested in tests/unit/test-table.test.ts.
 */

/** The counted levels that get their own column; everything else (smoke, unknown keys, rows
 *  without a split) is "Andere", so the four columns always add up to the row total. */
export const MAIN_LEVELS = ["unit", "integration", "e2e"] as const;
export type MainLevel = (typeof MAIN_LEVELS)[number];
export const LEVEL_NAMES: Record<MainLevel | "andere", string> = {
  unit: "Unit",
  integration: "Integration",
  e2e: "End-to-End",
  andere: "Andere",
};

export interface Cells {
  unit: number;
  integration: number;
  e2e: number;
  andere: number;
  total: number;
}

export interface TableRow extends Cells {
  key: string;
  name: string;
  /** At least one count in this row comes from a hand-audited seed row, not a live producer. */
  seeded: boolean;
  /** The producer reports no split by level, so all four level cells are unknown. */
  unsplit: boolean;
  /** How many repositories this row stands for (> 1 only for the summed private line). */
  repoCount: number;
}

export interface TableGroup {
  id: string;
  label: string;
  open: boolean;
  repoCount: number;
  rows: TableRow[];
  sums: Cells;
}

/** Group order and default state. MMPs and websites are open: they are the public, checkable work. */
const GROUPS: { type: RepoType; id: string; label: string; open: boolean }[] = [
  { type: "MMP", id: "mmp", label: "MMPs", open: true },
  { type: "Webseite", id: "web", label: "Websites", open: true },
  { type: "Produkt", id: "produkt", label: "Produkte", open: false },
  { type: "Plugin/Skill", id: "skill", label: "Skills", open: false },
  { type: "Sonstige", id: "weitere", label: "Weitere", open: false },
];

/** Readable names for PUBLIC repositories whose slug is not what people know them by. Public slugs
 *  are already in the served JSON, so renaming them here discloses nothing. */
const PUBLIC_LABELS: Record<string, string> = {
  "neckarshore-websites/goldoni-website": "Goldoni",
  "neckarshore-websites/grafowerk-website": "Grafowerk",
  "neckarshore-websites/neckarshore-website": "neckarshore.ai",
  "neckarshore-websites/oakwoodgolfclub-website": "Oakwood Golf Club",
  "neckarshore-websites/rauhut-website": "rauhut.com",
};

const emptyCells = (): Cells => ({ unit: 0, integration: 0, e2e: 0, andere: 0, total: 0 });

function cellsOf(r: RepoRow): Cells {
  const t = r.byType ?? {};
  const unit = t.unit ?? 0;
  const integration = t.integration ?? 0;
  const e2e = t.e2e ?? 0;
  return { unit, integration, e2e, andere: r.total - unit - integration - e2e, total: r.total };
}

function add(a: Cells, b: Cells): Cells {
  return {
    unit: a.unit + b.unit,
    integration: a.integration + b.integration,
    e2e: a.e2e + b.e2e,
    andere: a.andere + b.andere,
    total: a.total + b.total,
  };
}

const isSplit = (r: RepoRow): boolean => Object.keys(r.byType ?? {}).length > 0;

/**
 * display name → the one category behind it. Throws when the slugs behind one display name fall
 * into different categories, because the page could then only guess (the build stops instead).
 */
export function typeByDisplayName(overrides: Record<string, string>): Map<string, RepoType> {
  const seen = new Map<string, Set<RepoType>>();
  for (const [slug, name] of Object.entries(overrides)) {
    if (!seen.has(name)) seen.set(name, new Set());
    seen.get(name)!.add(repoType(slug));
  }
  const out = new Map<string, RepoType>();
  for (const [name, types] of seen) {
    if (types.size !== 1) {
      throw new Error(
        `/test-management: display name "${name}" maps to repositories of different categories (${[...types].join(", ")}); refusing to guess its group`,
      );
    }
    out.set(name, [...types][0]);
  }
  return out;
}

/** The category of one served row, or null for a withheld private repository. */
export function rowType(r: RepoRow, byName: Map<string, RepoType>): RepoType | null {
  if (r.repo === WITHHELD) return null;
  if (r.repo.includes("/")) return repoType(r.repo);
  const t = byName.get(r.repo);
  if (!t) {
    throw new Error(
      `/test-management: row "${r.repo}" is neither a slug nor a display name from disclosure-config.json; refusing to guess its group`,
    );
  }
  return t;
}

/** The groups in display order, empty groups left out, rows largest first, the summed private
 *  line last in "Weitere". */
export function tableGroups(rows: RepoRow[], overrides: Record<string, string>): TableGroup[] {
  const byName = typeByDisplayName(overrides);
  // displayRows ranks by size and numbers shared names ("Omnopsis · 1 von 3"); same order here.
  const ranked = [...rows]
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.total - a.r.total || a.i - b.i)
    .map(({ r }) => r);
  const named = displayRows(ranked);

  const buckets = new Map<RepoType, TableRow[]>();
  let priv = null as TableRow | null;

  for (const [idx, r] of ranked.entries()) {
    const d = named[idx];
    const type = rowType(r, byName);
    if (type === null) {
      const c = cellsOf(r);
      priv = priv
        ? { ...priv, ...add(priv, c), seeded: priv.seeded || !!r.seeded, repoCount: priv.repoCount + 1 }
        : { key: "private", name: "", seeded: !!r.seeded, unsplit: false, repoCount: 1, ...c };
      continue;
    }
    const label = r.repo.includes("/") ? (PUBLIC_LABELS[r.repo] ?? d.name) : d.name;
    const row: TableRow = {
      key: d.key,
      name: label,
      seeded: !!r.seeded,
      unsplit: !isSplit(r),
      repoCount: 1,
      ...cellsOf(r),
    };
    if (!buckets.has(type)) buckets.set(type, []);
    buckets.get(type)!.push(row);
  }

  if (priv) {
    const p: TableRow = priv;
    p.name = p.repoCount === 1 ? "1 privates Repository" : `${p.repoCount} private Repositories`;
    if (!buckets.has("Sonstige")) buckets.set("Sonstige", []);
    buckets.get("Sonstige")!.push(p);
  }

  const out: TableGroup[] = [];
  for (const g of GROUPS) {
    const groupRows = buckets.get(g.type);
    if (!groupRows || groupRows.length === 0) continue;
    // A group that holds one product only is named after it ("Omnopsis"), otherwise generically.
    const names = new Set(groupRows.map((r) => r.name.split(" · ")[0]));
    const label = g.type === "Produkt" && names.size === 1 ? [...names][0] : g.label;
    out.push({
      id: g.id,
      label,
      open: g.open,
      repoCount: groupRows.reduce((s, r) => s + r.repoCount, 0),
      rows: groupRows,
      sums: groupRows.reduce((s, r) => add(s, r), emptyCells()),
    });
  }
  return out;
}

/** The grand total row, summed from the groups (the page asserts it equals the headline). */
export function grandTotal(groups: TableGroup[]): Cells {
  return groups.reduce((s, g) => add(s, g.sums), emptyCells());
}

/** What "Andere" is made of, for the note under the level bar. */
export function andereParts(rows: RepoRow[]): { smokeAndOther: number; unsplit: number; unsplitRepos: number } {
  let smokeAndOther = 0;
  let unsplit = 0;
  let unsplitRepos = 0;
  for (const r of rows) {
    if (!isSplit(r)) {
      unsplit += r.total;
      unsplitRepos += 1;
    } else {
      const c = cellsOf(r);
      smokeAndOther += c.andere;
    }
  }
  return { smokeAndOther, unsplit, unsplitRepos };
}
