import { test, expect } from "@playwright/test";
import { PAGES, VIEWPORTS } from "./helpers";

// Hardcoded stable IDs — 4 tests per viewport (3 overflow + 1 nav)
const IDS: Record<string, [string, string, string, string]> = {
  "Small phone":    ["TC-RES-013", "TC-RES-014", "TC-RES-015", "TC-RES-016"],
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
      // The logo's wordmark must not run under the first header button. Measured on
      // the ink (widest descendant), not the link box: at 320px the link box shrank to
      // 178px while the wordmark kept drawing to 193px, under the search button.
      const gap = await page.evaluate(() => {
        const logo = document.querySelector('nav a[aria-label="neckarshore.ai Home"]')!;
        const ink = Math.max(
          logo.getBoundingClientRect().right,
          ...[...logo.querySelectorAll("*")].map((e) => e.getBoundingClientRect().right),
        );
        const search = [...document.querySelectorAll('nav button[aria-label="Suche öffnen"]')]
          .find((e) => e.getBoundingClientRect().width > 0)!;
        return search.getBoundingClientRect().left - ink;
      });
      expect(gap, `Logo runs ${-gap}px under the search button at ${vp.width}px`).toBeGreaterThanOrEqual(0);
    });
  }
});
