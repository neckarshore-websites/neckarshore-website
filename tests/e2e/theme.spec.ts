import { test, expect } from "@playwright/test";
import { PAGES, WCAG_AA_RATIO, contrastRatio } from "./helpers";

/**
 * Evaluate foreground + resolved background color for an element.
 * Uses canvas to convert Tailwind v4 lab()/oklch() to rgb().
 */
async function getElementColors(el: import("@playwright/test").Locator) {
  return el.evaluate((element) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;

    function toRgb(cssColor: string): string {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = cssColor;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    }

    function resolveBackground(el: Element): string {
      let parent: Element | null = el;
      while (parent) {
        const bg = getComputedStyle(parent).backgroundColor;
        if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return toRgb(bg);
        parent = parent.parentElement;
      }
      return "rgb(255, 255, 255)";
    }

    return {
      fg: toRgb(getComputedStyle(element).color),
      bg: resolveBackground(element),
      text: (element.textContent || "").slice(0, 30),
    };
  });
}

test.describe("Theme / Dark Mode", () => {
  test("TC-THM-001: theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const toggle = page.locator('button[aria-label*="Modus wechseln"]');
    await expect(toggle.first()).toBeVisible();

    await toggle.first().click();
    await expect(html).toHaveClass(/dark/);
    const darkBg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(darkBg).not.toBe("rgb(255, 255, 255)");

    await toggle.first().click();
    await expect(html).not.toHaveClass(/dark/);
    const lightBg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(lightBg).not.toBe("rgb(15, 23, 42)");
  });

  test("TC-THM-002: accent text has WCAG AA contrast on light background", async ({ page }) => {
    await page.goto("/");
    // Skip logo — logotypes are WCAG-exempt per decision
    const accentEl = page.locator("main .text-accent").first();
    await expect(accentEl).toBeVisible();

    const { fg, bg } = await getElementColors(accentEl);
    const ratio = contrastRatio(fg, bg);
    expect(ratio, `Accent contrast ${ratio.toFixed(1)}:1 below ${WCAG_AA_RATIO}:1`).toBeGreaterThanOrEqual(WCAG_AA_RATIO);
  });

  test("TC-THM-003: headings have WCAG AA contrast on each page in light mode", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const headings = await page.locator("h1, h2").all();

      for (const heading of headings) {
        if (await heading.isVisible()) {
          const { fg, bg, text } = await getElementColors(heading);
          const ratio = contrastRatio(fg, bg);
          expect(ratio, `${path} "${text}" contrast ${ratio.toFixed(1)}:1 below ${WCAG_AA_RATIO}:1`).toBeGreaterThanOrEqual(WCAG_AA_RATIO);
        }
      }
    }
  });
});
