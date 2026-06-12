import { test, expect } from "@playwright/test";
import { PAGES } from "./helpers";

// Hardcoded stable IDs — 5 tests per page
const IDS: Record<string, [string, string, string, string, string]> = {
  "/":            ["TC-A11Y-001", "TC-A11Y-002", "TC-A11Y-003", "TC-A11Y-004", "TC-A11Y-005"],
  "/impressum":   ["TC-A11Y-006", "TC-A11Y-007", "TC-A11Y-008", "TC-A11Y-009", "TC-A11Y-010"],
  "/datenschutz": ["TC-A11Y-011", "TC-A11Y-012", "TC-A11Y-013", "TC-A11Y-014", "TC-A11Y-015"],
};

test.describe("Accessibility", () => {
  for (const path of PAGES) {
    const [idH1, idSkip, idLang, idAlt, idAria] = IDS[path];

    test(`${idH1}: ${path} has exactly one H1`, async ({ page }) => {
      await page.goto(path);
      expect(await page.locator("h1").count(), `${path} should have exactly 1 H1`).toBe(1);
    });

    test(`${idSkip}: ${path} has no heading level skips`, async ({ page }) => {
      await page.goto(path);
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
      let lastLevel = 0;

      for (const heading of headings) {
        const level = parseInt((await heading.evaluate((el) => el.tagName)).replace("H", ""));
        if (lastLevel > 0) {
          expect(level <= lastLevel + 1, `${path}: H${lastLevel} → H${level} (skip)`).toBe(true);
        }
        lastLevel = level;
      }
    });

    test(`${idLang}: ${path} has lang attribute on html`, async ({ page }) => {
      await page.goto(path);
      expect(await page.locator("html").getAttribute("lang")).toBe("de");
    });

    test(`${idAlt}: ${path} — all images have alt text`, async ({ page }) => {
      await page.goto(path);
      const images = await page.locator("img").all();
      for (const img of images) {
        const src = await img.getAttribute("src");
        expect(await img.getAttribute("alt"), `Image ${src} on ${path} missing alt`).toBeTruthy();
      }
    });

    test(`${idAria}: ${path} — nav buttons have accessible names`, async ({ page }) => {
      await page.goto(path);
      const buttons = await page.locator("nav button").all();
      for (const button of buttons) {
        const name = (await button.getAttribute("aria-label")) || (await button.textContent())?.trim();
        expect(name, `Button on ${path} without accessible name`).toBeTruthy();
      }
    });
  }
});
