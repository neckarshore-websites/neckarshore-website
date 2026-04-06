"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  GitCommit,
  FlaskConical,
  Layers,
  Code2,
  FolderGit2,
  CalendarDays,
} from "lucide-react";

interface Stats {
  commits: number;
  repos: number;
  linesOfCode: number;
  fetchedAt: string;
}

const FALLBACK: Stats = {
  commits: 780,
  repos: 13,
  linesOfCode: 95000,
  fetchedAt: "",
};

const ANIMATION_DURATION = 1200; // ms
const ANIMATION_STEPS = 30;

function formatDE(n: number): string {
  return n.toLocaleString("de-DE");
}

/** Animates a number from `from` to `to` over ANIMATION_DURATION ms */
function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;

    prevRef.current = to;
    const stepMs = ANIMATION_DURATION / ANIMATION_STEPS;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / ANIMATION_STEPS;
      // ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (step >= ANIMATION_STEPS) clearInterval(interval);
    }, stepMs);

    return () => clearInterval(interval);
  }, [target]);

  return display;
}

function formatTimestamp(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `vor ${diffH} Std.`;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function StatsGrid({ devDays }: { devDays: number }) {
  const [stats, setStats] = useState<Stats>(FALLBACK);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetch("/api/github-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.commits > 0) {
          setStats(data);
          setIsLive(true);
        }
      })
      .catch(() => {});
  }, []);

  const commits = useAnimatedNumber(stats.commits);
  const linesOfCode = useAnimatedNumber(stats.linesOfCode);
  const repos = useAnimatedNumber(stats.repos);

  const tiles = [
    { icon: CalendarDays, value: String(devDays), label: "Days since First Commit" },
    { icon: GitCommit, value: formatDE(commits), label: "Commits" },
    { icon: FlaskConical, value: "454", label: "Automatisierte Tests" },
    { icon: Layers, value: "92", label: "REST Endpoints" },
    { icon: Code2, value: linesOfCode > 0 ? formatDE(linesOfCode) : "—", label: "Zeilen Code" },
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
      {isLive && stats.fetchedAt && (
        <p className="mt-3 text-right text-[10px] font-mono text-text-secondary/40 transition-opacity duration-500">
          Updated {formatTimestamp(stats.fetchedAt)}
        </p>
      )}
    </div>
  );
}
