import { test, expect } from "@playwright/test";
import { PAGES, CALENDLY_URL } from "./helpers";

test.describe("Calendly CTAs", () => {
  test("TC-CAL-001: all Calendly links point to correct URL and open externally", async ({ page }) => {
    await page.goto("/");
    const links = await page.locator(`a[href="${CALENDLY_URL}"]`).all();
    expect(links.length).toBeGreaterThanOrEqual(2);

    for (const link of links) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("TC-CAL-002: nav CTA button links to Calendly on all pages", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const navCta = page.locator(`nav a[href="${CALENDLY_URL}"]`);
      await expect(navCta.first()).toBeVisible();
      await expect(navCta.first()).toHaveAttribute("target", "_blank");
    }
  });

  test("TC-CAL-003: Calendly URL is reachable", async ({ request }) => {
    const response = await request.get(CALENDLY_URL);
    expect(response.status()).toBeLessThan(400);
  });
});
