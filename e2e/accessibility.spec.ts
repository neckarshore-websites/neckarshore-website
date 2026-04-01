import { test, expect } from "@playwright/test";

const pages = ["/", "/impressum", "/datenschutz"];

let tcNum = 1;

test.describe("Accessibility", () => {
  for (const path of pages) {
    const id1 = String(tcNum++).padStart(3, "0");
    test(`TC-A11Y-${id1}: ${path} has exactly one H1`, async ({ page }) => {
      await page.goto(path);
      const h1Count = await page.locator("h1").count();
      expect(h1Count, `${path} should have exactly 1 H1`).toBe(1);
    });

    const id2 = String(tcNum++).padStart(3, "0");
    test(`TC-A11Y-${id2}: ${path} has no heading level skips`, async ({ page }) => {
      await page.goto(path);
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();

      let lastLevel = 0;
      for (const heading of headings) {
        const tag = await heading.evaluate((el) => el.tagName);
        const level = parseInt(tag.replace("H", ""));

        if (lastLevel > 0) {
          expect(
            level <= lastLevel + 1,
            `${path}: H${lastLevel} followed by H${level} (skip)`
          ).toBe(true);
        }
        lastLevel = level;
      }
    });

    const id3 = String(tcNum++).padStart(3, "0");
    test(`TC-A11Y-${id3}: ${path} has lang attribute on html`, async ({ page }) => {
      await page.goto(path);
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe("de");
    });

    const id4 = String(tcNum++).padStart(3, "0");
    test(`TC-A11Y-${id4}: ${path} — all images have alt text`, async ({ page }) => {
      await page.goto(path);
      const images = await page.locator("img").all();

      for (const img of images) {
        const alt = await img.getAttribute("alt");
        const src = await img.getAttribute("src");
        expect(alt, `Image ${src} on ${path} missing alt text`).toBeTruthy();
      }
    });

    const id5 = String(tcNum++).padStart(3, "0");
    test(`TC-A11Y-${id5}: ${path} — nav buttons have accessible names`, async ({ page }) => {
      await page.goto(path);
      const buttons = await page.locator("nav button").all();

      for (const button of buttons) {
        const ariaLabel = await button.getAttribute("aria-label");
        const text = await button.textContent();
        expect(
          ariaLabel || text?.trim(),
          `Button on ${path} without accessible name`
        ).toBeTruthy();
      }
    });
  }
});
