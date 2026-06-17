import { test, expect } from "@playwright/test";
import { PAGES, VIEWPORTS } from "./helpers";

// Hardcoded stable IDs — 4 tests per viewport (3 overflow + 1 nav)
const IDS: Record<string, [string, string, string, string]> = {
  "iPhone 15 Pro":  ["TC-RES-001", "TC-RES-002", "TC-RES-003", "TC-RES-004"],
  "iPhone 14 Plus": ["TC-RES-005", "TC-RES-006", "TC-RES-007", "TC-RES-008"],
  "iPad Mini":      ["TC-RES-009", "TC-RES-010", "TC-RES-011", "TC-RES-012"],
};

test.describe("Responsive", () => {
  for (const vp of VIEWPORTS) {
    const [id1, id2, id3, idNav] = IDS[vp.name];

    for (const [i, path] of PAGES.entries()) {
      const id = [id1, id2, id3][i];
      test(`${id}: ${path} has no horizontal overflow on ${vp.name} (${vp.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path);
        const hasOverflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(hasOverflow, `Horizontal overflow on ${path} at ${vp.width}px`).toBe(false);
      });
    }

    test(`${idNav}: nav is usable on ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      // Nav switches from hamburger to the desktop row at lg (1024px), so every tested
      // viewport (≤768px) gets the hamburger; the desktop row is covered by navigation.spec
      // at the default Desktop-Chrome viewport (1280px ≥ 1024px).
      if (vp.width < 1024) {
        await expect(page.locator('nav button[aria-label="Menü öffnen"]')).toBeVisible();
      } else {
        await expect(page.locator('nav a[href="/#services"]')).toBeVisible();
      }
    });
  }
});
