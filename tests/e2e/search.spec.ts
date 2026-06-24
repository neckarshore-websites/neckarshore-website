import { test, expect, type Page } from "@playwright/test";

/**
 * Cmd+K search (TC-SRCH-*). Client-side MiniSearch over the static /api/search-index.
 * Website entries resolve to their internal case study (/products/websites/<slug>), so a
 * project-name search opens the case study on-site rather than the external domain.
 */

const dialog = (page: Page) => page.getByRole("dialog", { name: "Suche" });
const combo = (page: Page) => page.getByRole("combobox", { name: /durchsuchen/i });

// The ⌘/Ctrl+K listener attaches on client hydration; in dev the first load is
// cold-compiled, so retry the keypress until the overlay opens — and only press
// while it's closed, so we never toggle an open overlay shut.
async function openWithShortcut(page: Page, key: "Meta+k" | "Control+k") {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Suche öffnen" }).first()).toBeVisible();
  await expect(async () => {
    if (!(await dialog(page).isVisible())) await page.keyboard.press(key);
    await expect(dialog(page)).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10_000 });
}

test.describe("Cmd+K Search @search", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/track", (route) => route.abort());
  });

  test("TC-SRCH-001: Cmd+K opens, finds a page, Enter navigates to it", async ({ page }) => {
    await openWithShortcut(page, "Meta+k");
    await combo(page).fill("datenschutz");
    await expect(page.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/datenschutz/, { timeout: 15_000 });
  });

  test("TC-SRCH-002: Ctrl+K opens, Escape closes", async ({ page }) => {
    await openWithShortcut(page, "Control+k");
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
  });

  test("TC-SRCH-003: header search button opens the overlay (mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/track", (route) => route.abort());
    await page.goto("/");
    await page.getByRole("button", { name: "Suche öffnen" }).first().click();
    await expect(dialog(page)).toBeVisible();
  });

  test("TC-SRCH-004: finds a preview product by name, Enter navigates to its page", async ({ page }) => {
    await openWithShortcut(page, "Meta+k");
    await combo(page).fill("phonesis");
    await expect(page.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/products\/phonesis/, { timeout: 15_000 });
  });

  test("TC-SRCH-005: ArrowDown + Enter navigates to the second result", async ({ page }) => {
    await openWithShortcut(page, "Meta+k");
    await combo(page).fill("nearshore");
    await expect(page.getByRole("option").nth(1)).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(dialog(page)).toHaveCount(0);
  });

  test("TC-SRCH-006: no console errors opening + searching", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("net::ERR_FAILED")) errors.push(msg.text());
    });
    await openWithShortcut(page, "Meta+k");
    await combo(page).fill("dsgvo");
    await expect(page.getByRole("option").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("TC-SRCH-007: a website result navigates to its internal case study", async ({ page }) => {
    await openWithShortcut(page, "Meta+k");
    await combo(page).fill("goldoni");
    const opt = page.getByRole("option").first();
    await expect(opt).toBeVisible();
    await opt.click();
    await expect(page).toHaveURL(/\/products\/websites\/ristorante-goldoni/, { timeout: 15_000 });
  });
});
