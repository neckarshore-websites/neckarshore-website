import { test, expect } from "@playwright/test";

test.describe("GitHub Stats", () => {
  async function getStatValue(page: import("@playwright/test").Page, label: string): Promise<string> {
    const tile = page.locator(`text=${label}`).locator("..");
    return (await tile.locator("p.font-heading").textContent())?.trim() || "";
  }

  function parseDE(value: string): number {
    return Number(value.replace(/\./g, ""));
  }

  test("TC-STAT-001: Days since First Commit is plausible", async ({ page }) => {
    await page.goto("/");
    const value = await getStatValue(page, "Days since First Commit");
    expect(Number(value)).toBeGreaterThan(0);
  });

  test("TC-STAT-002: Commits count is plausible", async ({ page }) => {
    await page.goto("/");
    const value = await getStatValue(page, "Commits");
    expect(parseDE(value)).toBeGreaterThan(100);
  });

  test("TC-STAT-003: Zeilen Code is not empty and plausible", async ({ page }) => {
    await page.goto("/");
    const value = await getStatValue(page, "Zeilen Code");
    expect(value).not.toBe("—");
    expect(parseDE(value)).toBeGreaterThan(10000);
  });

  test("TC-STAT-004: Repositories count matches", async ({ page }) => {
    await page.goto("/");
    const value = await getStatValue(page, "Repositories");
    expect(Number(value)).toBe(12);
  });
});
