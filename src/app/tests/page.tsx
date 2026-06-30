import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PageSchema } from "@/components/PageSchema";
import { pageMetadata } from "@/lib/seo";
import { flooredTotal } from "@/lib/stats-breakdown";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

/**
 * /tests — "Wie wir testen, und warum die Zahl ehrlich ist" (backlog #245, UD5 Front-10).
 *
 * The detail surface behind the homepage "Automatisierte Tests" tile: the STORY behind the
 * number (runner-counted, never grep'd; adversarially verified before published). Copy is the
 * Appendix-A draft of the #245 brief (AI-draft → Rauhut-edit on preview → prod) — the words
 * are NOT invented here. The numbers are DATA-BOUND to the same single source as the tile
 * (public/estate-test-scope.json) so the page can never contradict its own tile and the floor
 * moves automatically with the next Durchstich. No second hardcoded figure.
 *
 * Honesty guardrails (brief §4): phonesis is absent from the source data (never public); the
 * verify-catches are framed as METHOD only (no internal specifics); the aggregate is
 * floor-framed (2.600+, never the exact 2.611 as a hard claim); per-repo rows are the
 * floor-honest individual counts. Per §5(b): Top-N + rest-rollup, so the 0-test scaffold repo
 * and the one known-red repo (#257) are folded into "und N weitere", not spotlighted.
 */

interface EstateScope {
  total: number;
  repos: number;
  floor: boolean;
  per_repo: { repo: string; total: number }[];
}

function loadEstateScope(): EstateScope {
  const file = path.join(process.cwd(), "public", "estate-test-scope.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  return {
    total: raw.total ?? 0,
    repos: raw.repos ?? (Array.isArray(raw.per_repo) ? raw.per_repo.length : 0),
    floor: raw.floor ?? false,
    per_repo: Array.isArray(raw.per_repo) ? raw.per_repo : [],
  };
}

/** Floor-framed headline number: "2.600+" (round down to 100, load-bearing "+"). */
function headlineTotal(scope: EstateScope): string {
  const n = scope.floor ? flooredTotal(scope.total) : scope.total;
  return n.toLocaleString("de-DE") + (scope.floor ? "+" : "");
}

const TOP_N = 6;

export const metadata: Metadata = pageMetadata({
  title: "Wie wir testen — ehrlich gezählt | neckarshore.ai",
  description:
    "Wie wir unser Test-Estate zählen und prüfen: jede Zahl vom Runner, nie geschätzt, adversariell verifiziert — der Boden der Wahrheit, nicht die Spitze.",
  path: "/tests",
});

