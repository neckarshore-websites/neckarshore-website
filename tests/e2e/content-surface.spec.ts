import { test, expect, type Page } from "@playwright/test";

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

// Count words (letter/number tokens) in an element's visible text.
function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

const GLOSSAR_ENTRIES = [
  {
    slug: "bestaetigungsfehler",
    term: "Bestätigungsfehler",
    leadContains: "Neigung, Informationen so zu suchen",
  },
  {
    slug: "ueberlebenden-verzerrung",
    term: "Überlebenden-Verzerrung",
    leadContains: "nur die sichtbaren Erfolge zu betrachten",
  },
  {
    slug: "versunkene-kosten-falle",
    term: "Versunkene-Kosten-Falle",
    leadContains: "an einer Sache festzuhalten",
  },
] as const;

test.describe("Content surface — Glossar", () => {
  test("TC-CNT-001: glossar index lists every entry and links to it", async ({ page }) => {
    const res = await page.goto("/glossar");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Kognitive Verzerrungen");
    for (const entry of GLOSSAR_ENTRIES) {
      await expect(
        page.locator(`a[href="/glossar/${entry.slug}"]`).first(),
      ).toBeVisible();
    }
  });

  for (const entry of GLOSSAR_ENTRIES) {
    test.describe(`entry: ${entry.slug}`, () => {
      test(`TC-CNT-002 [${entry.slug}]: 200, single H1 = term`, async ({ page }) => {
        const res = await page.goto(`/glossar/${entry.slug}`);
        expect(res?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toContainText(entry.term);
      });

      test(`TC-CNT-003 [${entry.slug}]: definition is the first content paragraph`, async ({
        page,
      }) => {
        await page.goto(`/glossar/${entry.slug}`);
        await expect(page.locator("article p").first()).toContainText(entry.leadContains);
      });

      test(`TC-CNT-004 [${entry.slug}]: valid DefinedTerm JSON-LD`, async ({ page }) => {
        await page.goto(`/glossar/${entry.slug}`);
        const definedTerm = (await ldJson(page)).find((b) => b["@type"] === "DefinedTerm");
        expect(definedTerm).toBeTruthy();
        expect(definedTerm!.name).toBe(entry.term);
        expect(definedTerm!.inDefinedTermSet).toBeTruthy();
        expect(String(definedTerm!.url)).toContain(`/glossar/${entry.slug}`);
      });

      test(`TC-CNT-005 [${entry.slug}]: links back to /products/clearpath`, async ({ page }) => {
        await page.goto(`/glossar/${entry.slug}`);
        await expect(
          page.locator('article a[href="/products/clearpath"]').first(),
        ).toBeVisible();
      });

      test(`TC-CNT-006 [${entry.slug}]: body is a citable unit (<= 160 words)`, async ({
        page,
      }) => {
        await page.goto(`/glossar/${entry.slug}`);
        const text = await page.locator("article").innerText();
        expect(wordCount(text)).toBeLessThanOrEqual(160);
      });

      test(`TC-CNT-007 [${entry.slug}]: carries the "Wie dieser Text entstand" note`, async ({
        page,
      }) => {
        await page.goto(`/glossar/${entry.slug}`);
        await expect(page.getByText("Wie dieser Text entstand")).toBeVisible();
      });
    });
  }
});

test.describe("Content surface — Products index", () => {
  test("TC-CNT-010: /products renders 200 with the four category headings", async ({ page }) => {
    const res = await page.goto("/products");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    for (const tier of ["Flagships", "MMPs", "Skills", "Websites"]) {
      await expect(
        page.getByRole("heading", { name: tier, exact: true, level: 2 }),
      ).toBeVisible();
    }
  });

  test("TC-CNT-011: ClearPath card links to /products/clearpath", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator('a[href="/products/clearpath"]').first()).toBeVisible();
  });

  test("TC-CNT-013: Omnopsis card links to /products/omnopsis", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator('a[href="/products/omnopsis"]').first()).toBeVisible();
  });

  // Portal = teaser: only the featured Top-N per category + a "mehr" tile; the
  // remainder lives on the sub-portal (2026-06-18 top-3 reframe).
  test("TC-CNT-014: portal shows only featured MMPs + a 'mehr' tile, dropped MMPs absent", async ({
    page,
  }) => {
    await page.goto("/products");
    // featured Top-3 present on the portal teaser
    for (const slug of ["clearpath", "snakeoil-check", "phonesis"]) {
      await expect(page.locator(`a[href="/products/${slug}"]`).first()).toBeVisible();
    }
    // non-featured MMPs are NOT on the teaser (they live on the sub-portal)
    for (const slug of ["local-seo-hub", "prod-or-pretend"]) {
      await expect(page.locator(`a[href="/products/${slug}"]`)).toHaveCount(0);
    }
    // the "mehr" tile links to the MMP sub-portal and signals the remainder
    const more = page.locator('a[data-track="nav_products_mmps_more"]');
    await expect(more).toBeVisible();
    await expect(more).toHaveAttribute("href", "/products/mmps");
    await expect(more).toContainText("weitere");
  });

  test("TC-CNT-015: the MMP sub-portal lists the FULL category (featured + dropped)", async ({
    page,
  }) => {
    await page.goto("/products/mmps");
    for (const slug of [
      "clearpath",
      "snakeoil-check",
      "phonesis",
      "local-seo-hub",
      "prod-or-pretend",
    ]) {
      await expect(page.locator(`a[href="/products/${slug}"]`).first()).toBeVisible();
    }
  });

  test("TC-CNT-012: no empty or placeholder internal links", async ({ page }) => {
    await page.goto("/products");
    const hrefs = await page
      .locator("main a")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
    }
  });

  // The "Extern" badge was misleading (it labelled a project, not an action). Website-tier
  // cards now carry a plain "Website" badge; the external link still opens in a new tab.
  test("TC-CNT-016: website cards are labelled 'Website', not 'Extern'", async ({ page }) => {
    await page.goto("/products/websites");
    await expect(page.getByText("Extern", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Website", { exact: true }).first()).toBeVisible();
  });
});

