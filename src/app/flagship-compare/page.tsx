/**
 * THROWAWAY comparison route — flagship-section reframe (2026-06-17 brainstorm).
 * Renders ORIGINAL / VERSION 1 / VERSION 2 stacked for visual decision.
 * DELETE after the user picks a direction. Not linked from anywhere; noindex.
 */
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import StatsGrid, { type StatsData } from "@/components/StatsGrid";
import { BRAND } from "@/lib/brand";

export const metadata = { robots: { index: false, follow: false } };

function loadStats(): StatsData {
  const statsPath = path.join(process.cwd(), "public", "stats.json");
  try {
    return JSON.parse(fs.readFileSync(statsPath, "utf-8"));
  } catch {
    return { days: 86, commits: 3492, tests: 567, endpoints: 96, linesOfCode: 755779, repos: 31, updatedAt: "" };
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-12 pb-2 md:px-6">
      <span className="inline-block rounded bg-accent px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white">
        {children}
      </span>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-primary px-4 py-16 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-center gap-12 md:grid-cols-2">{children}</div>
      </div>
    </section>
  );
}

export default function FlagshipCompare() {
  const stats = loadStats();
  const devDays = stats.days;

  return (
    <main>
      {/* ===================== ORIGINAL ===================== */}
      <Label>Original — heute live</Label>
      <Shell>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Unser Flaggschiff</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
            {BRAND.PRODUCT_NAME}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-text-secondary">
            KI-first Documentation Engine. Zieht automatisch aus Git, Jira und Confluence — generiert
            Compliance-Doku, technische Doku und rollenbasierte Chatbot-Antworten.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            BYOLLM: Eure Daten verlassen euer Haus nicht.
            <br />
            Fail-closed: lieber schweigen als lügen.
          </p>
          <p className="mt-6 font-mono text-sm text-text-secondary/70">
            Conceived December 11, 2024 in Sindelfingen.
            <br />
            Born March 22, 2026 in Stuttgart.
            <br />
            MVP Q2 2026.
            <br />
            LIVE Q3 2026.
          </p>
        </div>
        <StatsGrid stats={stats} devDays={devDays} />
      </Shell>

      {/* ===================== VERSION 1 — Engine-led ===================== */}
      <Label>Version 1 — Engine-led (die Bauweise ist der Held)</Label>
      <Shell>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Wie wir bauen</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
            Eine Bauweise.
            <br />
            Ein wachsendes Portfolio.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-text-secondary">
            Vom Flagship Omnopsis über fokussierte MMPs bis zu Open-Source-Skills — alles aus einer
            Engine: KI-beschleunigte Entwicklung mit deutscher Datenschutz-Disziplin.
          </p>
          <p className="mt-6 font-mono text-sm text-text-secondary/70">
            BYOLLM · Fail-closed · Hosting in Deutschland · Made in Germany
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-text-primary"
          >
            Alle Produkte ansehen →
          </Link>
        </div>
        <StatsGrid stats={stats} devDays={devDays} />
      </Shell>

      {/* ===================== VERSION 2 — Portfolio-led ===================== */}
      <Label>Version 2 — Portfolio-led (die Breite ist der Held)</Label>
      <Shell>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Unser Portfolio</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
            Ein Flagship. Mehrere Produkte. Eine Bauweise.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-text-secondary">
            Strukturiert gebaut — KI-beschleunigt, DSGVO-by-Design, Made in Germany:
          </p>
          <ul className="mt-6 space-y-3">
            <li>
              <span className="font-heading font-semibold text-text-primary">Omnopsis</span>
              <span className="text-text-secondary"> — Flagship · KI-first Documentation Engine</span>
            </li>
            <li>
              <span className="font-heading font-semibold text-text-primary">ClearPath &amp; MMPs</span>
              <span className="text-text-secondary"> — Produkte mit Marktreife</span>
            </li>
            <li>
              <span className="font-heading font-semibold text-text-primary">Skills</span>
              <span className="text-text-secondary"> — fokussierte Open-Source-Werkzeuge</span>
            </li>
          </ul>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-text-primary"
          >
            Alle Produkte ansehen →
          </Link>
        </div>
        <StatsGrid stats={stats} devDays={devDays} />
      </Shell>

      <div className="bg-primary py-12" />
    </main>
  );
}
