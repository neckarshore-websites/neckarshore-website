"use client";

import { useEffect, useRef, useState } from "react";
import {
  GitCommit,
  FlaskConical,
  Layers,
  Code2,
  FolderGit2,
  CalendarDays,
} from "lucide-react";

export interface StatsData {
  days: number;
  commits: number;
  tests: number;
  endpoints: number;
  linesOfCode: number;
  repos: number;
  updatedAt: string;
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
  const tests = useAnimatedNumber(stats.tests);
  const endpoints = useAnimatedNumber(stats.endpoints);
  const linesOfCode = useAnimatedNumber(stats.linesOfCode);
  const repos = useAnimatedNumber(stats.repos);

  const tiles = [
    { icon: CalendarDays, value: String(devDays), label: "Days since First Commit" },
    { icon: GitCommit, value: formatDE(commits), label: "Commits" },
    { icon: FlaskConical, value: formatDE(tests), label: "Automatisierte Tests" },
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