test.describe("Content surface — ClearPath product", () => {
  test("TC-CNT-020: 200, single H1, definition lead is the first paragraph", async ({
    page,
  }) => {
    const res = await page.goto("/products/clearpath");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("ClearPath");
    await expect(page.locator("article p").first()).toContainText(
      "Beschreibe eine Entscheidung",
    );
  });

  test("TC-CNT-021: live-app link present and rel-correct", async ({ page }) => {
    await page.goto("/products/clearpath");
    const live = page.locator('a[href="https://clearpath-52.vercel.app"]').first();
    await expect(live).toBeVisible();
    await expect(live).toHaveAttribute("target", "_blank");
    await expect(live).toHaveAttribute("rel", /noopener/);
  });

  test("TC-CNT-022: links to all three related glossary entries", async ({ page }) => {
    await page.goto("/products/clearpath");
    for (const slug of [
      "bestaetigungsfehler",
      "ueberlebenden-verzerrung",
      "versunkene-kosten-falle",
    ]) {
      await expect(page.locator(`a[href="/glossar/${slug}"]`).first()).toBeVisible();
    }
  });

  test("TC-CNT-023: emits exactly one SoftwareApplication JSON-LD block", async ({ page }) => {
    await page.goto("/products/clearpath");
    const apps = (await ldJson(page)).filter((b) => b["@type"] === "SoftwareApplication");
    expect(apps).toHaveLength(1);
    expect(apps[0].name).toBe("ClearPath");
    expect(apps[0].operatingSystem).toBe("Web");
    expect(apps[0].offers).toBeTruthy();
    expect(String(apps[0].url)).toContain("clearpath-52.vercel.app");
  });

  test('TC-CNT-024: carries the "Wie dieser Text entstand" note', async ({ page }) => {
    await page.goto("/products/clearpath");
    await expect(page.getByText("Wie dieser Text entstand")).toBeVisible();
  });
});

