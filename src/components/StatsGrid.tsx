"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  GitCommit,
  FlaskConical,
  Layers,
  Code2,
  FolderGit2,
  CalendarDays,
} from "lucide-react";
import { flooredTotal } from "@/lib/stats-breakdown";

export interface StatsData {
  days: number;
  commits: number;
  tests: number;
  endpoints: number;
  linesOfCode: number;
  repos: number;
  updatedAt: string;
  /**
   * Decomposed estate test-scope (Charter Artifact 6). Optional for backward-compat: pre-Task-2
   * stats.json files have no testScope, so the tile falls back to the flat `tests` scalar.
   */
  testScope?: {
    total: number;
    byType: Record<string, number>;
    reporting?: number;
    expected?: number;
    missing?: string[];
    /** Estate repo span (count) — drives the tile's "über N Repositories" sub-line (#244). */
    repos?: number;
    /** Floor-framed total: render the headline rounded down to 100 + a load-bearing "+". */
    floor?: boolean;
  };
}

const ANIMATION_DURATION = 1200; // ms
const ANIMATION_STEPS = 30;

function formatDE(n: number): string {
  return n.toLocaleString("de-DE");
}

/** Animates a number from 0 to target on first render */
function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const stepMs = ANIMATION_DURATION / ANIMATION_STEPS;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / ANIMATION_STEPS;
      // ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (step >= ANIMATION_STEPS) clearInterval(interval);
    }, stepMs);

    return () => clearInterval(interval);
  }, [target]);

  return display;
}

export default function StatsGrid({
  stats,
  devDays,
}: {
  stats: StatsData;
  devDays: number;
}) {
  const commits = useAnimatedNumber(stats.commits);
  // Big number = decomposed estate total when present; flat `tests` otherwise (backward-compat).
  // Floor-framed (#244): the public number is rounded down to 100 + a load-bearing "+", so it
  // always under-states the true estate count (two repos are themselves floors). Honest by design.
  const rawTestTotal = stats.testScope?.total ?? stats.tests;
  const testsFloored = stats.testScope?.floor ?? false;
  const tests = useAnimatedNumber(testsFloored ? flooredTotal(rawTestTotal) : rawTestTotal);
  const testsSuffix = testsFloored ? "+" : "";
  const endpoints = useAnimatedNumber(stats.endpoints);
  const linesOfCode = useAnimatedNumber(stats.linesOfCode);
  const repos = useAnimatedNumber(stats.repos);

  // Tests-tile sub-line = the estate repo span ("über 20 Repositories"). NO numeric per-type
  // split: an estate-wide byType breakdown is only partially available (most repos report
  // totals-only), so a numeric split would be incomplete/dishonest. (Charter §7 / brief §4.)
  const testReposLine = stats.testScope?.repos
    ? `über ${stats.testScope.repos} Repositories`
    : null;

  const tiles: {
    icon: ComponentType<{ size?: number; className?: string }>;
    value: string;
    label: string;
    sub?: string | null;
    /** When set, the whole tile is a link (the Tests tile → /tests detail surface, #245). */
    href?: string;
  }[] = [
    { icon: CalendarDays, value: String(devDays), label: "Days since First Commit" },
    { icon: GitCommit, value: formatDE(commits), label: "Commits" },
    {
      icon: FlaskConical,
      value: formatDE(tests) + testsSuffix,
      label: "Automatisierte Tests",
      sub: testReposLine,
      href: "/tests",
    },
    { icon: Layers, value: String(endpoints), label: "REST Endpoints" },
    { icon: Code2, value: formatDE(linesOfCode), label: "Zeilen Code" },
    { icon: FolderGit2, value: String(repos), label: "Repositories" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((stat) => {
          const inner = (
            <>
              <stat.icon size={20} className="mx-auto text-accent" />
              <p className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-text-secondary">{stat.label}</p>
              {/* sub-line only ever set on the Tests tile → the testid is tile-specific */}
              {stat.sub && (
                <p
                  data-testid="tests-subline"
                  className="mt-1 text-[10px] leading-tight text-text-secondary/70"
                >
                  {stat.sub}
                </p>
              )}
            </>
          );
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              data-track="stats_tests_detail"
              className="rounded-xl bg-surface p-5 text-center transition-all duration-150 hover:bg-surface/80 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {inner}
            </Link>
          ) : (
            <div key={stat.label} className="rounded-xl bg-surface p-5 text-center">
              {inner}
            </div>
          );
        })}
      </div>
      {stats.updatedAt && (
        <p className="mt-3 text-right text-[10px] font-mono text-text-secondary/60">
          Stand: {new Date(stats.updatedAt).toLocaleDateString("de-DE")}
        </p>
      )}
    </div>
  );
}
