import { test, expect } from "@playwright/test";

const sections = ["services", "why-nearshore", "omnixis", "founder"];
const SCROLL_TIMEOUT = 5000;

test.describe("Navigation", () => {
  test("homepage loads with visible H1", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  for (const id of sections) {
    test(`homepage nav link scrolls to #${id}`, async ({ page }) => {
      await page.goto("/");
      const link = page.locator(`nav a[href="/#${id}"]`);
      await link.click();
      await expect(page.locator(`#${id}`)).toBeInViewport({ timeout: SCROLL_TIMEOUT });
    });
  }

  for (const subpage of ["/impressum", "/datenschutz"]) {
    test(`nav link from ${subpage} navigates to homepage #services`, async ({
      page,
    }) => {
      await page.goto(subpage);
      const link = page.locator('nav a[href="/#services"]');
      await link.click();
      await expect(page).toHaveURL(/\/#services/);
      await expect(page.locator("#services")).toBeInViewport({ timeout: SCROLL_TIMEOUT });
    });
  }

  test("footer links work", async ({ page }) => {
    await page.goto("/");
    await page.locator('footer a[href="/impressum"]').click();
    await expect(page).toHaveURL("/impressum");

    await page.locator('footer a[href="/datenschutz"]').click();
    await expect(page).toHaveURL("/datenschutz");
  });

  test("logo links to homepage from subpages", async ({ page }) => {
    await page.goto("/impressum");
    await page.locator('nav a[aria-label="neckarshore.ai Home"]').click();
    await expect(page).toHaveURL("/");
  });

  test("mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");

    const menuButton = page.locator('nav button[aria-label="Menü öffnen"]');
    await menuButton.click();

    const mobileNav = page.locator("nav a.block").filter({ hasText: "Services" });
    await expect(mobileNav).toBeVisible();

    const closeButton = page.locator('nav button[aria-label="Menü schließen"]');
    await closeButton.click();
    await expect(mobileNav).not.toBeVisible();
  });
});