// SEO/GEO dual-axis acceptance sweep over every new route (Task 6).
const NEW_PAGES = [
  { path: "/glossar", title: "Glossar", canonical: "https://neckarshore.ai/glossar" },
  {
    path: "/glossar/bestaetigungsfehler",
    title: "Bestätigungsfehler",
    canonical: "https://neckarshore.ai/glossar/bestaetigungsfehler",
  },
  {
    path: "/glossar/ueberlebenden-verzerrung",
    title: "Überlebenden-Verzerrung",
    canonical: "https://neckarshore.ai/glossar/ueberlebenden-verzerrung",
  },
  {
    path: "/glossar/versunkene-kosten-falle",
    title: "Versunkene-Kosten-Falle",
    canonical: "https://neckarshore.ai/glossar/versunkene-kosten-falle",
  },
  { path: "/products", title: "Produkte", canonical: "https://neckarshore.ai/products" },
  {
    path: "/products/clearpath",
    title: "ClearPath",
    canonical: "https://neckarshore.ai/products/clearpath",
  },
  {
    path: "/products/omnopsis",
    title: "Omnopsis Documentor+X",
    canonical: "https://neckarshore.ai/products/omnopsis",
  },
  // Sub-portals (one per portfolio category) — 2026-06-17 tree rebuild.
  { path: "/products/flagships", title: "Flagships", canonical: "https://neckarshore.ai/products/flagships" },
  { path: "/products/mmps", title: "MMPs", canonical: "https://neckarshore.ai/products/mmps" },
  { path: "/products/skills", title: "Skills", canonical: "https://neckarshore.ai/products/skills" },
  { path: "/products/websites", title: "Websites", canonical: "https://neckarshore.ai/products/websites" },
  // Preview skeleton detail pages (dynamic [slug] route). noindex, but reachable + structured.
  {
    path: "/products/snakeoil-check",
    title: "Snakeoil-Check",
    canonical: "https://neckarshore.ai/products/snakeoil-check",
  },
  {
    path: "/products/local-seo-hub",
    title: "Local-SEO-Hub",
    canonical: "https://neckarshore.ai/products/local-seo-hub",
  },
  {
    path: "/products/phonesis",
    title: "Phonesis Voicebank",
    canonical: "https://neckarshore.ai/products/phonesis",
  },
  {
    path: "/products/prod-or-pretend",
    title: "Prod-or-Pretend",
    canonical: "https://neckarshore.ai/products/prod-or-pretend",
  },
  {
    path: "/products/obsidian-vault-autopilot",
    title: "Obsidian Vault Autopilot",
    canonical: "https://neckarshore.ai/products/obsidian-vault-autopilot",
  },
  {
    path: "/products/ai-phrase-check",
    title: "AI Phrase Check",
    canonical: "https://neckarshore.ai/products/ai-phrase-check",
  },
  {
    path: "/products/imap-mailbox-cleanup",
    title: "IMAP Mailbox Cleanup",
    canonical: "https://neckarshore.ai/products/imap-mailbox-cleanup",
  },
  {
    path: "/products/social-scrapers",
    title: "Social Scrapers",
    canonical: "https://neckarshore.ai/products/social-scrapers",
  },
] as const;

