import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", titleContains: "neckarshore.ai" },
  { path: "/impressum", titleContains: "Impressum" },
  { path: "/datenschutz", titleContains: "Datenschutz" },
];

test.describe("SEO Basics", () => {
  for (const { path, titleContains } of pages) {
    test(`${path} has meta title containing "${titleContains}"`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      expect(title).toContain(titleContains);
    });

    test(`${path} has meta description`, async ({ page }) => {
      await page.goto(path);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.+/);
    });
  }

  test("homepage has JSON-LD structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const content = await jsonLd.first().textContent();
    const data = JSON.parse(content!);
    expect(data["@context"]).toBe("https://schema.org");
  });

  test("robots.txt is accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("User-agent");
  });

  test("sitemap.xml is accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("<urlset");
  });
});
