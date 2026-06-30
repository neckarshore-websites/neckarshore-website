import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * /repositories — the public repository inventory (backlog #7, hybrid + auto-synced).
 *
 * Verifies the page is DATA-BOUND to public/repositories.json (public repos detailed, private
 * rudimentary, grouped by Typ) and — most importantly — holds the PRIVACY INVARIANT: the
 * committed public JSON carries NO description for any private repo, so a private repo's detail
 * can never reach the public surface regardless of how the page renders.
 */

function loadRepos() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "repositories.json"), "utf-8"),
  );
  return {
    updatedAt: raw.updatedAt as string,
    repos: (raw.repos ?? []) as {
      owner: string;
      name: string;
      visibility: "public" | "private";
      description: string;
    }[],
  };
}

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
  test("TC-CNT-078: PRIVACY INVARIANT — the public JSON carries no private-repo description", () => {
    const { repos } = loadRepos();
    const leaks = repos.filter((r) => r.visibility === "private" && r.description !== "");
    expect(
      leaks.map((r) => `${r.owner}/${r.name}`),
      "private repos must never carry a description in the public file",
    ).toEqual([]);
    // Sanity: the data is non-trivial (both buckets populated).
    expect(repos.filter((r) => r.visibility === "public").length).toBeGreaterThan(0);
    expect(repos.filter((r) => r.visibility === "private").length).toBeGreaterThan(0);
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

  test("TC-CNT-077: data-bound — total count + a public repo's name AND description render", async ({
    page,
  }) => {
    const { repos } = loadRepos();
    const firstPublic = repos.find((r) => r.visibility === "public" && r.description);
    expect(firstPublic, "fixture needs at least one public repo with a description").toBeTruthy();

    await page.goto("/repositories");
    const main = page.locator("main");
    await expect(main).toContainText(`${repos.length} Repositories`);
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
