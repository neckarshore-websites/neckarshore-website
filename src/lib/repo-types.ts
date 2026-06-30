/**
 * Repository type classifier (backlog #244/#245 follow-up).
 *
 * Maps an `owner/name` repo slug to one of the five public-facing categories the
 * test-management + repositories surfaces group by. The default is by GitHub org
 * (one org = one category); a small override table handles the repos whose org
 * default would mislabel them (infra/tooling/content repos living in a product org).
 *
 * Pure data, no I/O — imported by both the /test-management per-repo table and the
 * /repositories inventory so the two can never classify the same repo differently.
 */

export type RepoType = "Produkt" | "MMP" | "Plugin/Skill" | "Webseite" | "Sonstige";

/** Display order for grouped views (Produkt first, Sonstige last). */
export const REPO_TYPE_ORDER: RepoType[] = [
  "Produkt",
  "MMP",
  "Plugin/Skill",
  "Webseite",
  "Sonstige",
];

/** One GitHub org → its default category. */
const ORG_DEFAULT: Record<string, RepoType> = {
  "omnopsis-ai": "Produkt",
  "neckarshore-mmps": "MMP",
  "neckarshore-skills": "Plugin/Skill",
  "neckarshore-websites": "Webseite",
  "neckarshore-ai": "Sonstige",
  "neckarshore-agents": "Sonstige",
};

/** Repos whose org default is wrong (infra/tooling/content/planning in a product org). */
const OVERRIDES: Record<string, RepoType> = {
  "omnopsis-ai/omnopsis-planning": "Sonstige",
  "omnopsis-ai/omnopsis-test-management": "Sonstige",
  "neckarshore-websites/site-quality": "Sonstige", // reusable Lighthouse gate package, not a website
  "neckarshore-skills/test-stats-action": "Sonstige", // reusable CI action, not a user-facing skill
  "neckarshore-skills/neckarshore-easter-eggs-skills": "Sonstige", // session-egg content/skills, not a product skill
  "neckarshore-ai/neckarshore-easter-eggs": "Sonstige",
};

/** Classify a repo slug ("owner/name") into a public-facing category. */
export function repoType(slug: string): RepoType {
  if (OVERRIDES[slug]) return OVERRIDES[slug];
  const owner = slug.includes("/") ? slug.split("/")[0] : "";
  return ORG_DEFAULT[owner] ?? "Sonstige";
}
