import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", titleContains: "neckarshore.ai" },
  { path: "/impressum", titleContains: "Impressum" },
  { path: "/datenschutz", titleContains: "Datenschutz" },
];

let tcNum = 1;

test.describe("SEO Basics", () => {
  for (const { path, titleContains } of pages) {
    const id1 = String(tcNum++).padStart(3, "0");
    test(`TC-SEO-${id1}: ${path} has meta title containing "${titleContains}"`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      expect(title).toContain(titleContains);
    });

    const id2 = String(tcNum++).padStart(3, "0");
    test(`TC-SEO-${id2}: ${path} has meta description`, async ({ page }) => {
      await page.goto(path);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.+/);
    });
  }

  test("TC-SEO-007: homepage has JSON-LD structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const content = await jsonLd.first().textContent();
    const data = JSON.parse(content!);
    expect(data["@context"]).toBe("https://schema.org");
  });

  test("TC-SEO-008: robots.txt is accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("User-agent");
  });

  test("TC-SEO-009: sitemap.xml is accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("<urlset");
  });
});
