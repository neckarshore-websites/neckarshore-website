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

// --- Per-route WebPage entity (L-NECK-ENTITY-WEBPAGE-ID, 2026-06-28) -------------
// The #1 GEO lever from the 2026-06-28 audit: every route must assert ITSELF as a
// distinct WebPage entity (its own canonical @id), not inherit the homepage's
// "/#webpage". These tests are NON-VACUOUS — they fail on pre-fix code where the
// layout injects one homepage-pinned WebPage on every route.

const BASE = "https://neckarshore.ai";

// Flatten every JSON-LD node across all blocks (expands @graph). Unlike a per-block
// reader, this resolves nodes that live inside a per-route @graph — which is where the
// WebPage + its primary entity are co-located after the fix.
async function ldNodes(
  page: import("@playwright/test").Page,
): Promise<Record<string, unknown>[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return blocks.flatMap((b) => {
    const parsed = JSON.parse(b);
    return (parsed["@graph"] ?? [parsed]) as Record<string, unknown>[];
  });
}

// Next normalises the root canonical to ".../neckarshore.ai" (no trailing slash) while
// the schema url/@id keep the slash (".../neckarshore.ai/"). Strip a single trailing
// slash so the url↔canonical tie holds at the root WITHOUT masking a real url drift on
// sub-routes (they carry no trailing slash on either side).
const stripSlash = (u: string) => u.replace(/\/$/, "");

const webPageNodes = (nodes: Record<string, unknown>[]) =>
  nodes.filter((n) => n["@type"] === "WebPage");

