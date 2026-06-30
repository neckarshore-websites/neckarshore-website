import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * /tests — "Wie wir testen" detail surface (backlog #245, UD5 Front-10).
 *
 * Verifies the page is DATA-BOUND to the same single source as the homepage tile
 * (public/estate-test-scope.json) — never a second hardcoded figure that can drift — and
 * holds the honesty guardrails (phonesis absent; floor-framed aggregate; Top-N + rest-rollup
 * so the 0-test scaffold repo and the known-red repo are not individually spotlighted).
 */

function loadScope() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "estate-test-scope.json"), "utf-8"),
  );
  return {
    total: raw.total as number,
    repos: raw.repos as number,
    floor: Boolean(raw.floor),
    per_repo: (raw.per_repo ?? []) as { repo: string; total: number }[],
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

test.describe("Content surface — /tests (KI-Testen detail)", () => {
  test("TC-CNT-068: 200, single H1, canonical, WebPage JSON-LD with its own @id", async ({
    page,
  }) => {
    const res = await page.goto("/tests");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://neckarshore.ai/tests",
    );
    const webpages = (await ldNodes(page)).filter((n) => n["@type"] === "WebPage");
    expect(webpages.length).toBeGreaterThanOrEqual(1);
    expect(
      webpages.some((w) => w["@id"] === "https://neckarshore.ai/tests#webpage"),
    ).toBe(true);
  });

  test("TC-CNT-069: headline number is data-bound to estate-test-scope.json (floored + '+')", async ({
    page,
  }) => {
    const scope = loadScope();
    const floored = scope.floor ? Math.floor(scope.total / 100) * 100 : scope.total;
    const expected = floored.toLocaleString("de-DE") + (scope.floor ? "+" : "");

    await page.goto("/tests");
    const main = page.locator("main");
    // Same single source as the tile → no second literal that can drift.
    await expect(main).toContainText(`${expected} automatisierte Tests`);
    await expect(main).toContainText(`${scope.repos} Repositories`);
  });

  test("TC-CNT-070: public-safe — phonesis absent; runner-counted + adversarial-verify passage present", async ({
    page,
  }) => {
    await page.goto("/tests");
    const body = (await page.locator("main").textContent()) ?? "";
    // Hard guardrail: the BLOCKED clone is never on the public surface.
    expect(body.toLowerCase()).not.toContain("phonesis");
    // The GEO-citable method passage (the lever #246 points at).
    expect(body).toContain("Test-Runner");
    expect(body).toContain("grep");
    expect(body).toContain("herausgefordert"); // the adversarial-verify method, framed generically
  });

  test("TC-CNT-071: per-repo table is Top-N + a rest-rollup (no 0-row / no red-test spotlight)", async ({
    page,
  }) => {
    await page.goto("/tests");
    const table = page.locator("main table");
    await expect(table).toBeVisible();
    // Top-6 + at most one rollup row.
    expect(await table.locator("tbody tr").count()).toBeLessThanOrEqual(7);
    await expect(table).toContainText("weitere Repositories");
    const tableText = (await table.textContent()) ?? "";
    // §5b: the 0-test scaffold repo and the known-red repo (#257) stay in the rollup, not spotlit.
    expect(tableText).not.toContain("clearpath-52");
    expect(tableText).not.toContain("oakwoodgolfclub-website");
  });

  test("TC-CNT-072: sitemap lists /tests", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("https://neckarshore.ai/tests");
  });

  test("TC-CNT-073: homepage Tests tile links to /tests", async ({ page }) => {
    await page.goto("/");
    const link = page.locator('a[data-track="stats_tests_detail"]');
    await expect(link).toHaveAttribute("href", "/tests");
    await expect(link).toContainText("Automatisierte Tests");
  });
});
