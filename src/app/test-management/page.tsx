import { OSS_LAUNCH_SICHTBAR } from "@/lib/kontakt-config";
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PageSchema } from "@/components/PageSchema";
import { pageMetadata } from "@/lib/seo";
import { assertBreakdown, type RepoRow, type ScopeTotals } from "@/lib/test-breakdown";
import { andereParts, grandTotal, tableGroups, type Cells } from "@/lib/test-table";
import TestGroupTable from "@/components/TestGroupTable";
import disclosure from "../../../disclosure-config.json";
import { formatDate, getPostsInCategory } from "@/lib/content/blog";
import { categoryPath, postPath } from "@/lib/schema/blog";

const showOssLaunch = OSS_LAUNCH_SICHTBAR;

/**
 * /test-management — "Wie wir testen, und warum die Zahl der Realität entspricht"
 * (backlog #245, UD5 Front-10).
 *
 * The detail surface behind the homepage "Automatisierte Tests" tile: the STORY behind the
 * number (counted by the test runner itself, never grep'd; independently re-checked before
 * published). Copy descends from the #245-brief Appendix-A draft, Rauhut-edited; the numbers
 * are DATA-BOUND to the same single source as the tile (public/estate-test-scope.json) so the
 * page can never contradict its own tile and the count moves with the next Durchstich.
 *
 * Honesty guardrails (brief §4, updated 2026-07-10): the re-check catches are framed as METHOD
 * only (no internal specifics); the headline is the EXACT audited figure + load-bearing "+"
 * (Founder directive 2026-07-10 — supersedes the #244 round-down framing; the exact figure is
 * still a floor, see `audited_floor` in the source JSON).
 *
 * #370 (Founder order 2026-11-14): the per-repo table lists EVERY repository with tests, split by
 * test level, and the levels are totalled. This retires the §5(b) Top-N + rest-rollup, which kept
 * the 0-test scaffold repo and a then-red repo (#257) out of view; the Founder wants all of them.
 * The breakdown is asserted while the page is prerendered (lib/test-breakdown.ts): if the parts do
 * not sum to the headline, or the page and the tile disagree, `next build` fails.
 */

interface EstateScope extends ScopeTotals {
  repos: number;
  // `repo` is already disclosure-processed at the source (scripts/withhold-private-repos.sh):
  // "privates Repo" (anonymized), a product display-name (approved-private OR public product), or
  // a raw owner/name slug (public non-product). `private: true` flags a private repo (withheld OR
  // shown by product name) — it is NOT the anonymized signal (the literal "privates Repo" is).
  // The count is always real, whichever shape the name takes.
  per_repo: RepoRow[];
  updatedAt?: string;
}

