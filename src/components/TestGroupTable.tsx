"use client";

import { useState } from "react";
import type { Cells, TableGroup } from "@/lib/test-table";

/**
 * The grouped per-repository table on /test-management (Founder-approved draft, variant B).
 *
 * A client component only for the open/closed state of the groups. It is prerendered like the
 * rest of the page, and collapsed rows are rendered with `hidden` rather than left out, so every
 * row is in the HTML for readers without JavaScript and for crawlers.
 *
 * Below 640 px the four level columns are hidden and each row shows its levels as one line under
 * its name, so the whole table fits a phone without sideways scrolling.
 */

const fmt = (n: number) => n.toLocaleString("de-DE");

const CELL = "px-3 py-2.5 text-right tabular-nums md:px-4";
const LEVEL_CELL = `${CELL} max-sm:hidden`;
const LINE = "border-t border-primary/10 dark:border-text-secondary/10";

function LevelCells({ c, zeroMuted = true }: { c: Cells; zeroMuted?: boolean }) {
  return (
    <>
      {[c.unit, c.integration, c.e2e, c.andere].map((n, i) => (
        <td
          key={i}
          className={`${LEVEL_CELL} ${
            zeroMuted && n === 0 ? "text-muted dark:text-text-tertiary" : ""
          }`}
        >
          {fmt(n)}
        </td>
      ))}
    </>
  );
}

function inlineLevels(c: Cells, unsplit: boolean): string {
  if (unsplit) return "nicht nach Stufe aufgeteilt";
  const parts: string[] = [];
  if (c.unit) parts.push(`Unit ${fmt(c.unit)}`);
  if (c.integration) parts.push(`Integration ${fmt(c.integration)}`);
  if (c.e2e) parts.push(`E2E ${fmt(c.e2e)}`);
  if (c.andere) parts.push(`Andere ${fmt(c.andere)}`);
  return parts.join(" · ");
}

function Chevron() {
  return (
    <svg
      className="h-4 w-4 flex-none text-muted transition-transform group-aria-[expanded=false]:-rotate-90 motion-reduce:transition-none dark:text-text-tertiary"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TestGroupTable({
  groups,
  total,
  totalLabel,
}: {
  groups: TableGroup[];
  total: Cells;
  /** The headline figure as printed above the table, including its "+" when it is a floor. */
  totalLabel: string;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, g.open])),
  );

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-primary/10 bg-white dark:border-text-secondary/10 dark:bg-surface">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Tests pro Repository, gruppiert, nach Teststufe</caption>
        <thead>
          <tr className="font-heading text-xs uppercase tracking-wider text-muted dark:text-text-secondary">
            <th scope="col" className="px-3 py-2.5 font-semibold md:px-4">
              Repository
            </th>
            {["Unit", "Integration", "End-to-End", "Andere"].map((h) => (
              <th key={h} scope="col" className={`${LEVEL_CELL} font-semibold`}>
                {h}
              </th>
            ))}
            <th scope="col" className={`${CELL} font-semibold`}>
              Gesamt
            </th>
          </tr>
        </thead>
        {groups.map((g) => {
          const isOpen = open[g.id];
          return (
            <tbody key={g.id} data-test-group={g.id}>
              <tr
                className={`${LINE} bg-neutral-light font-semibold text-primary dark:bg-deep-space/60 dark:text-text-primary`}
              >
                <th scope="row" className="px-3 py-2.5 md:px-4">
                  <button
                    type="button"
                    className="group -my-2 inline-flex min-h-[44px] items-center gap-2 text-left font-semibold focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:focus-visible:outline-accent-bright"
                    aria-expanded={isOpen}
                    onClick={() => setOpen((s) => ({ ...s, [g.id]: !s[g.id] }))}
                    data-track="testmgmt_group_toggle"
                  >
                    <Chevron />
                    <span>
                      {g.label}{" "}
                      <span className="font-normal text-muted dark:text-text-tertiary">
                        {g.repoCount} {g.repoCount === 1 ? "Repository" : "Repositories"}
                      </span>
                    </span>
                  </button>
                </th>
                <LevelCells c={g.sums} zeroMuted={false} />
                <td className={`${CELL} text-accent dark:text-accent-bright`}>{fmt(g.sums.total)}</td>
              </tr>
              {g.rows.map((r) => (
                <tr
                  key={r.key}
                  className={`${LINE} text-neutral-dark/80 dark:text-text-secondary`}
                  hidden={!isOpen}
                  data-repo-row
                >
                  <th scope="row" className="py-2.5 pr-3 pl-9 font-normal md:pr-4 md:pl-10">
                    {r.name}
                    {r.seeded && (
                      <span className="ml-0.5 font-semibold text-accent dark:text-accent-bright">
                        °<span className="sr-only"> (von Hand gezählt)</span>
                      </span>
                    )}
                    <span className="block text-xs text-muted sm:hidden dark:text-text-tertiary">
                      {inlineLevels(r, r.unsplit)}
                    </span>
                  </th>
                  {r.unsplit ? (
                    <td
                      colSpan={4}
                      className="px-3 py-2.5 text-center italic text-muted max-sm:hidden md:px-4 dark:text-text-tertiary"
                      data-unsplit
                    >
                      nicht nach Stufe aufgeteilt
                    </td>
                  ) : (
                    <LevelCells c={r} />
                  )}
                  <td className={`${CELL} font-medium text-primary dark:text-text-primary`}>
                    {fmt(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          );
        })}
        <tfoot>
          <tr className="border-t-2 border-primary/40 font-bold text-primary dark:border-text-secondary/40 dark:text-text-primary">
            <th scope="row" className="px-3 py-3 md:px-4">
              Summe
            </th>
            <LevelCells c={total} zeroMuted={false} />
            <td className={`${CELL} text-accent dark:text-accent-bright`} data-grand-total>
              {totalLabel}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