test.describe("SEO — per-route WebPage entity", () => {
  // TC-SEO-031: each route's WebPage @id = `${canonical}#webpage`, url = canonical, and
  // url ties to the page's actual <link rel=canonical> (single-source via the route path).
  const WEBPAGE_ROUTES = [
    "/",
    "/products",
    "/products/flagships",
    "/products/clearpath",
    "/products/websites/neckarshore",
  ];

  for (const path of WEBPAGE_ROUTES) {
    test(`TC-SEO-031 [${path}]: WebPage @id + url derive from the canonical path`, async ({
      page,
    }) => {
      await page.goto(path);
      const webpages = webPageNodes(await ldNodes(page));
      expect(webpages, `exactly one WebPage on ${path}`).toHaveLength(1);
      const wp = webpages[0];
      expect(wp["@id"]).toBe(`${BASE}${path}#webpage`);
      expect(wp.url).toBe(`${BASE}${path}`);

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(stripSlash(String(wp.url))).toBe(stripSlash(String(canonical)));
    });
  }

  // TC-SEO-032: a non-home route's per-route WebPage isPartOf the WebSite node. Scoped to
  // the per-route @id so it is RED pre-fix (no such node exists; only the homepage one).
  test("TC-SEO-032: non-home WebPage isPartOf the WebSite", async ({ page }) => {
    await page.goto("/products/clearpath");
    const wp = (await ldNodes(page)).find(
      (n) =>
        n["@type"] === "WebPage" &&
        n["@id"] === `${BASE}/products/clearpath#webpage`,
    );
    expect(wp, "per-route WebPage node present").toBeTruthy();
    expect((wp!.isPartOf as Record<string, unknown>)?.["@id"]).toBe(
      `${BASE}/#website`,
    );
  });

  // TC-SEO-033: THE anti-regression — two distinct product routes must carry distinct
  // WebPage @ids, and neither may equal the homepage @id. Fails today (all three "/#webpage").
  test("TC-SEO-033: WebPage @id is unique per route", async ({ page }) => {
    await page.goto("/products/clearpath");
    const clearpath = webPageNodes(await ldNodes(page))[0]?.["@id"];
    await page.goto("/products/snakeoil-check");
    const snakeoil = webPageNodes(await ldNodes(page))[0]?.["@id"];
    expect(clearpath).not.toBe(snakeoil);
    expect(clearpath).not.toBe(`${BASE}/#webpage`);
    expect(snakeoil).not.toBe(`${BASE}/#webpage`);
  });

  // TC-SEO-034: the route's WebPage.mainEntity resolves to an actually-present
  // SoftwareApplication @id ON THE SAME PAGE (intra-@graph reference, not a dangling bet).
  test("TC-SEO-034: clearpath WebPage.mainEntity resolves to a present SoftwareApplication", async ({
    page,
  }) => {
    await page.goto("/products/clearpath");
    const nodes = await ldNodes(page);
    const wp = webPageNodes(nodes)[0];
    const mainId = (wp?.mainEntity as Record<string, unknown>)?.["@id"];
    expect(mainId, "WebPage carries a mainEntity ref").toBeTruthy();
    const target = nodes.find(
      (n) => n["@type"] === "SoftwareApplication" && n["@id"] === mainId,
    );
    expect(target, "mainEntity @id matches a SoftwareApplication node").toBeTruthy();
  });

  // TC-SEO-035: completeness guard — DERIVE the indexable route set from the generated
  // sitemap (allProductRoutes + legal + root), never a hand-kept array (a hand list is the
  // exact place a forgotten route slips past the guard meant to catch it). Every derived
  // route must emit exactly one WebPage with `@id === ${BASE}${path}#webpage`.
  test("TC-SEO-035: every indexable route emits exactly one canonical WebPage", async ({
    page,
    request,
  }) => {
    // Sequentially navigates EVERY sitemap route; each first hit triggers an on-demand
    // dev-server compile, and under Playwright's multi-worker contention the default 30s
    // is too tight (a heavy markdown route can stall). Wall-time only — assertions unchanged.
    test.setTimeout(120_000);
    const xml = await (await request.get("/sitemap.xml")).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length, "sitemap yields a non-trivial route set").toBeGreaterThan(5);

    for (const loc of locs) {
      const path = loc.replace(BASE, "") || "/";
      await page.goto(path);
      const webpages = webPageNodes(await ldNodes(page));
      expect(webpages, `exactly one WebPage on ${path}`).toHaveLength(1);
      expect(webpages[0]["@id"], `canonical @id on ${path}`).toBe(
        `${BASE}${path}#webpage`,
      );
    }
  });

  // TC-SEO-036: CO-LOCATION (load-bearing rule 3d) — the WebPage and its mainEntity target
  // must ship in ONE @graph block with a SINGLE @context. This is the lever's whole point:
  // cross-block node merging is an unverifiable Google assumption, so the safe convention is
  // one graph per page. The flatten-everything helpers (TC-SEO-034, validator) would stay
  // green even if the two split into separate <script> blocks — this guards against exactly
  // that regression. Non-vacuous: pre-fix the WebPage carried no mainEntity and the
  // SoftwareApplication was a SEPARATE block → no single @graph block satisfies this.
  test("TC-SEO-036: WebPage + its mainEntity are co-located in one @graph block", async ({
    page,
  }) => {
    await page.goto("/products/clearpath");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    let satisfied = false;
    for (const raw of blocks) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const graph = parsed["@graph"];
      if (!Array.isArray(graph)) continue;
      const wp = graph.find(
        (n: Record<string, unknown>) => n["@type"] === "WebPage",
      ) as Record<string, unknown> | undefined;
      const mainId = (wp?.mainEntity as Record<string, unknown>)?.["@id"];
      if (!mainId) continue;

      // The mainEntity target must be a node IN THIS SAME @graph (intra-block, not cross-block).
      const target = graph.find(
        (n: Record<string, unknown>) => n["@id"] === mainId,
      ) as Record<string, unknown> | undefined;
      expect(target, "mainEntity target co-located in the same @graph block").toBeTruthy();
      expect(target!["@type"]).toBe("SoftwareApplication");

      // Single @context: the wrapper owns it; the folded nodes must NOT carry their own.
      expect(parsed["@context"]).toBe("https://schema.org");
      expect(wp!["@context"], "WebPage node drops its inner @context").toBeUndefined();
      expect(
        target!["@context"],
        "primary-entity node drops its inner @context",
      ).toBeUndefined();
      satisfied = true;
    }
    expect(
      satisfied,
      "a single @graph block holds the WebPage + its mainEntity target",
    ).toBe(true);
  });
});