function loadEstateScope(): EstateScope {
  const file = path.join(process.cwd(), "public", "estate-test-scope.json");
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
function loadTileScope(): ScopeTotals | null {
  const file = path.join(process.cwd(), "public", "stats.json");
  const scope = JSON.parse(fs.readFileSync(file, "utf-8")).testScope;
  if (!scope) return null;
  return {
    total: scope.total ?? 0,
    byType: scope.byType ?? {},
    untyped_total: scope.untyped_total ?? 0,
    floor: scope.floor ?? false,
  };
}

/** Exact headline number + load-bearing "+" when the total is a floor (e.g. "3.391+"). */
function headlineTotal(scope: EstateScope): string {
  return scope.total.toLocaleString("de-DE") + (scope.floor ? "+" : "");
}

const fmt = (n: number) => n.toLocaleString("de-DE");

// Test PURPOSES, from the Test-Charter / Coverage-Matrix vocabulary minus the four counted levels
// (#370). Purposes cut across levels (an accessibility test here is a Playwright e2e test), so
// they carry no number of their own. Only purposes with at least one test or pipeline check in
// the estate are listed, measured 2026-11-14 (evidence on #370); AI-Eval had none and is out.
// A→Z, case-insensitive.
const TEST_PURPOSES = [
  "Accessibility",
  "Contract",
  "Docs-Lint",
  "Performance",
  "Regression",
  "Security",
  "SEO/GEO",
  "Visual/UAT",
] as const;

// The level bar and its legend, in column order. Swatches use the brand tokens; dark mode swaps to
// the lighter shades so each segment stays distinguishable on the dark surface.
const LEVEL_SEGMENTS: { key: keyof Omit<Cells, "total">; label: string; swatch: string }[] = [
  { key: "unit", label: "Unit", swatch: "bg-accent dark:bg-accent-bright" },
  { key: "integration", label: "Integration", swatch: "bg-[#3AA6BF] dark:bg-accent" },
  { key: "e2e", label: "End-to-End", swatch: "bg-primary dark:bg-text-secondary" },
  { key: "andere", label: "Andere", swatch: "bg-text-tertiary dark:bg-muted" },
];

/** "Stand" as people read it in Germany, in Berlin time, e.g. "15. November 2026, 07:58 Uhr". */
function formatStand(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const date = new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(d);
  const time = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(d);
  return `${date}, ${time} Uhr`;
}

/** The note under the bar: what "Andere" consists of, every figure derived from the data. */
function andereNote(p: ReturnType<typeof andereParts>): string {
  const parts: string[] = [];
  if (p.smokeAndOther > 0) {
    parts.push(`${fmt(p.smokeAndOther)} ${p.smokeAndOther === 1 ? "Smoke-Test" : "Smoke-Tests"}`);
  }
  if (p.unsplit > 0) {
    parts.push(
      `${fmt(p.unsplit)} Tests aus ${p.unsplitRepos} ${
        p.unsplitRepos === 1 ? "Repository, dessen" : "Repositories, deren"
      } Zählung noch nicht nach Stufe aufteilt`,
    );
  }
  return `„Andere“ sind ${parts.join(" und ")}.`;
}

export const metadata: Metadata = pageMetadata({
  title: "Wie wir testen — nachprüfbar gezählt | neckarshore.ai",
  description:
    "Wie wir unser Test-Estate zählen und prüfen: jede Zahl vom Test-Runner, nie geschätzt, unabhängig gegengeprüft — nachprüfbar statt nach Bauchgefühl.",
  path: "/test-management",
});

export default function TestManagementPage() {
  // Every blog post in the category Testmanagement, newest first, through the draft gate
  // (lib/content/blog.ts). Founder 2026-11-05: the test articles belong on this page, and more
  // are coming — so this is the category, not one hand-picked slug.
  const TEST_CATEGORY = "testmanagement";
  const testPosts = getPostsInCategory(TEST_CATEGORY);
  const scope = loadEstateScope();
  const total = headlineTotal(scope);
  const repos = scope.repos;

  // Throws while prerendering when the parts do not add up or the page and the tile disagree,
  // so `next build` fails instead of a wrong sum reaching the public page (#370).
  assertBreakdown(scope, loadTileScope());
  const groups = tableGroups(scope.per_repo, disclosure.display_overrides);
  const grand = grandTotal(groups);
  if (grand.total !== scope.total) {
    throw new Error(
      `/test-management: the grouped table sums to ${grand.total}, the headline is ${scope.total}; refusing to render it`,
    );
  }
  const andere = andereParts(scope.per_repo);
  const stand = formatStand(scope.updatedAt);

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <PageSchema
        path="/test-management"
        name="Wie wir testen — der Realität entspricht"
      />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <article>
          <header className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">
              Wie wir testen, und warum die Zahl der Realität entspricht
            </h1>
          </header>

          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">
            Über unser Ökosystem laufen{" "}
            <strong className="text-accent dark:text-accent-bright">
              {total} automatisierte Tests
            </strong>{" "}
            in <strong>{repos} unserer Repositories</strong>. Wir nennen die exakte Zahl,
            die die Test-Runner melden. Das „+{"“"} steht dort, weil einige Skripte Tests
            ausführen, die sich nicht automatisch zählen lassen — die tatsächliche Zahl liegt
            also höher. Wir nennen lieber eine kleinere Zahl, die stimmt, als eine größere,
            die nur gut klingt.
          </p>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Wie wir zählen
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Jede Zahl stammt vom <strong>Test-Runner selbst</strong> — jest, vitest,
              Playwright, pytest, bats, node:test. Nichts wird von Hand gezählt, nichts per
              Textsuche (<code>grep</code>) geschätzt. Wo ein Skript keine Zählung ausgibt,
              zählen wir es lieber gar nicht mit. Dafür steht das „+{"“"}: der tatsächliche
              Wert liegt höher, aber wir behaupten nur, was ein Runner bestätigt.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Wie wir prüfen
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Wir haben das gesamte Test-Estate neu gezählt — und{" "}
              <strong>
                jede einzelne Zahl unabhängig gegengeprüft, bevor wir sie akzeptiert haben.
              </strong>{" "}
              Zwei Zählungen stellten sich dabei als falsch heraus und wurden korrigiert,{" "}
              <em>bevor</em> irgendetwas veröffentlicht wurde. Der Grundsatz dahinter: die
              Zahl, die stimmt, schlägt die schnelle Zahl an jedem Tor.
            </p>
            <blockquote className="mt-6 border-l-2 border-accent/40 pl-5 text-lg italic leading-relaxed text-primary/80 dark:text-text-primary/90">
              „Das erste Prinzip ist, dass man sich nicht selbst täuschen darf — und man
              selbst ist die Person, die am leichtesten zu täuschen ist.{"“"}
              <footer className="mt-2 text-sm not-italic text-muted dark:text-text-tertiary">
                — Richard Feynman
              </footer>
            </blockquote>
          </section>

          <section className="mt-12" data-level-totals>
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Was abgedeckt ist
            </h2>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span
                className="font-heading text-5xl font-bold tracking-tight text-accent tabular-nums md:text-6xl dark:text-accent-bright"
                data-headline-total
              >
                {total}
              </span>
              <span className="text-lg text-muted dark:text-text-secondary">
                automatisierte Tests in {repos} Repositories
              </span>
            </p>
            <div
              className="mt-5 flex h-3.5 overflow-hidden rounded-full bg-primary/10 dark:bg-text-secondary/10"
              role="img"
              aria-label={`Verteilung nach Teststufe: ${LEVEL_SEGMENTS.map((l) => `${l.label} ${fmt(grand[l.key])}`).join(", ")}`}
            >
              {LEVEL_SEGMENTS.map((l) => (
                <span
                  key={l.key}
                  className={`block h-full ${l.swatch}`}
                  style={{ width: `${((grand[l.key] / scope.total) * 100).toFixed(2)}%` }}
                />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              {LEVEL_SEGMENTS.map((l) => (
                <li key={l.key} className="flex items-center gap-2" data-level={l.key}>
                  <i className={`h-2.5 w-2.5 flex-none rounded-sm ${l.swatch}`} aria-hidden="true" />
                  <span className="text-neutral-dark/80 dark:text-text-secondary">{l.label}</span>
                  <b className="ml-auto font-semibold tabular-nums text-primary dark:text-text-primary">
                    {fmt(grand[l.key])}
                  </b>
                </li>
              ))}
            </ul>
            {grand.andere > 0 && (
              <p className="mt-3 text-sm text-muted dark:text-text-tertiary" data-andere-note>
                {andereNote(andere)}
              </p>
            )}
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted dark:text-text-tertiary">
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-accent-bright/15 dark:text-text-primary">
                Täglich automatisch aktualisiert
              </span>
              {stand && (
                <span data-stand>
                  Stand: <time dateTime={scope.updatedAt}>{stand}</time>
                </span>
              )}
            </p>
            <p className="mt-6 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Gezählt wird nach Teststufe: Unit, Integration und End-to-End. Smoke-Tests und
              Tests, deren Zählung nicht nach Stufe aufteilt, stehen unter „Andere{"“"}. Zusammen
              ergeben die vier Zahlen die Gesamtzahl.
            </p>
            <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Geprüft wird außerdem nach Zweck:{" "}
              <span className="text-primary dark:text-text-primary" data-purposes>
                {TEST_PURPOSES.join(" · ")}
              </span>
              . Die Zwecke liegen quer zu den Stufen: Ein Accessibility-Test dieser Website ist
              technisch ein End-to-End-Test und steckt deshalb in der End-to-End-Zahl, nicht in
              einer eigenen.
            </p>
            <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Manche Prüfungen laufen als Schritt in der Pipeline oder von Hand und haben
              keinen Zähler, etwa Docs-Lint, Performance-Messung und visuelle Abnahme. Sie
              stehen in keiner Zahl. Eine Zahl pro Zweck nennen wir bewusst nicht: Sie würde
              Tests doppelt zählen oder Prüfungen mitzählen, die kein Test-Runner bestätigt.
            </p>
          </section>

          {groups.length > 0 && (
            <section className="mt-12" data-repo-breakdown>
              <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
                Pro Repository
              </h2>
              <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                Jede Zahl stammt vom Test-Runner des Repositorys. Die Gruppen lassen sich auf-
                und zuklappen. Private Repositories zählen mit: Sie erscheinen mit ihrem
                Produktnamen oder, ohne Namen, zusammengefasst in einer Zeile. Hat ein Produkt
                mehrere Repositories, sind sie nach Größe nummeriert.
              </p>
              <TestGroupTable groups={groups} total={grand} totalLabel={total} />
              <div className="mt-3 space-y-1.5 text-sm text-muted dark:text-text-tertiary">
                {groups.some((g) => g.rows.some((r) => r.seeded)) && (
                  <p data-seed-note>
                    <span className="font-semibold text-accent dark:text-accent-bright">°</span>{" "}
                    Von Hand mit dem Test-Runner gezählt. Dieses Repository meldet seine Zahl
                    noch nicht selbst, sie wird deshalb nicht täglich neu erhoben.
                  </p>
                )}
                <p>„Andere{"“"}: Smoke-Tests und Tests, deren Zählung nicht nach Stufe aufteilt.</p>
              </div>
              {/* No count in the link text on purpose: this page's repo span is "repos with
                  tests", /repositories lists ALL repos — a number here would mismatch.
                  The two figures this comment used to name (20 and 31) were BOTH stale by
                  2026-08-12, which is the joke: a comment written to prevent a wrong number
                  on screen carried two wrong numbers itself. Deliberately unquantified now —
                  a hand-typed count next to a derived one is the drift class, not a fix. */}
              <p className="mt-4 text-sm">
                <Link
                  href="/repositories"
                  data-track="testmgmt_all_repositories"
                  className="inline-flex min-h-[44px] items-center font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
                >
                  Alle Repositories ansehen →
                </Link>
              </p>
            </section>
          )}

          {testPosts.length > 0 && (
            <section className="mt-12" data-blog-pointer>
              <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
                Aus dem Blog
              </h2>
              <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                Wie wir testen, ausführlich und mit Zahlen aus unseren Projekten:
              </p>
              <ul className="mt-4 divide-y divide-primary/10 border-y border-primary/10 dark:divide-white/10 dark:border-white/10">
                {testPosts.map((post) => (
                  <li key={post.slug} className="py-4">
                    <Link
                      href={postPath(post.slug)}
                      data-track="testmgmt_blog_post"
                      className="font-heading text-lg font-semibold text-primary transition-colors hover:text-accent dark:text-text-primary dark:hover:text-accent-bright"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted dark:text-text-tertiary">
                      <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} Min. Lesezeit
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm">
                <Link
                  href={categoryPath(TEST_CATEGORY)}
                  data-track="testmgmt_blog_category"
                  className="inline-flex min-h-[44px] items-center font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
                >
                  Alle Beiträge zu Testmanagement →
                </Link>
              </p>
            </section>
          )}

          <p className="mt-12 text-sm italic text-muted dark:text-text-tertiary">
            <span className="font-medium not-italic">Wie dieser Text entstand:</span> Diese
            Seite über nachprüfbares Testen wurde selbst KI-entworfen und menschlich
            editiert — dieselbe Disziplin, die unsere Tests zählt, hat auch diesen Text
            geschrieben.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
