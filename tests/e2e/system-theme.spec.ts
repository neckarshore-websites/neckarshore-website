import { test, expect } from "./fixtures";

/**
 * Light/dark follows the device setting until the visitor uses the toggle.
 * The "before hydration" tests block the app's JavaScript bundles, so only
 * public/theme-init.js can set the class: that is what a visitor sees on the
 * first paint, before React runs. Privacy half: no choice, nothing stored.
 */
const blockApp = (page: import("@playwright/test").Page) =>
  page.route(/\/_next\/static\/chunks\//, (route) => route.abort());
const storedTheme = (page: import("@playwright/test").Page) =>
  page.evaluate(() => localStorage.getItem("theme"));

test("dark device: dark before hydration, nothing stored", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await blockApp(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
  expect(await storedTheme(page)).toBeNull();
});

test("light device: light before hydration", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await blockApp(page);
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/(^|\s)dark(\s|$)/);
});

test("stored light choice beats a dark device before hydration", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await blockApp(page);
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/(^|\s)dark(\s|$)/);
});

test("device switch while open is followed when there is no choice", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.locator('button[aria-label*="Modus wechseln"]').first()).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
  expect(await storedTheme(page)).toBeNull();
});