// --- Meta-description length guard (audit P2-2, 2026-06-28) -----------------------
// Google truncates meta descriptions at ~155 chars: the differentiator at the end of a
// German sentence is dropped, and og:description mirrors it → degraded Slack/LinkedIn/
// WhatsApp previews too. The on-page first passage + the SoftwareApplication/CollectionPage
// schema `description` stay long (GEO citation surface); only `<meta name=description>` is
// decoupled to a short SERP pitch. Routes are DERIVED from the sitemap (authoritative for
// indexable pages — same pattern as TC-SEO-035) plus the noindex detail pages that still
// emit a description we own; never a hand-kept list (that reproduces the blind spot this
// guard exists to catch).
test.describe("SEO — meta description length", () => {
  const MAX = 155;
  // noindex (held out of the sitemap) but still emits a meta/og description we control.
  const EXTRA_NOINDEX = ["/products/restaurant-menu-update"];

  // TC-SEO-037: every indexable + owned route keeps its meta description ≤155 chars. ONE
  // test that COLLECTS all offenders so a failure enumerates the full red set in a single
  // run (TDD: drives the P2-2 rewrite, then guards against regression).
  test("TC-SEO-037: meta description ≤155 chars on every owned route", async ({
    page,
    request,
  }) => {
    // Sequentially navigates every owned route; like TC-SEO-035 the first hit per route
    // compiles on demand in dev, so the default 30s is too tight under worker contention.
    // Wall-time only — the ≤155 assertion is unchanged.
    test.setTimeout(120_000);
    const xml = await (await request.get("/sitemap.xml")).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1].replace(BASE, "") || "/",
    );
    const routes = [...new Set([...locs, ...EXTRA_NOINDEX])];
    expect(routes.length, "route set is non-trivial").toBeGreaterThan(5);

    const offenders: string[] = [];
    for (const path of routes) {
      await page.goto(path);
      const content = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(content, `${path} has a meta description`).toBeTruthy();
      if (content && content.length > MAX) offenders.push(`${path} → ${content.length}`);
    }
    expect(
      offenders,
      `meta descriptions over ${MAX} chars:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  // TC-SEO-038: the decouple INVARIANT — the long citation text (SoftwareApplication schema
  // `description` = the unshortened DEFINITION) must stay LONGER than the short meta pitch. A
  // green TC-SEO-037 alone cannot tell clean decoupling from an accidental shorten-everywhere
  // (both look identical at the meta level); this asserts the OTHER half, so a future regression
  // that routes the short pitch into the schema is caught. Sample page: omnopsis.
  test("TC-SEO-038: schema citation description stays longer than the meta pitch (decouple invariant)", async ({
    page,
  }) => {
    await page.goto("/products/omnopsis");
    const meta = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    const app = (await ldNodes(page)).find(
      (n) => n["@type"] === "SoftwareApplication",
    ) as Record<string, unknown> | undefined;
    expect(app, "SoftwareApplication node present").toBeTruthy();
    const schemaDesc = String(app!.description ?? "");
    expect(meta, "meta description present").toBeTruthy();
    expect(meta!.length, "meta pitch ≤155").toBeLessThanOrEqual(MAX);
    expect(schemaDesc.length, "schema citation text is non-trivial").toBeGreaterThan(180);
    expect(
      schemaDesc.length,
      "schema citation text must stay LONGER than the meta pitch (decouple, not shorten)",
    ).toBeGreaterThan(meta!.length);
  });
});
