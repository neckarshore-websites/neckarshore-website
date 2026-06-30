import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * /test-management — "Wie wir testen" detail surface (backlog #245, UD5 Front-10).
 *
 * Verifies the page is DATA-BOUND to the same single source as the homepage tile
 * (public/estate-test-scope.json) — never a second hardcoded figure that can drift — and
 * holds the honesty guardrails (phonesis absent; rounded-down aggregate; Top-N + rest-rollup
 * so the 0-test scaffold repo and the known-red repo are not individually spotlighted). Also
 * checks the 13-test-type scope, the per-repo Typ column, and the /tests→/test-management 308.
 */

const ROUTE = "/test-management";

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

test.describe("Content surface — /test-management (KI-Testen detail)", () => {
  test("TC-CNT-068: 200, single H1, canonical, WebPage JSON-LD with its own @id", async ({
    page,
  }) => {
    const res = await page.goto(ROUTE);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://neckarshore.ai/test-management",
    );
    const webpages = (await ldNodes(page)).filter((n) => n["@type"] === "WebPage");
    expect(webpages.length).toBeGreaterThanOrEqual(1);
    expect(
      webpages.some(
        (w) => w["@id"] === "https://neckarshore.ai/test-management#webpage",
      ),
    ).toBe(true);
  });

  test("TC-CNT-069: headline number is data-bound to estate-test-scope.json (floored + '+')", async ({
    page,
  }) => {
    const scope = loadScope();
    const floored = scope.floor ? Math.floor(scope.total / 100) * 100 : scope.total;
    const expected = floored.toLocaleString("de-DE") + (scope.floor ? "+" : "");

    await page.goto(ROUTE);
    const main = page.locator("main");
    // Same single source as the tile → no second literal that can drift.
    await expect(main).toContainText(`${expected} automatisierte Tests`);
    await expect(main).toContainText(`${scope.repos} unserer Repositories`);
  });

  test("TC-CNT-070: public-safe — phonesis absent; runner-counted + re-check passage present", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const body = (await page.locator("main").textContent()) ?? "";
    // Hard guardrail: the BLOCKED clone is never on the public surface.
    expect(body.toLowerCase()).not.toContain("phonesis");
    // The GEO-citable method passage (the lever #246 points at).
    expect(body).toContain("Test-Runner");
    expect(body).toContain("grep");
    expect(body).toContain("gegengeprüft"); // the re-check method, framed generically
  });

  test("TC-CNT-071: per-repo table has a Typ column, Top-N + rest-rollup (no 0-row / no red-test spotlight)", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const table = page.locator("main table");
    await expect(table).toBeVisible();
    // Three columns now: Repository · Typ · Tests.
    await expect(table.locator("thead th")).toHaveCount(3);
    await expect(table.locator("thead")).toContainText("Typ");
    // Top-6 + at most one rollup row.
    expect(await table.locator("tbody tr").count()).toBeLessThanOrEqual(7);
    await expect(table).toContainText("weitere Repositories");
    const tableText = (await table.textContent()) ?? "";
    // Typ classification surfaces (omnopsis-backend → Produkt, neckarshore-website → Webseite).
    expect(tableText).toContain("Produkt");
    expect(tableText).toContain("Webseite");
    // §5b: the 0-test scaffold repo and the known-red repo (#257) stay in the rollup, not spotlit.
    expect(tableText).not.toContain("clearpath-52");
    expect(tableText).not.toContain("oakwoodgolfclub-website");
  });

  test("TC-CNT-074: 'Was abgedeckt ist' lists the full 13-test-type scope (no per-type numbers)", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const main = page.locator("main");
    await expect(main).toContainText("13 Testarten");
    const types = page.locator('ul[aria-label="Abgedeckte Testarten"] li');
    await expect(types).toHaveCount(13);
    // A representative span of the 13 is present.
    for (const t of ["Unit", "End-to-End", "Security", "Accessibility", "AI-Eval"]) {
      await expect(types.filter({ hasText: t }).first()).toBeVisible();
    }
  });

  test("TC-CNT-072: sitemap lists /test-management", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("https://neckarshore.ai/test-management");
    // the short-lived old path must NOT be a sitemap entry.
    expect(xml).not.toContain("<loc>https://neckarshore.ai/tests</loc>");
  });

  test("TC-CNT-075: /tests permanently redirects to /test-management (308)", async ({
    request,
  }) => {
    const res = await request.get("/tests", { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toBe("/test-management");
  });

  test("TC-CNT-073: homepage Tests tile links to /test-management with a 'mehr' cue", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.locator('a[data-track="stats_tests_detail"]');
    await expect(link).toHaveAttribute("href", "/test-management");
    await expect(link).toContainText("Automatisierte Tests");
    // The repo count was removed from the tile; a "mehr" cue signals the detail page.
    await expect(page.getByTestId("tests-subline")).toContainText("mehr");
  });
});
