import type { Metadata } from "next";
import SubPortal from "@/components/SubPortal";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO, categoryMetaTitle } from "@/lib/portfolio";
import { SKILL_CARDS } from "@/lib/skill-cards";

const category = PORTFOLIO.find((c) => c.id === "skills")!;
const description =
  "Fokussierte Open-Source-Werkzeuge — Claude-Skills und kleine Apps, die genau ein Problem gut lösen.";

export const metadata: Metadata = pageMetadata({
  title: categoryMetaTitle(category),
  description,
  path: category.href,
});

// On-page overview: name + the one problem it solves + code visibility + status, sorted
// A→Z by the shown name (Founder 2026-10-29). Every skill has its own detail page, which
// carries the full card; the overview page itself shows no cards any more (Founder
// 2026-10-29: "die Kacheln kommen ja noch mal auf der Detailseite").
const overviewRows = category.items
  .filter((item) => !item.isExternal)
  .map((item) => {
    const card = SKILL_CARDS[item.slug];
    return {
      slug: item.slug,
      title: card?.title ?? item.name,
      summary: card?.summary ?? item.tagline,
      status: card?.badge ?? (card?.footerBadge ? "Referenz" : null),
      visibility: card?.visibility ?? null,
      href: item.href,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title, "de", { sensitivity: "base" }));

export default function SkillsPage() {
  return (
    <SubPortal category={category} description={description} wide>
      {/* Overview table — Tool name → detail page. On phones (<sm) the two narrow pill
          columns (Code, Status) hide so the wide "Löst" description keeps the rows short;
          the pills stay visible on each detail page's card. */}
      <section aria-labelledby="skills-overview-heading" className="mt-10">
        <h2
          id="skills-overview-heading"
          className="font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary"
        >
          Übersicht
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-primary/10 dark:border-text-secondary/10">
          <table className="w-full table-fixed text-left text-sm">
            <thead>
              <tr className="bg-primary/5 dark:bg-text-secondary/5">
                <th
                  scope="col"
                  className="w-[34%] px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary sm:w-[26%]"
                >
                  Tool
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary"
                >
                  Löst
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted sm:table-cell sm:w-[14%] dark:text-text-tertiary"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-muted sm:table-cell sm:w-[15%] dark:text-text-tertiary"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {overviewRows.map((row) => (
                <tr
                  key={row.slug}
                  className="border-t border-primary/10 dark:border-text-secondary/10"
                >
                  <th scope="row" className="px-4 py-3 align-top font-normal">
                    <a
                      href={row.href}
                      className="font-medium text-accent underline-offset-2 hover:underline dark:text-accent-bright"
                      data-track={`skills_detail_${row.slug}`}
                    >
                      {row.title}
                    </a>
                  </th>
                  <td className="px-4 py-3 align-top text-neutral-dark/80 dark:text-text-secondary">
                    {row.summary}
                  </td>
                  <td className="hidden px-4 py-3 align-top sm:table-cell">
                    {row.visibility && (
                      <span
                        className={
                          row.visibility === "public"
                            ? "inline-block whitespace-nowrap rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-hover dark:bg-accent/20 dark:text-accent-bright"
                            : "inline-block whitespace-nowrap rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-muted dark:bg-text-secondary/10 dark:text-text-tertiary"
                        }
                      >
                        {row.visibility === "public" ? "Public" : "Privat"}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 align-top sm:table-cell">
                    {row.status && (
                      <span className="inline-block whitespace-nowrap rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
                        {row.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Install path for the public plugins (2026-10-29). Marketplace name and plugin names
            measured from neckarshore-plugins/.claude-plugin/marketplace.json (name
            "neckarshore-ai"). Adding the marketplace does not install anything (CodeRabbit on
            #337), so the install lines are shown too. */}
        <p className="mt-4 text-sm leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Obsidian Vault Autopilot und Mailbox Autopilot installierst du in Claude Code über
          unseren Plugin-Marketplace (
          <a
            href="https://github.com/neckarshore-skills/neckarshore-plugins"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent-hover dark:hover:text-accent-bright"
            data-track="oss_plugin_marketplace"
          >
            Marketplace auf GitHub
          </a>
          ). Erst den Marketplace hinzufügen, dann das gewünschte Plugin installieren:
        </p>
        {/* Own lines, so a command never breaks mid-word on desktop; on a 320px phone it may
            still wrap, and overflow-wrap:anywhere keeps it inside the gutter. */}
        <pre className="mt-2 w-fit max-w-full whitespace-pre-wrap rounded bg-primary/5 px-3 py-2 text-xs font-semibold leading-relaxed text-accent-hover [overflow-wrap:anywhere] dark:bg-text-secondary/10 dark:text-accent-bright">
          <code>
            {[
              "/plugin marketplace add neckarshore-skills/neckarshore-plugins",
              "/plugin install obsidian-vault-autopilot@neckarshore-ai",
              "/plugin install mailbox-autopilot@neckarshore-ai",
            ].join("\n")}
          </code>
        </pre>
      </section>
    </SubPortal>
  );
}