export default function TestsPage() {
  const scope = loadEstateScope();
  const total = headlineTotal(scope);
  const repos = scope.repos;

  // Per-repo: floor-honest individual counts, Top-N by count + rest-rollup (brief §5b). The
  // rest bucket folds the 0-test scaffold repo and the known-red repo (#257) out of individual
  // view until #257 is fixed — credibility page, not an audit.
  const ranked = [...scope.per_repo].sort((a, b) => b.total - a.total);
  const top = ranked.slice(0, TOP_N).map((r) => ({
    name: r.repo.includes("/") ? r.repo.split("/").pop()! : r.repo,
    total: r.total,
  }));
  const restCount = Math.max(0, repos - top.length);

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <PageSchema path="/tests" name="Wie wir testen — ehrlich gezählt" />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <article>
          <header className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">
              Wie wir testen, und warum die Zahl ehrlich ist
            </h1>
          </header>

          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">
            Über unser Ökosystem laufen{" "}
            <strong className="text-accent dark:text-accent-bright">
              {total} automatisierte Tests
            </strong>{" "}
            über <strong>{repos} Repositories</strong>. Diese Zahl ist bewusst der{" "}
            <em>Boden</em> der Wahrheit, nicht ihre Spitze. Das „+{"“"} bleibt stehen,
            weil
            zwei Repositories Floors sind: Skripte ohne maschinelle Zählung existieren,
            werden aber nicht mitgezählt. Wir veröffentlichen lieber eine kleinere wahre
            Zahl als eine größere bequeme.
          </p>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Wie wir zählen
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Jede Zahl stammt vom <strong>Test-Runner selbst</strong> — jest, vitest,
              Playwright, pytest, bats, node:test. Nichts wird von Hand gezählt, nichts per
              Textsuche (<code>grep</code>) geschätzt. Wo ein Skript keine Zählung ausgibt,
              markieren wir den Wert als Floor und runden nach unten. Genau dafür steht das
              „+{"“"}: der wahre Wert liegt höher, aber wir behaupten nur, was ein
              Runner
              bestätigt.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Wie wir prüfen
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Wir haben das gesamte Test-Estate neu gezählt — und{" "}
              <strong>
                jede einzelne Zahl unabhängig herausgefordert, bevor wir sie akzeptiert
                haben.
              </strong>{" "}
              Zwei Zählungen stellten sich als falsch heraus und wurden korrigiert,{" "}
              <em>bevor</em> irgendetwas veröffentlicht wurde. Der Grundsatz dahinter: die
              ehrliche Zahl schlägt die schnelle Zahl an jedem Tor.
            </p>
            <blockquote className="mt-6 border-l-2 border-accent/40 pl-5 text-lg italic leading-relaxed text-primary/80 dark:text-text-primary/90">
              „Das erste Prinzip ist, dass man sich nicht selbst täuschen darf — und man
              selbst ist die Person, die am leichtesten zu täuschen ist.{"“"}
              <footer className="mt-2 text-sm not-italic text-muted dark:text-text-tertiary">
                — Richard Feynman
              </footer>
            </blockquote>
          </section>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Was abgedeckt ist
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Unit · Integration · End-to-End · Accessibility · Security · SEO/GEO — über
              das gesamte Estate hinweg.{" "}
              <span className="text-muted dark:text-text-tertiary">
                (Keine Pro-Typ-Zahlen auf dieser Seite: eine estate-weite
                Typ-Aufschlüsselung ist nur teilweise verfügbar, eine numerische Aufteilung
                wäre also unvollständig — und damit unehrlich.)
              </span>
            </p>
          </section>

          {top.length > 0 && (
            <section className="mt-12">
              <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
                Pro Repository
              </h2>
              <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                Die testreichsten Repositories, je mit ihrer runner-gemeldeten Floor-Zahl.
                Das Aggregat oben bleibt floor-gerahmt; die Einzelwerte sind die ehrlichen
                Untergrenzen.
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-primary/10 dark:border-text-secondary/10">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-primary/5 dark:bg-text-secondary/5">
                      <th
                        scope="col"
                        className="px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary"
                      >
                        Repository
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2.5 text-right font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary"
                      >
                        Tests
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {top.map((r) => (
                      <tr
                        key={r.name}
                        className="border-t border-primary/10 dark:border-text-secondary/10"
                      >
                        <td className="px-4 py-3 font-mono text-neutral-dark/80 dark:text-text-secondary">
                          {r.name}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-primary dark:text-text-primary">
                          {r.total.toLocaleString("de-DE")}
                        </td>
                      </tr>
                    ))}
                    {restCount > 0 && (
                      <tr className="border-t border-primary/10 dark:border-text-secondary/10">
                        <td
                          colSpan={2}
                          className="px-4 py-3 text-muted dark:text-text-tertiary"
                        >
                          … und {restCount} weitere Repositories
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <p className="mt-12 text-sm italic text-muted dark:text-text-tertiary">
            <span className="font-medium not-italic">Wie dieser Text entstand:</span> Diese
            Seite über ehrliches Testen wurde selbst KI-entworfen und menschlich editiert —
            dieselbe Disziplin, die unsere Tests zählt, hat auch diesen Text geschrieben.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
