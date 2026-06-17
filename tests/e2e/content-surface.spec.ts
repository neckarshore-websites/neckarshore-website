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
  test("TC-CNT-010: /products renders 200 with the three tier headings", async ({ page }) => {
    const res = await page.goto("/products");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    for (const tier of ["Omnopsis", "MMPs", "Skills"]) {
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
