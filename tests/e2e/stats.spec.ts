import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test.describe("Stats Tiles @smoke", () => {
  async function getStatValue(
    page: import("@playwright/test").Page,
    label: string,
  ): Promise<string> {
    // Exact match: the Tests-tile sub-line "über N Repositories" contains the word
    // "Repositories", so a substring locator would also hit the Repositories tile label.
    const tile = page.getByText(label, { exact: true }).locator("..");
    return (await tile.locator("p.font-heading").textContent())?.trim() || "";
  }

  function parseDE(value: string): number {
    // Strip the de-DE thousands dot AND the load-bearing "+" the floor-framed Tests tile appends.
    return Number(value.replace(/[.+]/g, ""));
  }

  test("TC-STAT-001: Days since First Commit is plausible", async ({
    page,
  }) => {
    await page.goto("/");
    const value = await getStatValue(page, "Days since First Commit");
    expect(Number(value)).toBeGreaterThan(15);
  });

  test("TC-STAT-002: Commits count is plausible", async ({ page }) => {
    await page.goto("/");
    // Wait for animation to finish (1200ms duration)
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "Commits");
    expect(parseDE(value)).toBeGreaterThan(750);
  });

  test("TC-STAT-003: Zeilen Code is plausible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "Zeilen Code");
    expect(parseDE(value)).toBeGreaterThan(120000);
  });

  test("TC-STAT-004: Repositories count is plausible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "Repositories");
    // Plausibility guard, not an exact count. Post-restructure the stats-config
    // counts all neckarshore-* orgs + omnopsis-ai (31 repos as of 2026-06-12).
    // Generous upper bound leaves headroom for ecosystem growth while still
    // catching an absurd value (e.g. a config that accidentally pulls forks).
    expect(Number(value)).toBeGreaterThanOrEqual(20);
    expect(Number(value)).toBeLessThanOrEqual(100);
  });

  test("TC-STAT-005: Tests count is plausible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "Automatisierte Tests");
    expect(parseDE(value)).toBeGreaterThan(370);
  });

  test("TC-STAT-006: Endpoints count is plausible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "REST Endpoints");
    expect(Number(value)).toBeGreaterThan(75);
  });

  test("TC-STAT-007: No tile shows zero or dash", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const tiles = page.locator("p.font-heading");
    const count = await tiles.count();
    for (let i = 0; i < count; i++) {
      const text = (await tiles.nth(i).textContent())?.trim() || "";
      expect(text).not.toBe("0");
      expect(text).not.toBe("—");
    }
  });

  // TC-STAT-009 (#244): the Tests tile is DATA-DRIVEN off public/stats.json — never a hardcoded
  // literal. Reads the JSON, derives the expected floor-framed display + repo sub-line, and
  // asserts the rendered tile matches. If anyone hardcodes "2.600+"/"über 20 Repositories", a
  // change to stats.json.testScope would make this fail → the regression guard the brief asks for.
  test("TC-STAT-009: Tests tile renders the floor-framed estate total + repo span from stats.json (no literal)", async ({
    page,
  }) => {
    const stats = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "stats.json"), "utf-8"),
    );
    const total: number = stats.testScope?.total ?? stats.tests;
    const isFloor: boolean = stats.testScope?.floor ?? false;
    const repos: number | undefined = stats.testScope?.repos;

    // Mirror src/lib/stats-breakdown.ts flooredTotal: round down to 100 when floor-framed.
    const flooredDisplay = isFloor ? Math.floor(total / 100) * 100 : total;
    const expectedValue = flooredDisplay.toLocaleString("de-DE") + (isFloor ? "+" : "");

    await page.goto("/");
    await page.waitForTimeout(1500); // animation settles on the target

    const value = await getStatValue(page, "Automatisierte Tests");
    expect(value).toBe(expectedValue); // e.g. "2.600+" — exact, derived from JSON not a literal

    // Sub-line = the repo span ("über N Repositories"), never a numeric per-type split.
    const subline = page.getByTestId("tests-subline");
    if (repos) {
      await expect(subline).toBeVisible();
      await expect(subline).toHaveText(`über ${repos} Repositories`);
    } else {
      await expect(subline).toHaveCount(0);
    }
  });

  test("TC-STAT-008: No API call to /api/github-stats", async ({ page }) => {
    const apiCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/github-stats")) {
        apiCalls.push(req.url());
      }
    });
    await page.goto("/");
    await page.waitForTimeout(2000);
    expect(apiCalls).toHaveLength(0);
  });
});
