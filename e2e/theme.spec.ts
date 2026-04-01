import { test, expect } from "@playwright/test";

// WCAG AA minimum contrast ratio for normal text
const WCAG_AA_RATIO = 4.5;

// Parse rgb(r, g, b) string to array
function parseRgb(rgb: string): [number, number, number] {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

// Relative luminance per WCAG 2.1
function luminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Contrast ratio per WCAG 2.1
function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(parseRgb(fg));
  const l2 = luminance(parseRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe("Theme / Dark Mode", () => {
  test("TC-THM-001: theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    const toggle = page.locator('button[aria-label*="Modus wechseln"]');
    await expect(toggle.first()).toBeVisible();

    await toggle.first().click();
    await expect(html).toHaveClass(/dark/);

    const darkBg = await page.locator("body").evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(darkBg).not.toBe("rgb(255, 255, 255)");

    await toggle.first().click();
    await expect(html).not.toHaveClass(/dark/);

    const lightBg = await page.locator("body").evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(lightBg).not.toBe("rgb(15, 23, 42)");
  });

  test("TC-THM-002: accent text has WCAG AA contrast on light background", async ({
    page,
  }) => {
    await page.goto("/");

    // Skip logo (.text-accent inside nav) — logotypes are WCAG-exempt per decision
    const accentEl = page.locator("main .text-accent").first();
    await expect(accentEl).toBeVisible();

    // Get rendered pixel colors via canvas to handle lab()/oklch() from Tailwind v4
    const { fg, bg } = await accentEl.evaluate((el) => {
      // Create offscreen canvas to resolve CSS colors to rgb
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

      const style = getComputedStyle(el);
      const fgColor = style.color;

      // Walk up to find nearest non-transparent background
      let parent: Element | null = el;
      let bgColor = "rgb(255, 255, 255)";
      while (parent) {
        const pStyle = getComputedStyle(parent);
        const bg = pStyle.backgroundColor;
        if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          bgColor = bg;
          break;
        }
        parent = parent.parentElement;
      }

      return { fg: toRgb(fgColor), bg: toRgb(bgColor) };
    });

    const ratio = contrastRatio(fg, bg);
    expect(
      ratio,
      `Accent contrast ${ratio.toFixed(1)}:1 below WCAG AA ${WCAG_AA_RATIO}:1 (fg=${fg}, bg=${bg})`
    ).toBeGreaterThanOrEqual(WCAG_AA_RATIO);
  });

  test("TC-THM-003: headings have WCAG AA contrast on each page in light mode", async ({
    page,
  }) => {
    for (const path of ["/", "/impressum", "/datenschutz"]) {
      await page.goto(path);

      const headings = await page.locator("h1, h2").all();
      for (const heading of headings) {
        if (await heading.isVisible()) {
          const { fg, bg, text } = await heading.evaluate((el) => {
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

            const style = getComputedStyle(el);
            let parent: Element | null = el;
            let parentBg = "rgb(255, 255, 255)";
            while (parent) {
              const pStyle = getComputedStyle(parent);
              if (pStyle.backgroundColor !== "rgba(0, 0, 0, 0)" && pStyle.backgroundColor !== "transparent") {
                parentBg = pStyle.backgroundColor;
                break;
              }
              parent = parent.parentElement;
            }
            return { fg: toRgb(style.color), bg: toRgb(parentBg), text: el.textContent?.slice(0, 30) || "" };
          });

          const ratio = contrastRatio(fg, bg);
          expect(
            ratio,
            `${path} heading "${text}" contrast ${ratio.toFixed(1)}:1 below ${WCAG_AA_RATIO}:1`
          ).toBeGreaterThanOrEqual(WCAG_AA_RATIO);
        }
      }
    }
  });
});
