import { test, expect, type Page } from "@playwright/test";

/**
 * Blog — TC-BLOG-020 to TC-BLOG-029 (the unit tests of the loader are TC-BLOG-001 to -012).
 *
 * The e2e suite runs against `next dev`, where the draft gate shows drafts, so these tests see
 * the first post while it is still a draft. What they guard:
 *   - the list and the article render, with one H1 and the BlogPosting in the route's @graph;
 *   - the three HTML figures arrive, in order, and no marker text leaks into the page;
 *   - OGC's blog UX floors: no text a reader must read under 14px (point 5), 44px tap targets
 *     for the reading surface's own links (point 10), no horizontal overflow on a phone;
 *   - a draft says noindex, and a published post does not;
 *   - the desktop nav row fits on one line from 1024px (TC-RES-030, the defect the "Blog" entry
 *     made visible: labels already wrapped at 1024px before it).
 */

const BASE = "https://neckarshore.ai";
const SLUG = "risikobasierte-teststrategie-ios";
const POST = `/blog/${SLUG}`;

async function ldNodes(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((b) => {
    const parsed = JSON.parse(b);
    return (parsed["@graph"] ?? [parsed]) as Record<string, unknown>[];
  });
}

test.describe("Blog", () => {
  test("TC-BLOG-020: /blog lists the first post, the title is the card's link", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toHaveText("Blog");
    const card = page.locator(`[data-post-card="${SLUG}"]`);
    await expect(card).toBeVisible();
    await expect(card.locator(`a[href="${POST}"]`)).toHaveCount(1);
  });

  test("TC-BLOG-021: the article has exactly one H1 and its BlogPosting names author and publisher", async ({ page }) => {
    await page.goto(POST);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Wir testen nicht mehr alles. Wir testen, was brechen kann.");

    const nodes = await ldNodes(page);
    const posting = nodes.find((n) => n["@type"] === "BlogPosting");
    expect(posting, "BlogPosting present").toBeTruthy();
    expect(posting!["@id"]).toBe(`${BASE}${POST}#article`);
    expect((posting!.author as Record<string, unknown>)["@id"]).toBe(`${BASE}/#founder`);
    expect((posting!.publisher as Record<string, unknown>)["@id"]).toBe(`${BASE}/#organization`);

    const webpage = nodes.find((n) => n["@type"] === "WebPage" && n["@id"] === `${BASE}${POST}#webpage`);
    expect((webpage?.mainEntity as Record<string, unknown>)?.["@id"]).toBe(`${BASE}${POST}#article`);
  });

  test("TC-BLOG-022: the three figures render in order and no marker text reaches the page", async ({ page }) => {
    await page.goto(POST);
    const ids = await page.locator("article [data-figure]").evaluateAll((els) =>
      els.map((e) => e.getAttribute("data-figure")),
    );
    expect(ids).toEqual([
      "teststrategie-risikoregister",
      "teststrategie-testlaeufe",
      "teststrategie-vokabular",
    ]);
    for (const id of ids) {
      await expect(page.locator(`[data-figure="${id}"] figcaption`)).not.toBeEmpty();
    }
    const html = await page.locator("article").innerHTML();
    expect(html).not.toContain("figur:");
  });

  test("TC-BLOG-023: no text inside the article is smaller than 14px (blog UX standard, point 5)", async ({ page }) => {
    await page.goto(POST);
    const tooSmall = await page.locator("article").evaluate((article) => {
      const offenders: string[] = [];
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent?.trim();
        const parent = node.parentElement;
        if (!text || !parent) continue;
        const size = parseFloat(getComputedStyle(parent).fontSize);
        if (size < 14) offenders.push(`${size}px: ${text.slice(0, 40)}`);
      }
      return offenders;
    });
    expect(tooSmall, "text under 14px").toEqual([]);
  });

  test("TC-BLOG-024: the AI note and the 'Alle Beiträge' link meet their floors", async ({ page }) => {
    await page.goto(POST);
    const note = page.locator("[data-ai-note]");
    await expect(note).toHaveText("Dieser Artikel ist mit KI-Unterstützung entstanden und von mir redigiert.");
    const back = page.getByRole("link", { name: "Alle Beiträge" });
    const box = await back.boundingBox();
    expect(box?.height ?? 0, "tap target height").toBeGreaterThanOrEqual(44);
  });

  for (const path of ["/blog", POST]) {
    test(`TC-BLOG-025 [${path}]: no horizontal overflow at 393px`, async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow on ${path}`).toBe(0);
    });
  }

  test("TC-BLOG-026: a draft says noindex, a published post does not", async ({ page }) => {
    await page.goto(POST);
    const isDraft = (await page.locator("[data-draft-banner]").count()) > 0;
    const robots = await page.locator('meta[name="robots"]').getAttribute("content").catch(() => null);
    if (isDraft) {
      expect(robots ?? "", "a draft must carry noindex").toContain("noindex");
    } else {
      expect(robots ?? "", "a published post must be indexable").not.toContain("noindex");
    }
  });

  test("TC-BLOG-027: the nav carries a Blog entry, and /test-management points to the article", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('nav a[href="/blog"]').first()).toBeVisible();
    await page.goto("/test-management");
    await expect(page.locator(`[data-blog-pointer] a[href="${POST}"]`)).toHaveCount(1);
  });

  test("TC-BLOG-028: the cover image has its alt text and intrinsic size (no layout shift)", async ({ page }) => {
    await page.goto(POST);
    const cover = page.locator("article figure img").first();
    expect((await cover.getAttribute("alt"))?.length ?? 0).toBeGreaterThan(40);
    expect(await cover.getAttribute("width")).toBe("1920");
    expect(await cover.getAttribute("height")).toBe("1080");
  });
});

test.describe("Responsive — desktop nav row", () => {
  for (const width of [1024, 1280]) {
    test(`TC-RES-030 [${width}px]: the desktop nav fits one line, no label wraps`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const row = page.locator("nav div.lg\\:flex").first();
      await expect(row).toBeVisible();
      const result = await row.evaluate((el) => {
        const container = el.parentElement!;
        // A label wraps when its text sits on more than one line box. Measured on the text
        // nodes only: the Produkte chevron is an SVG centred beside the text, and counting its
        // box as a "line" would call a one-line label wrapped.
        const wrapped = [...el.querySelectorAll("a")]
          .filter((a) => {
            const tops: number[] = [];
            const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
            for (let n = walker.nextNode(); n; n = walker.nextNode()) {
              if (!n.textContent?.trim()) continue;
              const range = document.createRange();
              range.selectNodeContents(n);
              for (const rect of range.getClientRects()) tops.push(rect.top);
            }
            return tops.length > 0 && Math.max(...tops) - Math.min(...tops) > 4;
          })
          .map((a) => a.textContent?.trim());
        return { overflow: container.scrollWidth - container.clientWidth, wrapped };
      });
      expect(result.overflow, "nav row overflow").toBeLessThanOrEqual(0);
      expect(result.wrapped, "labels on two lines").toEqual([]);
    });
  }
});
