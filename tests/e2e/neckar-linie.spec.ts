import { expect, test } from "@playwright/test";

/**
 * THE NECKAR LINE in the home hero (src/components/NeckarLinie.tsx, Founder 2026-10-17):
 * decoration only, hidden from screen readers, behind the copy, never in the way of a click,
 * and no sideways scroll on the narrowest phone.
 */
test("the hero carries the Neckar line as hidden decoration behind the copy", async ({ page }) => {
  await page.goto("/");
  const linie = page.locator("section:has(h1) [data-neckar-linie]");
  await expect(linie).toHaveCount(1);
  await expect(linie).toHaveAttribute("aria-hidden", "true");
  await expect(linie.locator("path")).toHaveCount(7);

  const stapel = await page.evaluate(() => {
    const svg = document.querySelector("[data-neckar-linie]")!;
    const kopie = document.querySelector("section:has(h1) h1")!.parentElement!;
    return {
      linie: Number(getComputedStyle(svg).zIndex),
      kopie: Number(getComputedStyle(kopie).zIndex),
      zeiger: getComputedStyle(svg).pointerEvents,
    };
  });
  expect(stapel.kopie).toBeGreaterThan(stapel.linie);
  expect(stapel.zeiger).toBe("none");

  /* The primary call to action is the topmost element at its own centre: the lines do not cover it. */
  const knopf = page.getByRole("link", { name: "Kennenlerntermin buchen" }).first();
  const oben = await knopf.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const treffer = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return treffer === el || el.contains(treffer);
  });
  expect(oben).toBe(true);
});

test("at 320 px the Neckar line adds no sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.locator("[data-neckar-linie]")).toBeVisible();
  const breiter = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(breiter).toBe(false);
});
