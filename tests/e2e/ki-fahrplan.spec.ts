import { test, expect } from "@playwright/test";

/** Lead-magnet landing page (planning #3336). */
test.describe("KI-Fahrplan landing page", () => {
  test("TC-CNT-106: the download serves the real PDF, not a page", async ({ page, request }) => {
    await page.goto("/ki-fahrplan");
    const href = await page.getByRole("link", { name: /PDF herunterladen/ }).getAttribute("href");
    expect(href).toBe("/downloads/90-tage-ki-fahrplan.pdf");
    const res = await request.get(href as string);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
    expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("TC-CNT-107: the page collects nothing while the form does not exist", async ({ page }) => {
    // Founder 2026-10-30: open download. A form input here would need the privacy section first.
    await page.goto("/ki-fahrplan");
    await expect(page.locator("main form, main input")).toHaveCount(0);
  });

  test("TC-CNT-108: /ki-beratung and the fahrplan link to each other", async ({ page }) => {
    await page.goto("/ki-beratung");
    await page.locator('main a[href="/ki-fahrplan"]').click();
    await expect(page).toHaveURL(/\/ki-fahrplan$/);
    await expect(page.locator('main a[href="/ki-beratung"]')).toBeVisible();
  });
});
