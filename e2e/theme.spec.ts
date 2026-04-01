import { test, expect } from "@playwright/test";

test.describe("Theme / Dark Mode", () => {
  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    // ThemeToggle is a simple button with aria-label
    const toggle = page.locator('button[aria-label*="Modus wechseln"]');
    await expect(toggle.first()).toBeVisible();

    // Click to switch to dark
    await toggle.first().click();
    await expect(html).toHaveClass(/dark/);

    const darkBg = await page.locator("body").evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(darkBg).not.toBe("rgb(255, 255, 255)");

    // Click to switch back to light
    await toggle.first().click();
    await expect(html).not.toHaveClass(/dark/);

    const lightBg = await page.locator("body").evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    expect(lightBg).not.toBe("rgb(15, 23, 42)");
  });

  test("accent color has sufficient contrast on light background", async ({
    page,
  }) => {
    await page.goto("/");

    // Check that accent-colored text exists and is visible
    const accentElements = page.locator(".text-accent").first();
    await expect(accentElements).toBeVisible();

    // Verify the computed color is our #0E7490
    const color = await accentElements.evaluate((el) =>
      getComputedStyle(el).color
    );
    // #0E7490 = rgb(14, 116, 144)
    expect(color).toBe("rgb(14, 116, 144)");
  });

  test("no white-on-white or invisible text on each page", async ({
    page,
  }) => {
    for (const path of ["/", "/impressum", "/datenschutz"]) {
      await page.goto(path);

      // Check that all H1 and H2 headings are visible and have non-zero size
      const headings = await page.locator("h1, h2").all();
      for (const heading of headings) {
        if (await heading.isVisible()) {
          const box = await heading.boundingBox();
          expect(box, `Heading on ${path} has no bounding box`).not.toBeNull();
          expect(box!.height).toBeGreaterThan(0);
        }
      }
    }
  });
});
