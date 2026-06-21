import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test.describe("Stats Tiles @smoke", () => {
  async function getStatValue(
    page: import("@playwright/test").Page,
    label: string,
  ): Promise<string> {
    const tile = page.locator(`text=${label}`).locator("..");
    return (await tile.locator("p.font-heading").textContent())?.trim() || "";
  }

  function parseDE(value: string): number {
    return Number(value.replace(/\./g, ""));
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

  test("TC-STAT-009: Tests tile reflects testScope.total + byType breakdown", async ({
    page,
  }) => {
    const stats = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "stats.json"), "utf-8"),
    );
    const expectedTotal: number = stats.testScope?.total ?? stats.tests;

    await page.goto("/");
    await page.waitForTimeout(1500); // animation settles on the target
    const value = await getStatValue(page, "Automatisierte Tests");
    expect(parseDE(value)).toBe(expectedTotal);

    // The breakdown sub-line is present iff byType has positive entries. Structural on purpose:
    // the test stays green whether or not a backend producer has published a decomposition yet
    // (byType is {} until Bob's Task-1 producer lands — then the sub-line appears automatically).
    const byType: Record<string, number> = stats.testScope?.byType ?? {};
    const positiveTypes = Object.entries(byType).filter(([, n]) => Number(n) > 0);
    const breakdown = page.getByTestId("tests-breakdown");
    if (positiveTypes.length > 0) {
      await expect(breakdown).toBeVisible();
      const text = (await breakdown.textContent()) ?? "";
      for (const [type] of positiveTypes) {
        expect(text).toContain(type);
      }
    } else {
      await expect(breakdown).toHaveCount(0);
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
