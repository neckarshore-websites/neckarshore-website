import { test, expect } from "@playwright/test";

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
    expect(Number(value)).toBeGreaterThan(0);
  });

  test("TC-STAT-002: Commits count is plausible", async ({ page }) => {
    await page.goto("/");
    // Wait for animation to finish (1200ms duration)
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "Commits");
    expect(parseDE(value)).toBeGreaterThan(100);
  });

  test("TC-STAT-003: Zeilen Code is plausible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "Zeilen Code");
    expect(parseDE(value)).toBeGreaterThan(10000);
  });

  test("TC-STAT-004: Repositories count is plausible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "Repositories");
    expect(Number(value)).toBeGreaterThanOrEqual(10);
    expect(Number(value)).toBeLessThanOrEqual(30);
  });

  test("TC-STAT-005: Tests count is plausible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "Automatisierte Tests");
    expect(parseDE(value)).toBeGreaterThan(100);
  });

  test("TC-STAT-006: Endpoints count is plausible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const value = await getStatValue(page, "REST Endpoints");
    expect(Number(value)).toBeGreaterThan(10);
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
