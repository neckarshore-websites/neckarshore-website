import { test, expect } from "@playwright/test";
import { PAGES } from "./helpers";

// Hardcoded stable IDs — 3 tests per page
const IDS: Record<string, [string, string, string]> = {
  "/":            ["TC-LNK-001", "TC-LNK-002", "TC-LNK-003"],
  "/impressum":   ["TC-LNK-004", "TC-LNK-005", "TC-LNK-006"],
  "/datenschutz": ["TC-LNK-007", "TC-LNK-008", "TC-LNK-009"],
};

test.describe("Links", () => {
  for (const path of PAGES) {
    const [idValid, idTab, idReach] = IDS[path];

    test(`${idValid}: all links on ${path} are valid (no 404)`, async ({ page }) => {
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

    test(`${idTab}: external links on ${path} open in new tab`, async ({ page }) => {
      await page.goto(path);
      const externalLinks = await page.locator('a[href^="https://"]').all();

      for (const link of externalLinks) {
        const href = await link.getAttribute("href");
        expect(await link.getAttribute("target"), `${href} missing target="_blank"`).toBe("_blank");
        expect(await link.getAttribute("rel"), `${href} missing rel="noopener"`).toContain("noopener");
      }
    });

    // @external — hits third-party hosts (EU ODR, etc.); excluded from the CI
    // gate (datacenter IPs get bot-blocked → false fails). External liveness is
    // covered by the link-crawler cron. Runs in full local `npm run test:e2e`.
    test(`${idReach}: external links on ${path} are reachable`, { tag: "@external" }, async ({ page, request }) => {
      await page.goto(path);
      const externalLinks = await page.locator('a[href^="https://"]').all();
      const hrefs = new Set<string>();

      for (const link of externalLinks) {
        const href = await link.getAttribute("href");
        if (href) hrefs.add(href);
      }

      for (const href of hrefs) {
        const response = await request.get(href);
        expect(response.status(), `${href} not reachable`).toBeLessThan(400);
      }
    });
  }
});
