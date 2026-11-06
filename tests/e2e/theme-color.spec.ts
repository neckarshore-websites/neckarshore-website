import { expect, test, type Page } from "@playwright/test";

/**
 * Browser chrome tint — the theme-color tags must equal the background the page paints:
 * for the "system" setting in both color schemes, for a stored explicit choice that
 * contradicts the system, and after a press of the ThemeToggle. The color's source is the
 * body ground (--color-neutral-light / --color-deep-space); components/ThemeColorSync.tsx
 * follows explicit choices.
 */
const PAGES = ["/", "/impressum"];

function toHex(color: string): string {
  if (color.startsWith("#")) return color.toLowerCase();
  const m = color.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) throw new Error(`not a color: ${color}`);
  return "#" + m.slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("");
}

async function expectTintMatchesGround(page: Page, scheme: "light" | "dark", label: string) {
  expect(await page.locator('meta[name="theme-color"]').count(), `${label}: theme-color tags`).toBe(2);
  const tag = page.locator(`meta[name="theme-color"][media="(prefers-color-scheme: ${scheme})"]`);
  const painted = await page.evaluate(() => ({
    body: getComputedStyle(document.body).backgroundColor,
  }));
  await expect
    .poll(async () => toHex((await tag.getAttribute("content")) ?? ""), { message: `${label}: tag vs ground` })
    .toBe(toHex(painted.body));
}

for (const scheme of ["light", "dark"] as const) {
  test(`theme-color matches the ground with the system setting (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveClass(scheme === "dark" ? /\bdark\b/ : /^(?!.*\bdark\b)/);
      await expectTintMatchesGround(page, scheme, `${path} system ${scheme}`);
    }
  });
}

test("theme-color follows a stored choice against the system", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expectTintMatchesGround(page, "light", `${path} stored dark`);
  }
});

test("theme-color follows a press of the toggle", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Zu dunklem Modus wechseln" }).first().click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expectTintMatchesGround(page, "light", "after toggle");
});
