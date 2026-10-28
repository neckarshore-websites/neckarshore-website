import { expect, test } from "@playwright/test";

/**
 * THE 404 "NECKAR-KILOMETER 404" (src/app/not-found.tsx): the status, the tab title, the page,
 * the way back, the sign hidden from screen readers, no sideways scroll on a phone.
 */
test("a dead address answers 404 with the Neckar page and a way back", async ({ page }) => {
  const antwort = await page.goto("/gibt-es-nicht");
  expect(antwort?.status()).toBe(404);
  await expect(page).toHaveTitle("404 — Seite nicht gefunden — neckarshore.ai");

  const seite = page.locator("[data-neckar-404]");
  await expect(seite.getByRole("heading", { level: 1 })).toHaveText("Neckar-Kilometer 404gibt es nicht.");
  await expect(seite.getByRole("link", { name: "Zurück zur Startseite" })).toHaveAttribute("href", "/");
  await expect(seite.locator("[data-neckar-tafel]")).toHaveAttribute("aria-hidden", "true");

  const breiter = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(breiter).toBe(false);
});
