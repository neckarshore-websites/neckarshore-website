import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * /repositories — the public repository inventory (backlog #7, PUBLIC-ONLY + auto-synced).
 *
 * Verifies the page is DATA-BOUND to public/repositories.json (public repos detailed + grouped
 * by Typ, private repos as an aggregate count only) and — most importantly — holds the hardened
 * PRIVACY INVARIANT (Founder 2026-06-30): the committed public JSON names ZERO private repos
 * (not just "no description") and the rendered page surfaces no private name — only the count.
 * The fix is at the SOURCE (the workflow withholds private names); these tests guard the artifact.
 */

function loadRepos() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "repositories.json"), "utf-8"),
  );
  return {
    updatedAt: raw.updatedAt as string,
    privateCount: (raw.privateCount ?? 0) as number,
    repos: (raw.repos ?? []) as {
      owner: string;
      name: string;
      visibility: "public" | "private";
      description: string;
    }[],
  };
}

/** Total repos under stats management = the source-of-truth denominator (named-public + counted-private). */
function configRepoTotal(): number {
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "stats-config.json"), "utf-8"));
  return (raw.repos ?? []).length;
}

/**
 * High-sensitivity private repo names that must NEVER appear on the public surface (the crown
 * jewels — product backend/frontend, the importer, agent infra, the voicebank). A curated canary,
 * deliberately NOT the full private set: if one of THESE shows up in the public file or the
 * rendered page, it is a real privacy regression. A repo legitimately going public is a deliberate
 * review trigger — update this list when that happens.
 */
const PRIVATE_CANARIES = [
  "omnopsis-backend",
  "omnopsis-frontend",
  "omnopsis-document-importer",
  "marvin-hq",
  "phonesis-voicebank",
];

async function ldNodes(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = page.locator('script[type="application/ld+json"]');
  const count = await blocks.count();
  const nodes: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const txt = await blocks.nth(i).textContent();
    if (txt) {
      const parsed = JSON.parse(txt);
      nodes.push(...((parsed["@graph"] ?? [parsed]) as Record<string, unknown>[]));
    }
  }
  return nodes;
}

test.describe("Content surface — /repositories (inventory)", () => {
  test("TC-CNT-078: PRIVACY INVARIANT — repositories.json names ZERO private repos", () => {
    const { repos, privateCount } = loadRepos();
    const raw = fs.readFileSync(
      path.join(process.cwd(), "public", "repositories.json"),
      "utf-8",
    );

    // Structural (self-maintaining): the public file carries ONLY public entries — no private
    // repo can be named because none is present. Private repos exist solely as a count.
    const privateEntries = repos.filter((r) => r.visibility !== "public");
    expect(
      privateEntries.map((r) => `${r.owner}/${r.name}`),
      "repositories.json must contain zero private entries",
    ).toEqual([]);
    expect(repos.length, "public repos must be present").toBeGreaterThan(0);
    expect(
      privateCount,
      "private repos must be represented by a positive aggregate count",
    ).toBeGreaterThan(0);
    // Denominator: every managed repo is accounted for as named-public OR counted-private.
    expect(repos.length + privateCount).toBe(configRepoTotal());

    // Named canary: no high-sensitivity private name may appear anywhere in the raw file.
    for (const name of PRIVATE_CANARIES) {
      expect(raw, `private repo "${name}" must not appear in repositories.json`).not.toContain(
        name,
      );
    }
  });

  test("TC-CNT-076: 200, single H1, canonical, WebPage JSON-LD with its own @id", async ({
    page,
  }) => {
    const res = await page.goto("/repositories");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://neckarshore.ai/repositories",
    );
    const webpages = (await ldNodes(page)).filter((n) => n["@type"] === "WebPage");
    expect(
      webpages.some((w) => w["@id"] === "https://neckarshore.ai/repositories#webpage"),
    ).toBe(true);
  });

  test("TC-CNT-077: data-bound — total count (public + private) + a public repo's name AND description render", async ({
    page,
  }) => {
    const { repos, privateCount } = loadRepos();
    const total = repos.length + privateCount;
    const firstPublic = repos.find((r) => r.visibility === "public" && r.description);
    expect(firstPublic, "fixture needs at least one public repo with a description").toBeTruthy();

    await page.goto("/repositories");
    const main = page.locator("main");
    await expect(main).toContainText(`${total} Repositories`);
    await expect(main).toContainText(firstPublic!.name);
    await expect(main).toContainText(firstPublic!.description);
  });

  test("TC-CNT-079: public + private sections, grouped by Typ subheadings", async ({
    page,
  }) => {
    await page.goto("/repositories");
    await expect(
      page.getByRole("heading", { level: 2, name: /^Öffentlich/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /^Privat/ }),
    ).toBeVisible();
    // Typ subheadings (h3) — at least the ones we know are populated.
    await expect(page.getByRole("heading", { level: 3, name: "Webseite" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Plugin/Skill" }).first()).toBeVisible();
  });

  test("TC-CNT-082: PRIVACY INVARIANT — the rendered page names no private repo, only the count", async ({
    page,
  }) => {
    const { privateCount } = loadRepos();
    await page.goto("/repositories");
    const mainText = (await page.locator("main").textContent()) ?? "";
    for (const name of PRIVATE_CANARIES) {
      expect(
        mainText,
        `private repo "${name}" must not render on the public /repositories page`,
      ).not.toContain(name);
    }
    // The private bucket appears ONLY as an aggregate count line — no names, no rows.
    await expect(page.locator("main")).toContainText(`${privateCount} private Repositories`);
  });

  test("TC-CNT-080: sitemap lists /repositories", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("https://neckarshore.ai/repositories");
  });

  test("TC-CNT-081: /test-management links to /repositories", async ({ page }) => {
    await page.goto("/test-management");
    const link = page.locator('a[data-track="testmgmt_all_repositories"]');
    await expect(link).toHaveAttribute("href", "/repositories");
  });
});
