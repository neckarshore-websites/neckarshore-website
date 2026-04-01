import { test, expect } from "@playwright/test";

const pages = ["/", "/impressum", "/datenschutz"];

test.describe("Links", () => {
  for (const path of pages) {
    test(`all links on ${path} are valid (no 404)`, async ({ page }) => {
      await page.goto(path);
      const links = await page.locator("a[href]").all();
      const hrefs = new Set<string>();

      for (const link of links) {
        const href = await link.getAttribute("href");
        if (href && !href.startsWith("#") && !href.startsWith("/#") && !href.startsWith("mailto:")) {
          hrefs.add(href);
        }
      }

      for (const href of hrefs) {
        if (href.startsWith("/")) {
          const response = await page.request.get(href);
          expect(response.status(), `${path} → ${href}`).toBeLessThan(400);
        }
      }
    });

    test(`external links on ${path} open in new tab`, async ({ page }) => {
      await page.goto(path);
      const externalLinks = await page
        .locator('a[href^="https://"]')
        .all();

      for (const link of externalLinks) {
        const target = await link.getAttribute("target");
        const rel = await link.getAttribute("rel");
        const href = await link.getAttribute("href");
        expect(target, `${href} missing target="_blank"`).toBe("_blank");
        expect(rel, `${href} missing rel="noopener"`).toContain("noopener");
      }
    });
  }
});
