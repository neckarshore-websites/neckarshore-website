"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  GitCommit,
  FlaskConical,
  Layers,
  Code2,
  FolderGit2,
  CalendarDays,
} from "lucide-react";
import { breakdownLine } from "@/lib/stats-breakdown";

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
  const tests = useAnimatedNumber(stats.testScope?.total ?? stats.tests);
  const endpoints = useAnimatedNumber(stats.endpoints);
  const linesOfCode = useAnimatedNumber(stats.linesOfCode);
  const repos = useAnimatedNumber(stats.repos);

  // e.g. "255 e2e · 296 unit" (A→Z, zero-types hidden); null until a producer publishes byType.
  const testsBreakdown = breakdownLine(stats.testScope?.byType);

  const tiles: {
    icon: ComponentType<{ size?: number; className?: string }>;
    value: string;
    label: string;
    sub?: string | null;
  }[] = [
    { icon: CalendarDays, value: String(devDays), label: "Days since First Commit" },
    { icon: GitCommit, value: formatDE(commits), label: "Commits" },
    {
      icon: FlaskConical,
      value: formatDE(tests),
      label: "Automatisierte Tests",
      sub: testsBreakdown,
    },
    { icon: Layers, value: String(endpoints), label: "REST Endpoints" },
    { icon: Code2, value: formatDE(linesOfCode), label: "Zeilen Code" },
    { icon: FolderGit2, value: String(repos), label: "Repositories" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-surface p-5 text-center">
            <stat.icon size={20} className="mx-auto text-accent" />
            <p className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-text-secondary">{stat.label}</p>
            {/* sub-line only ever set on the Tests tile → the testid is tile-specific */}
            {stat.sub && (
              <p
                data-testid="tests-breakdown"
                className="mt-1 text-[10px] leading-tight text-text-secondary/70"
              >
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>
      {stats.updatedAt && (
        <p className="mt-3 text-right text-[10px] font-mono text-text-secondary/60">
          Stand: {new Date(stats.updatedAt).toLocaleDateString("de-DE")}
        </p>
      )}
    </div>
  );
}
