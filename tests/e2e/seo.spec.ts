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

  // --- /products surface hygiene (SEO/GEO audit 2026-06-28, Gate-3 mechanical fixes) ---

  // Helper: collect every JSON-LD @type rendered on a page (handles @graph + standalone nodes).
  async function ldTypes(page: import("@playwright/test").Page): Promise<string[]> {
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    return blocks.flatMap((b) => {
      const parsed = JSON.parse(b);
      const nodes = parsed["@graph"] ?? [parsed];
      return nodes.map((n: { "@type"?: string }) => n["@type"]).filter(Boolean);
    });
  }

  // TC-SEO-027: title ≤ 70 chars on every /products surface page (SERP-truncation guard).
  const PRODUCT_TITLE_PATHS = [
    "/products",
    "/products/flagships",
    "/products/mmps",
    "/products/skills",
    "/products/websites",
    "/products/omnopsis",
    "/products/clearpath",
    "/products/snakeoil-check",
    "/products/phonesis",
    "/products/local-seo-hub",
    "/products/prod-or-pretend",
    "/products/obsidian-vault-autopilot",
    "/products/ai-phrase-check",
    "/products/social-scrapers",
    "/products/imap-mailbox-cleanup",
    "/products/restaurant-menu-update",
    "/products/websites/neckarshore",
    "/products/websites/ristorante-goldoni",
    "/products/websites/oakwood-golf-club",
    "/products/websites/rauhut",
  ];

  for (const path of PRODUCT_TITLE_PATHS) {
    test(`TC-SEO-027: ${path} title is ≤ 70 chars`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      expect(title.length, `title too long (${title.length}): "${title}"`).toBeLessThanOrEqual(70);
    });
  }

  // TC-SEO-028: /products portal emits a BreadcrumbList (sibling sub-portals all do).
  test("TC-SEO-028: /products has a BreadcrumbList JSON-LD node", async ({ page }) => {
    await page.goto("/products");
    expect(await ldTypes(page)).toContain("BreadcrumbList");
  });

  // TC-SEO-029: social-scrapers is a PRIVATE product — its SoftwareApplication must not
  // claim a `url` (the marketing-page URL is not where the software is accessible).
  test("TC-SEO-029: social-scrapers SoftwareApplication has no url", async ({ page }) => {
    await page.goto("/products/social-scrapers");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const softwareNodes = blocks
      .flatMap((b) => {
        const parsed = JSON.parse(b);
        return parsed["@graph"] ?? [parsed];
      })
      .filter((n: { "@type"?: string }) => n["@type"] === "SoftwareApplication");
    expect(softwareNodes.length).toBeGreaterThan(0);
    for (const node of softwareNodes) {
      expect(node.url, "private-product SoftwareApplication must omit url").toBeUndefined();
    }
  });

  // TC-SEO-030: the neckarshore.ai case-study title must name the brand exactly once
  // (the generic "<name> — Website-Projekt | neckarshore.ai" template double-brands here).
  test("TC-SEO-030: websites/neckarshore title has no double-branding", async ({ page }) => {
    await page.goto("/products/websites/neckarshore");
    const title = await page.title();
    const count = (title.match(/neckarshore\.ai/g) ?? []).length;
    expect(count, `brand appears ${count}× in "${title}"`).toBe(1);
  });
});
