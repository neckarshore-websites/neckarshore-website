import { test, expect } from "@playwright/test";

/**
 * Markdown export (TC-EXP-*) — the "Als Markdown" download on content pages.
 *
 * Asserts the button is present on product pages (bespoke clearpath + the shared
 * PreviewProductPage template) and that /api/export serves clean source markdown as a
 * downloadable attachment, with the right 404/400 contract for non-exportable paths.
 *
 * NOTE: this suite runs against the dev server, so it does NOT exercise the Vercel
 * file-tracing path (outputFileTracingIncludes). That is verified separately via a
 * production build + start in the session (see docs/test-log.md).
 */

const PRODUCT_PATH = "/products/clearpath";
const EXPORT_HREF = `/api/export?path=${encodeURIComponent(PRODUCT_PATH)}`;

test.describe("Markdown export (TC-EXP)", () => {
  test("TC-EXP-001: a product page shows an export button linking to the export endpoint", async ({ page }) => {
    await page.goto(PRODUCT_PATH);
    const btn = page.locator(`a[href="${EXPORT_HREF}"]`);
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute("download", "");
  });

  test("TC-EXP-002: the export endpoint returns markdown as a downloadable attachment", async ({ page }) => {
    const res = await page.request.get(EXPORT_HREF);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/markdown");
    expect(res.headers()["content-disposition"]).toContain('attachment; filename="clearpath.md"');
  });

  test("TC-EXP-003: exported markdown carries frontmatter, the body and the data-driven FAQ", async ({ page }) => {
    const res = await page.request.get(EXPORT_HREF);
    const body = await res.text();
    expect(body.startsWith("---\n")).toBeTruthy();
    expect(body).toContain('source: "https://neckarshore.ai/products/clearpath"');
    expect(body).toContain('site: "neckarshore.ai"');
    expect(body).toContain("## Das Problem"); // raw body from clearpath.md
    expect(body).toContain("## Häufige Fragen"); // data-driven FAQ section
    expect(body).toContain("### Was macht ClearPath?");
  });

  test("TC-EXP-004: a non-exportable path (hand-written legal page) returns 404", async ({ page }) => {
    const res = await page.request.get(`/api/export?path=${encodeURIComponent("/datenschutz")}`);
    expect(res.status()).toBe(404);
  });

  test("TC-EXP-005: a malformed path param returns 400", async ({ page }) => {
    const res = await page.request.get(`/api/export?path=not-a-path`);
    expect(res.status()).toBe(400);
  });

  test("TC-EXP-006: the shared preview-product template also shows the export button", async ({ page }) => {
    const path = "/products/snakeoil-check";
    await page.goto(path);
    const btn = page.locator(`a[href="/api/export?path=${encodeURIComponent(path)}"]`);
    await expect(btn).toBeVisible();
  });

  test("TC-EXP-007: clicking the button downloads the .md (analytics click does not swallow it)", async ({ page }) => {
    // Guards the core path: the site-wide TrackerScript click handler must NOT
    // preventDefault() the download. Asserts the browser download actually fires
    // with the right filename when the button is clicked.
    await page.goto(PRODUCT_PATH);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator(`a[href="${EXPORT_HREF}"]`).click(),
    ]);
    expect(download.suggestedFilename()).toBe("clearpath.md");
  });
});
