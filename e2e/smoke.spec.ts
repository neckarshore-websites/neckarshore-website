import { test, expect } from "@playwright/test";
import { PAGES } from "./helpers";

test.describe("Smoke @smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/track", (route) => route.abort());
  });

  test("TC-SMK-001: homepage loads with visible H1", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("TC-SMK-002: key sections present on homepage", async ({ page }) => {
    await page.goto("/");
    for (const id of ["services", "why-nearshore", "omnixis", "founder"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("TC-SMK-003: all pages return 200", async ({ page }) => {
    for (const path of PAGES) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });

  test("TC-SMK-004: tracking endpoint is reachable", async ({ request }) => {
    const res = await request.get("/api/track?day=1970-01-01");
    expect(res.status()).toBe(200);
  });

  test("TC-SMK-005: no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("net::ERR_FAILED")) {
        errors.push(msg.text());
      }
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
});
