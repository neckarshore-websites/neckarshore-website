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
 * /repositories — the public repository inventory (backlog #7, PUBLIC-ONLY + auto-synced).
 *
 * Public repos are listed individually (name + GitHub description, grouped by Typ). Private
 * repos are NOT named — they are represented solely by an aggregate count ("N private
 * Repositories"). The data is DATA-BOUND to public/repositories.json, which the daily
 * update-stats workflow regenerates from GitHub. PUBLIC-ONLY at the SOURCE (Founder 2026-06-30,
 * overrides the earlier hybrid): public/repositories.json is itself a public asset, so a
 * private repo's NAME there would leak regardless of how this page renders — the workflow
 * therefore withholds private names at generation and only emits `privateCount`. This render
 * holds no private names to leak; the privacy invariant is guarded by an e2e.
 */

interface RepoEntry {
  owner: string;
  name: string;
  visibility: "public" | "private";
  description: string;
}

function loadRepos(): { updatedAt: string; repos: RepoEntry[]; privateCount: number } {
  const file = path.join(process.cwd(), "public", "repositories.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  // Defensive: keep only public entries even if an older/private-bearing file is ever served,
  // so a stale artifact can never surface a private name through this render.
  const repos = (Array.isArray(raw.repos) ? raw.repos : []).filter(
    (r: RepoEntry) => r.visibility === "public",
  );
  return {
    updatedAt: raw.updatedAt ?? "",
    repos,
    privateCount: Number.isFinite(raw.privateCount) ? raw.privateCount : 0,
  };
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
  const { updatedAt, repos, privateCount } = loadRepos();
  const publicGroups = byType(repos);
  const total = repos.length + privateCount;
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
              <strong>{total} Repositories</strong>. Öffentliche listen wir einzeln mit
              Beschreibung; private zählen wir nur — ohne Namen. Diese Liste wird automatisch
              mit GitHub abgeglichen, nicht von Hand gepflegt.
            </p>
          </header>

          {/* ── Öffentlich (detailed) ── */}
          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Öffentlich{" "}
              <span className="text-base font-normal text-muted dark:text-text-tertiary">
                ({repos.length})
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

          {/* ── Privat (aggregate count only — no names, Founder 2026-06-30) ── */}
          {privateCount > 0 && (
            <section className="mt-14">
              <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
                Privat{" "}
                <span className="text-base font-normal text-muted dark:text-text-tertiary">
                  ({privateCount})
                </span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted dark:text-text-tertiary">
                Dazu kommen <strong>{privateCount} private Repositories</strong> — interne
                Produkte, Planung und Infrastruktur. Namen und Details bleiben privat.
              </p>
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
