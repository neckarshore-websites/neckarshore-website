import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PageSchema } from "@/components/PageSchema";
import { pageMetadata } from "@/lib/seo";
import { repoType, REPO_TYPE_ORDER, type RepoType } from "@/lib/repo-types";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

/**
 * /repositories — the public repository inventory (backlog #7, hybrid + auto-synced).
 *
 * Two-axis view: PRIMARY split public vs private; SECONDARY grouping by Typ. Public repos show
 * name + GitHub description; private repos show name + Typ only ("privat", no detail). The data
 * is DATA-BOUND to public/repositories.json, which the daily update-stats workflow regenerates
 * from GitHub — so a repo that flips public↔private (or edits its description) is reflected
 * within a day, with no manual edit here. The committed JSON is PUBLIC-SAFE by construction:
 * private repos never carry a description in it (enforced in the workflow + guarded by an e2e).
 */

interface RepoEntry {
  owner: string;
  name: string;
  visibility: "public" | "private";
  description: string;
}

function loadRepos(): { updatedAt: string; repos: RepoEntry[] } {
  const file = path.join(process.cwd(), "public", "repositories.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  return { updatedAt: raw.updatedAt ?? "", repos: Array.isArray(raw.repos) ? raw.repos : [] };
}

/** Group a repo list by Typ, in the canonical Typ order, dropping empty groups. */
function byType(repos: RepoEntry[]): { type: RepoType; repos: RepoEntry[] }[] {
  return REPO_TYPE_ORDER.map((type) => ({
    type,
    repos: repos
      .filter((r) => repoType(`${r.owner}/${r.name}`) === type)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.repos.length > 0);
}

export const metadata: Metadata = pageMetadata({
  title: "Unsere Repositories | neckarshore.ai",
  description:
    "Der Code-Bestand von Neckarshore AI: öffentliche Repositories mit Beschreibung, private nur mit Status — täglich automatisch mit GitHub abgeglichen.",
  path: "/repositories",
});

export default function RepositoriesPage() {
  const { updatedAt, repos } = loadRepos();
  const publicRepos = repos.filter((r) => r.visibility === "public");
  const privateRepos = repos.filter((r) => r.visibility === "private");
  const publicGroups = byType(publicRepos);
  const privateGroups = byType(privateRepos);
  const stand = updatedAt
    ? new Date(updatedAt).toLocaleDateString("de-DE")
    : null;

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <PageSchema path="/repositories" name="Unsere Repositories" />
      <main className="mx-auto max-w-[820px] px-4 pt-40 pb-20 md:px-6">
        <article>
          <header className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">
              Unsere Repositories
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-primary/90 dark:text-text-primary">
              Der gesamte Code-Bestand hinter unseren Produkten, Skills und Websites —{" "}
              <strong>{repos.length} Repositories</strong>. Öffentliche zeigen wir mit
              Beschreibung; bei privaten nennen wir nur Namen und Status. Diese Liste wird
              automatisch mit GitHub abgeglichen, nicht von Hand gepflegt.
            </p>
          </header>

          {/* ── Öffentlich (detailed) ── */}
          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Öffentlich{" "}
              <span className="text-base font-normal text-muted dark:text-text-tertiary">
                ({publicRepos.length})
              </span>
            </h2>
            {publicGroups.map((group) => (
              <div key={group.type} className="mt-6">
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-accent dark:text-accent-bright">
                  {group.type}
                </h3>
                <dl className="mt-3 divide-y divide-primary/10 dark:divide-text-secondary/10">
                  {group.repos.map((r) => (
                    <div key={r.name} className="py-3 sm:grid sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-4">
                      <dt className="font-mono text-sm text-primary dark:text-text-primary">
                        {r.name}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-neutral-dark/80 sm:mt-0 dark:text-text-secondary">
                        {r.description || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </section>

          {/* ── Privat (rudimentary) ── */}
          {privateRepos.length > 0 && (
            <section className="mt-14">
              <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
                Privat{" "}
                <span className="text-base font-normal text-muted dark:text-text-tertiary">
                  ({privateRepos.length})
                </span>
              </h2>
              <p className="mt-2 text-sm text-muted dark:text-text-tertiary">
                Interne Repositories — wir nennen Name und Typ, Details bleiben privat.
              </p>
              {privateGroups.map((group) => (
                <div key={group.type} className="mt-5">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-accent dark:text-accent-bright">
                    {group.type}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {group.repos.map((r) => (
                      <li
                        key={r.name}
                        className="rounded-full bg-primary/5 px-3 py-1 font-mono text-xs text-neutral-dark/80 dark:bg-text-secondary/10 dark:text-text-secondary"
                      >
                        {r.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {stand && (
            <p className="mt-12 text-sm text-muted dark:text-text-tertiary">
              Stand: {stand} · automatisch mit GitHub abgeglichen.
            </p>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
