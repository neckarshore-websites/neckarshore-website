import { test, expect } from "@playwright/test";

// JSON-LD helper: collect all parsed ld+json blocks on the current page.
async function ldJsonTypes(page: import("@playwright/test").Page) {
  const blocks = page.locator('script[type="application/ld+json"]');
  const count = await blocks.count();
  const parsed: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const txt = await blocks.nth(i).textContent();
    if (txt) parsed.push(JSON.parse(txt));
  }
  return parsed;
}

test.describe("Content surface — Glossar", () => {
  test("TC-CNT-001: glossar index lists entries and links to them", async ({ page }) => {
    const res = await page.goto("/glossar");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Kognitive Verzerrungen");
    await expect(page.locator('a[href="/glossar/bestaetigungsfehler"]').first()).toBeVisible();
  });

  test("TC-CNT-002: entry page — definition is the first content paragraph", async ({ page }) => {
    const res = await page.goto("/glossar/bestaetigungsfehler");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Bestätigungsfehler");
    await expect(page.locator("article p").first()).toContainText(
      "Neigung, Informationen so zu suchen",
    );
  });

  test("TC-CNT-003: entry emits a valid DefinedTerm JSON-LD block", async ({ page }) => {
    await page.goto("/glossar/bestaetigungsfehler");
    const blocks = await ldJsonTypes(page);
    const definedTerm = blocks.find((b) => b["@type"] === "DefinedTerm");
    expect(definedTerm).toBeTruthy();
    expect(definedTerm!.name).toBe("Bestätigungsfehler");
    expect(definedTerm!.inDefinedTermSet).toBeTruthy();
    expect(String(definedTerm!.url)).toContain("/glossar/bestaetigungsfehler");
  });

  test("TC-CNT-004: entry links back to /products/clearpath", async ({ page }) => {
    await page.goto("/glossar/bestaetigungsfehler");
    await expect(
      page.locator('article a[href="/products/clearpath"]').first(),
    ).toBeVisible();
  });
});
