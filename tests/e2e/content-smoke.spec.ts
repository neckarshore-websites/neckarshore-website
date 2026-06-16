// TEMPORARY spec — Task 1 proof that the ported content pipeline renders at a route.
// Removed in Task 2 alongside the temporary /content-smoke route.
import { test, expect } from "@playwright/test";

test("TC-CNT-000: content-smoke route renders the entry body", async ({ page }) => {
  const res = await page.goto("/content-smoke");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Content Smoke Test");
  await expect(page.locator("article")).toContainText("throwaway");
  await expect(page.locator("article ul li")).toHaveCount(2);
});