test.describe("Content surface — SEO/GEO dual-axis sweep", () => {
  for (const p of NEW_PAGES) {
    test(`TC-CNT-030 [${p.path}]: unique title, single H1, canonical, JSON-LD`, async ({
      page,
    }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);

      const title = await page.title();
      expect(title).toContain(p.title);
      expect(title).toContain("neckarshore.ai");

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        p.canonical,
      );

      const blocks = await ldJson(page);
      expect(blocks.length).toBeGreaterThanOrEqual(1);
      expect(blocks.every((b) => b["@context"] === "https://schema.org")).toBe(true);
    });

    test(`TC-CNT-031 [${p.path}]: lang=de, no heading skips, no overflow @393px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      await page.goto(p.path);

      expect(await page.locator("html").getAttribute("lang")).toBe("de");

      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
      let last = 0;
      for (const h of headings) {
        const level = parseInt((await h.evaluate((el) => el.tagName)).replace("H", ""), 10);
        if (last > 0) expect(level).toBeLessThanOrEqual(last + 1);
        last = level;
      }

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }
});

test.describe("Skills on-page overview table @content", () => {
  test("TC-CNT-032: /products/skills renders an overview table with one row per skill", async ({
    page,
  }) => {
    await page.goto("/products/skills");
    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    // 5 portfolio skills → 5 body rows + 1 header row
    await expect(table.getByRole("row")).toHaveCount(6);
  });

  test("TC-CNT-033: every overview-table link resolves — in-page anchor → its card, detail link → a product route", async ({
    page,
  }) => {
    await page.goto("/products/skills");
    // One Tool link per skill row. "Beides" nav: skills with a real detail page link
    // off-page (/products/<slug>); skeleton skills fall back to an in-page bookmark
    // (#slug) that scrolls to their card.
    const links = page.locator("table tbody a");
    const n = await links.count();
    expect(n).toBe(5);
    let anchors = 0;
    for (let i = 0; i < n; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
      if (href!.startsWith("#")) {
        anchors++;
        await expect(page.locator(`#${href!.slice(1)}`)).toBeAttached();
      } else {
        expect(href).toMatch(/^\/products\/[a-z0-9-]+$/);
      }
    }
    // at least one in-page bookmark remains (skeleton skills haven't graduated yet)
    expect(anchors).toBeGreaterThanOrEqual(1);
  });

  test("TC-CNT-034: clicking a bookmark scrolls the matching card near the top", async ({
    page,
  }) => {
    await page.goto("/products/skills");
    const link = page.locator('table a[href^="#"]').first(); // first in-page bookmark (robust as detail pages grow)
    const id = (await link.getAttribute("href"))!.slice(1);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect
      .poll(
        async () => {
          const top = await page
            .locator(`#${id}`)
            .evaluate((el) => Math.round(el.getBoundingClientRect().top));
          return top > -80 && top < 240; // landed below the sticky nav, not scrolled past
        },
        { timeout: 5000 },
      )
      .toBe(true);
  });
});

test.describe("Content surface — Snakeoil-Check preview MMP", () => {
  test("TC-CNT-035: 200, single H1 contains the name, citable definition is the lead paragraph", async ({
    page,
  }) => {
    const res = await page.goto("/products/snakeoil-check");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Snakeoil-Check");
    await expect(page.locator("article p").first()).toContainText(
      "zwölf neutralen Kriterien",
    );
  });

  test("TC-CNT-036: renders the five MMP content axes as headings", async ({ page }) => {
    await page.goto("/products/snakeoil-check");
    for (const heading of [
      "Das Problem",
      "Wie es funktioniert",
      "Die Idee dahinter",
      "Status & Roadmap",
      "Wie dieser Text entstand",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("TC-CNT-037: one preview SoftwareApplication block — no url, no offers (AD-19 fail-closed)", async ({
    page,
  }) => {
    await page.goto("/products/snakeoil-check");
    const apps = (await ldJson(page)).filter((b) => b["@type"] === "SoftwareApplication");
    expect(apps).toHaveLength(1);
    expect(apps[0].name).toBe("Snakeoil-Check");
    expect(apps[0].operatingSystem).toBe("Web");
    expect(apps[0].url).toBeUndefined();
    expect(apps[0].offers).toBeUndefined();
    expect(String(apps[0].description)).toContain("zwölf neutralen Kriterien");
  });
});

test.describe("Content surface — Phonesis Voicebank preview MMP", () => {
  test("TC-CNT-038: 200, single H1 contains the name, citable definition is the lead paragraph", async ({
    page,
  }) => {
    const res = await page.goto("/products/phonesis");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Phonesis");
    await expect(page.locator("article p").first()).toContainText(
      "kommende Generationen",
    );
  });

  test("TC-CNT-039: renders the six MMP content axes as headings", async ({ page }) => {
    await page.goto("/products/phonesis");
    for (const heading of [
      "Das Problem",
      "Wie es funktioniert",
      "Die Idee dahinter",
      "Datenschutz & Ethik",
      "Status & Roadmap",
      "Wie dieser Text entstand",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("TC-CNT-040: one preview SoftwareApplication block — no url, no offers (AD-19 fail-closed)", async ({
    page,
  }) => {
    await page.goto("/products/phonesis");
    const apps = (await ldJson(page)).filter((b) => b["@type"] === "SoftwareApplication");
    expect(apps).toHaveLength(1);
    expect(apps[0].name).toBe("Phonesis Voicebank");
    expect(apps[0].operatingSystem).toBe("Web");
    expect(apps[0].url).toBeUndefined();
    expect(apps[0].offers).toBeUndefined();
    expect(String(apps[0].description)).toContain("kommende Generationen");
  });
});
