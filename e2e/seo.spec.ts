import { test, expect } from "@playwright/test";

// Hardcoded stable IDs — 2 tests per page + 3 global
const META_TESTS = [
  { id: "TC-SEO-001", path: "/", titleContains: "neckarshore.ai" },
  { id: "TC-SEO-002", path: "/impressum", titleContains: "Impressum" },
  { id: "TC-SEO-003", path: "/datenschutz", titleContains: "Datenschutz" },
];

test.describe("SEO Basics", () => {
  for (const { id, path, titleContains } of META_TESTS) {
    test(`${id}: ${path} has meta title containing "${titleContains}"`, async ({ page }) => {
      await page.goto(path);
      expect(await page.title()).toContain(titleContains);
    });
  }

  const DESC_TESTS = [
    { id: "TC-SEO-004", path: "/" },
    { id: "TC-SEO-005", path: "/impressum" },
    { id: "TC-SEO-006", path: "/datenschutz" },
  ];

  for (const { id, path } of DESC_TESTS) {
    test(`${id}: ${path} has meta description`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    });
  }

  test("TC-SEO-007: homepage has JSON-LD structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    expect(await jsonLd.count()).toBeGreaterThanOrEqual(1);
    const data = JSON.parse((await jsonLd.first().textContent())!);
    expect(data["@context"]).toBe("https://schema.org");
  });

  test("TC-SEO-008: robots.txt is accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("User-agent");
  });

  test("TC-SEO-009: sitemap.xml is accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("<urlset");
  });

  test("TC-SEO-010: homepage has og:image meta tag", async ({ page }) => {
    await page.goto("/");
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute("content", /og-image/);
  });

  test("TC-SEO-011: og:image dimensions are 1200x630", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
      "content",
      "1200",
    );
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
      "content",
      "630",
    );
  });

  test("TC-SEO-012: twitter card is summary_large_image", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      /og-image/,
    );
  });
});
