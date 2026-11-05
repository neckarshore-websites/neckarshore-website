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
    await expect(page.locator("h1")).toHaveCount(1);
    const card = page.locator(`[data-post-card="${SLUG}"]`);
    await expect(card).toBeVisible();
    await expect(card.locator("h2 a")).toHaveAttribute("href", POST);
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

test.describe("Blog — OGC parity (Founder 2026-11-05)", () => {
  // Written so they hold with one published post as well as with the preview's test drafts:
  // they check what IS rendered, never how many posts exist.

  test("TC-BLOG-030: /blog has the category column, every entry ≥44px, and every card a Weiterlesen link", async ({ page }) => {
    await page.goto("/blog");
    const nav = page.locator("[data-category-nav]");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Alle Beiträge" })).toHaveAttribute("aria-current", "page");
    for (const box of await nav.locator("a").evaluateAll((as) => as.map((a) => a.getBoundingClientRect().height))) {
      expect(box, "category entry tap height").toBeGreaterThanOrEqual(44);
    }
    const cards = page.locator("[data-post-card]");
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const slug = await cards.nth(i).getAttribute("data-post-card");
      // Both halves: the VISIBLE text (what the Founder asked for) and the accessible name
      // (which must contain the visible text — WCAG 2.5.3). Probing showed that checking the
      // accessible name alone stays green when the visible label changes.
      const cta = cards.nth(i).locator("a[data-track='blog_card_cta']");
      await expect(cta).toHaveText(/^Weiterlesen/);
      await expect(cta).toHaveAccessibleName(/^Weiterlesen/);
      await expect(cta).toHaveAttribute("href", `/blog/${slug}`);
      expect((await cta.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("TC-BLOG-031: a category page names its category, marks it current, and its count matches its cards", async ({ page }) => {
    await page.goto("/blog");
    const first = page.locator("[data-category-nav] a[href^='/blog/kategorie/']").first();
    const href = await first.getAttribute("href");
    await page.goto(href!);
    const current = page.locator("[data-category-nav] a[aria-current='page']");
    await expect(current).toHaveAttribute("href", href!);
    const name = (await page.locator("h1").textContent())?.trim();
    expect((await current.textContent())?.startsWith(name!)).toBe(true);
    const count = Number((await current.locator("span").textContent())?.replace(/\D/g, ""));
    await expect(page.locator("[data-post-card]")).toHaveCount(count);
  });

  test("TC-BLOG-032: the article foot — category chips, Markdown export and 'Alle Beiträge'; neighbours render title and category", async ({ page }) => {
    await page.goto(POST);
    const chips = page.locator("[data-post-categories] a");
    expect(await chips.count()).toBeGreaterThan(0);
    for (const href of await chips.evaluateAll((as) => as.map((a) => a.getAttribute("href")))) {
      expect(href).toMatch(/^\/blog\/kategorie\/[a-z0-9-]+$/);
    }
    await expect(page.locator(`a[href="/api/export?path=${encodeURIComponent(POST)}"]`)).toHaveCount(1);
    await expect(page.getByRole("link", { name: "← Alle Beiträge" })).toHaveAttribute("href", "/blog");
    for (const nav of await page.locator("[data-post-nav]").all()) {
      await expect(nav).toHaveAttribute("href", /^\/blog\/[a-z0-9-]+$/);
      expect((await nav.locator("span").nth(1).textContent())?.trim().length ?? 0).toBeGreaterThan(0);
      expect((await nav.locator("span").nth(2).textContent())?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  test("TC-BLOG-033: the Markdown export of the article carries the figure tables and no marker", async ({ request }) => {
    const res = await request.get(`/api/export?path=${encodeURIComponent(POST)}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/markdown");
    const md = await res.text();
    expect(md).toContain("| MuscleCat | Stufe |");
    expect(md).toContain("## Weiterführend");
    expect(md).not.toContain("<!--");
  });

  test("TC-BLOG-034: Weiterführend — external links open safely in a new tab, internal ones stay", async ({ page }) => {
    await page.goto(POST);
    const links = page.locator("[data-further] a");
    expect(await links.count()).toBeGreaterThan(0);
    for (const a of await links.all()) {
      const href = (await a.getAttribute("href"))!;
      if (href.startsWith("https://")) {
        await expect(a).toHaveAttribute("target", "_blank");
        await expect(a).toHaveAttribute("rel", /noopener/);
      } else {
        expect(href).toMatch(/^\/[a-z0-9-/]*$/);
        expect(await a.getAttribute("target")).toBeNull();
      }
    }
  });
});

test.describe("Blog — TL;DR and the test-management list (Founder 2026-11-05)", () => {
  test("TC-BLOG-035: the article opens with the TL;DR — after the cover, before the first section", async ({ page }) => {
    await page.goto(POST);
    const tldr = page.locator("article [data-tldr]");
    await expect(tldr).toBeVisible();
    await expect(tldr.locator("p").first()).toHaveText("TL;DR / Zusammenfassung");
    await expect(tldr).toContainText("Der Upload ist das Tor.");
    const order = await page.locator("article").evaluate((article) => {
      const all = [...article.querySelectorAll("figure, [data-tldr], .prose-content h2")];
      return all.slice(0, 3).map((el) => (el.matches("[data-tldr]") ? "tldr" : el.tagName.toLowerCase()));
    });
    expect(order, "cover, then TL;DR, then the first section heading").toEqual(["figure", "tldr", "h2"]);
  });

  test("TC-BLOG-037: /test-management lists every Testmanagement post and links the category", async ({ page }) => {
    await page.goto("/blog/kategorie/testmanagement");
    const inCategory = await page.locator("[data-post-card]").evaluateAll((cards) =>
      cards.map((c) => `/blog/${c.getAttribute("data-post-card")}`),
    );
    expect(inCategory.length).toBeGreaterThan(0);
    await page.goto("/test-management");
    const listed = await page
      .locator("[data-blog-pointer] li a")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(listed).toEqual(inCategory);
    await expect(page.locator("[data-blog-pointer] a[href='/blog/kategorie/testmanagement']")).toHaveCount(1);
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
