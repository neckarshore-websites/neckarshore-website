import { test, expect } from "@playwright/test";

// Data-driven viewports from StatCounter Germany Feb 2026
const viewports = [
  { name: "iPhone 15 Pro", width: 393, height: 852 },
  { name: "iPhone 14 Plus", width: 414, height: 896 },
  { name: "iPad Mini", width: 768, height: 1024 },
];

const pages = ["/", "/impressum", "/datenschutz"];

test.describe("Responsive", () => {
  for (const vp of viewports) {
    for (const path of pages) {
      test(`${path} has no horizontal overflow on ${vp.name} (${vp.width}px)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);

        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasOverflow, `Horizontal overflow on ${path} at ${vp.width}px`).toBe(false);
      });
    }

    test(`nav is usable on ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      if (vp.width < 768) {
        // Mobile: hamburger menu should be visible
        const menuButton = page.locator('nav button[aria-label="Menü öffnen"]');
        await expect(menuButton).toBeVisible();
      } else {
        // Tablet+: desktop nav links should be visible
        const navLink = page.locator('nav a[href="/#services"]');
        await expect(navLink).toBeVisible();
      }
    });
  }
});
