import { test, expect } from "@playwright/test";
import { SCROLL_TIMEOUT } from "./helpers";

test.describe("Navigation", () => {
  test("TC-NAV-001: homepage loads with visible H1", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  const scrollTests: Record<string, string> = {
    "TC-NAV-002": "services",
    "TC-NAV-003": "why-nearshore",
    "TC-NAV-005": "founder",
  };

  for (const [id, section] of Object.entries(scrollTests)) {
    test(`${id}: homepage nav link scrolls to #${section}`, async ({ page }) => {
      await page.goto("/");
      await page.locator(`nav a[href="/#${section}"]`).click();
      await expect(page.locator(`#${section}`)).toBeInViewport({ timeout: SCROLL_TIMEOUT });
    });
  }

  // TC-NAV-004 was the "Omnopsis" header anchor link; that link was replaced by the
  // Produkte dropdown (2026-06-17). "Produkte" navigates to the portal; the dropdown
  // reveals category shortcuts on hover/focus.
  test("TC-NAV-004: Produkte dropdown reveals the category links on hover", async ({ page }) => {
    await page.goto("/");
    await page.locator("nav").getByRole("link", { name: "Produkte", exact: true }).hover();
    const omnopsisLink = page.locator('nav a[href="/products#tier-omnopsis"]');
    await expect(omnopsisLink).toBeVisible();
    await expect(page.locator('nav a[href="/products#tier-mmps"]')).toBeVisible();
    await expect(page.locator('nav a[href="/products#tier-skills"]')).toBeVisible();
    await omnopsisLink.click();
    await expect(page).toHaveURL(/\/products/);
  });

  test("TC-NAV-006: nav link from /impressum navigates to homepage #services", async ({ page }) => {
    await page.goto("/impressum");
    await page.locator('nav a[href="/#services"]').click();
    await expect(page).toHaveURL(/\/#services/);
    await expect(page.locator("#services")).toBeInViewport({ timeout: SCROLL_TIMEOUT });
  });

  test("TC-NAV-007: nav link from /datenschutz navigates to homepage #services", async ({ page }) => {
    await page.goto("/datenschutz");
    await page.locator('nav a[href="/#services"]').click();
    await expect(page).toHaveURL(/\/#services/);
    await expect(page.locator("#services")).toBeInViewport({ timeout: SCROLL_TIMEOUT });
  });

  test("TC-NAV-008: footer links work", async ({ page }) => {
    await page.goto("/");
    await page.locator('footer a[href="/impressum"]').click();
    await expect(page).toHaveURL("/impressum");
    await page.locator('footer a[href="/datenschutz"]').click();
    await expect(page).toHaveURL("/datenschutz");
  });

  test("TC-NAV-009: logo links to homepage from subpages", async ({ page }) => {
    await page.goto("/impressum");
    await page.locator('nav a[aria-label="neckarshore.ai Home"]').click();
    await expect(page).toHaveURL("/");
  });

  test("TC-NAV-010: mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");
    await page.locator('nav button[aria-label="Menü öffnen"]').click();
    const mobileNav = page.locator("nav a.block").filter({ hasText: "Services" });
    await expect(mobileNav).toBeVisible();
    await page.locator('nav button[aria-label="Menü schließen"]').click();
    await expect(mobileNav).not.toBeVisible();
  });
});
