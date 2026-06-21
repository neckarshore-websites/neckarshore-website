import { test, expect, type Page } from "@playwright/test";

/**
 * Website case-study detail pages — /products/websites/[slug].
 *
 * Verifies the data-driven case-study template (TC-CNT-050..054):
 *   - each of the 4 sites renders: 200, single H1, canonical, the six content-axis
 *     H2 headings, the live external CTA (target=_blank), exactly one CreativeWork JSON-LD;
 *   - the sub-portal card shows BOTH the internal detail link AND the external "Website ↗";
 *   - the OLD flat path /products/<slug> still 404s (no accidental skeleton — data-model guard);
 *   - the sitemap carries the 4 case-study routes, never the bare external domains.
 */

// JSON-LD helper: collect all parsed ld+json blocks on the current page.
async function ldJson(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = page.locator('script[type="application/ld+json"]');
  const count = await blocks.count();
  const parsed: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const txt = await blocks.nth(i).textContent();
    if (txt) parsed.push(JSON.parse(txt));
  }
  return parsed;
}

const AXES = [
  "Ausgangslage",
  "Ansatz",
  "Technik & Architektur",
  "Laufende Pflege",
  "Status",
  "Ausblick",
] as const;

const WEBSITES = [
  { slug: "neckarshore", name: "neckarshore.ai", liveUrl: "https://neckarshore.ai" },
  { slug: "ristorante-goldoni", name: "Ristorante Goldoni", liveUrl: "https://ristorante-goldoni.de" },
  { slug: "oakwood-golf-club", name: "Oakwood Golf Club", liveUrl: "https://oakwoodgolfclub.de" },
  { slug: "rauhut", name: "Rauhut", liveUrl: "https://rauhut.com" },
] as const;

test.describe("Content surface — Website case studies", () => {
  for (const site of WEBSITES) {
    test(`TC-CNT-050 [${site.slug}]: 200, single H1, canonical, one CreativeWork JSON-LD`, async ({
      page,
    }) => {
      const res = await page.goto(`/products/websites/${site.slug}`);
      expect(res?.status()).toBe(200);

      await expect(page.locator("h1")).toHaveCount(1);

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        "href",
        `https://neckarshore.ai/products/websites/${site.slug}`,
      );

      const creativeWorks = (await ldJson(page)).filter(
        (b) => b["@type"] === "CreativeWork",
      );
      expect(creativeWorks).toHaveLength(1);
      const cw = creativeWorks[0];
      expect(cw.name).toBe(site.name);
      expect(String(cw.url)).toBe(
        `https://neckarshore.ai/products/websites/${site.slug}`,
      );
      expect((cw.about as Record<string, unknown>)?.url).toBe(site.liveUrl);
    });

    test(`TC-CNT-051 [${site.slug}]: six content axes, live CTA target=_blank, no overflow @393px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      await page.goto(`/products/websites/${site.slug}`);

      // lang=de
      await expect(page.locator("html")).toHaveAttribute("lang", "de");

      // All six content-axis headings present as H2.
      for (const axis of AXES) {
        await expect(
          page.getByRole("heading", { level: 2, name: axis, exact: true }),
        ).toBeVisible();
      }

      // "Website live ansehen ↗" CTA → the live external domain, new tab, safe rel.
      const liveCta = page.locator(`a[data-track="website_live_cta_${site.slug}"]`);
      await expect(liveCta).toHaveAttribute("href", site.liveUrl);
      await expect(liveCta).toHaveAttribute("target", "_blank");
      await expect(liveCta).toHaveAttribute("rel", /noopener/);

      // No horizontal overflow on a narrow phone viewport.
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("TC-CNT-052: websites sub-portal card links internal case study AND shows external Website ↗", async ({
    page,
  }) => {
    await page.goto("/products/websites");
    for (const site of WEBSITES) {
      // Internal case-study link (title or "Mehr erfahren").
      await expect(
        page.locator(`a[href="/products/websites/${site.slug}"]`).first(),
      ).toBeVisible();
      // External "Website" button → live domain, new tab.
      const live = page.locator(`a[data-track="product_card_live_${site.slug}"]`);
      await expect(live).toHaveAttribute("href", site.liveUrl);
      await expect(live).toHaveAttribute("target", "_blank");
      await expect(live).toHaveAttribute("rel", /noopener/);
    }
  });

  test("TC-CNT-053: the old flat /products/<slug> path still 404s (no accidental skeleton)", async ({
    page,
  }) => {
    for (const site of WEBSITES) {
      const res = await page.goto(`/products/${site.slug}`);
      expect(res?.status()).toBe(404);
    }
  });

  test("TC-CNT-054: sitemap carries the 4 case-study routes, not the bare external domains", async ({
    page,
  }) => {
    const res = await page.goto("/sitemap.xml");
    expect(res?.status()).toBe(200);
    const xml = (await res?.text()) ?? "";
    for (const site of WEBSITES) {
      expect(xml).toContain(
        `https://neckarshore.ai/products/websites/${site.slug}`,
      );
      // The bare live domain must NOT be a sitemap <loc> (we index our case study, not their site).
      expect(xml).not.toContain(`<loc>${site.liveUrl}</loc>`);
    }
  });
});
