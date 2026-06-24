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

  test("TC-SEO-021: robots.txt names OAI-SearchBot", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("OAI-SearchBot");
  });

  test("TC-SEO-022: llms.txt lists the products surface", async ({ request }) => {
    const body = await (await request.get("/llms.txt")).text();
    expect(body).toContain("/products/snakeoil-check");
    expect(body.toLowerCase()).toContain("products");
  });

  test("TC-SEO-025: robots.txt names Bingbot", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("Bingbot");
  });

  test("TC-SEO-026: llms.txt lists the website case studies", async ({ request }) => {
    const body = await (await request.get("/llms.txt")).text();
    // G1: the 4 internal case-study URLs must be discoverable, not just the sub-portal.
    for (const slug of [
      "/products/websites/neckarshore",
      "/products/websites/ristorante-goldoni",
      "/products/websites/oakwood-golf-club",
      "/products/websites/rauhut",
    ]) {
      expect(body).toContain(slug);
    }
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

  // OG description length — LinkedIn recommends ≥100 chars, OpenGraph.xyz recommends 110-160
  const OG_DESC_LENGTH_TESTS = [
    { id: "TC-SEO-015", path: "/" },
    { id: "TC-SEO-016", path: "/impressum" },
    { id: "TC-SEO-017", path: "/datenschutz" },
  ];

  for (const { id, path } of OG_DESC_LENGTH_TESTS) {
    test(`${id}: ${path} og:description is at least 110 characters`, async ({ page }) => {
      await page.goto(path);
      const content = await page
        .locator('meta[property="og:description"]')
        .getAttribute("content");
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThanOrEqual(110);
    });
  }

  // Canonical URL — every page must have an explicit canonical to prevent duplicate content
  const CANONICAL_TESTS = [
    { id: "TC-SEO-018", path: "/", canonical: "https://neckarshore.ai" },
    { id: "TC-SEO-019", path: "/impressum", canonical: "https://neckarshore.ai/impressum" },
    { id: "TC-SEO-020", path: "/datenschutz", canonical: "https://neckarshore.ai/datenschutz" },
  ];

  for (const { id, path, canonical } of CANONICAL_TESTS) {
    test(`${id}: ${path} has correct canonical URL`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    });
  }

  // OG metadata consistency per page — prevents drift where subpages
  // inherit the homepage OG title/url instead of their own.
  const OG_DRIFT_TESTS = [
    {
      id: "TC-SEO-013",
      path: "/impressum",
      ogTitleContains: "Impressum",
      ogUrlContains: "/impressum",
    },
    {
      id: "TC-SEO-014",
      path: "/datenschutz",
      ogTitleContains: "Datenschutz",
      ogUrlContains: "/datenschutz",
    },
  ];

  for (const { id, path, ogTitleContains, ogUrlContains } of OG_DRIFT_TESTS) {
    test(`${id}: ${path} has page-specific og:title and og:url`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        new RegExp(ogTitleContains),
      );
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        new RegExp(ogUrlContains),
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        /og-image/,
      );
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
    });
  }
});
