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
    });
  }
});
