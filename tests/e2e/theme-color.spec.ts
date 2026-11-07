import { expect, test, type Page } from "@playwright/test";

/**
 * Browser chrome tint — the theme-color tags must equal the background the page paints:
 * for the "system" setting in both color schemes, for a stored explicit choice that
 * contradicts the system, and after a press of the ThemeToggle. The color's source is the
 * body ground (--color-neutral-light / --color-deep-space); components/ThemeColorSync.tsx
 * follows explicit choices. Each page must answer 200, and the tags as shipped in the server
 * HTML must already be the ground, because ThemeColorSync rewrites them after hydration and
 * would otherwise hide a wrong shipped value.
 */
const PAGES = ["/", "/impressum"];

function toHex(color: string): string {
  if (/^#[0-9a-f]{3}$/i.test(color)) return ("#" + [...color.slice(1)].map((c) => c + c).join("")).toLowerCase();
  if (color.startsWith("#")) return color.toLowerCase();
  const m = color.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) throw new Error(`not a color: ${color}`);
  return "#" + m.slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("");
}

/** The media-scoped tag for one scheme, as the server ships it, before any script runs. */
async function shippedTint(page: Page, path: string, scheme: "light" | "dark"): Promise<string> {
  const html = await (await page.request.get(path)).text();
  const tag = (html.match(/<meta[^>]*name="theme-color"[^>]*>/g) ?? []).find((t) =>
    t.includes(`(prefers-color-scheme: ${scheme})`),
  );
  const content = tag?.match(/content="([^"]+)"/)?.[1];
  if (!content) throw new Error(`${path}: no shipped theme-color tag for ${scheme}`);
  return toHex(content);
}

const paintedGround = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor).then(toHex);

async function expectTintMatchesGround(page: Page, scheme: "light" | "dark", label: string) {
  expect(await page.locator('meta[name="theme-color"]').count(), `${label}: theme-color tags`).toBe(2);
  const tag = page.locator(`meta[name="theme-color"][media="(prefers-color-scheme: ${scheme})"]`);
  const ground = await paintedGround(page);
  await expect
    .poll(async () => toHex((await tag.getAttribute("content")) ?? ""), { message: `${label}: tag vs ground` })
    .toBe(ground);
}

for (const scheme of ["light", "dark"] as const) {
  test(`theme-color matches the ground with the system setting (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    for (const path of PAGES) {
      expect((await page.goto(path))?.status(), `${path}: status`).toBe(200);
      await expect(page.locator("html")).toHaveClass(scheme === "dark" ? /\bdark\b/ : /^(?!.*\bdark\b)/);
      await expectTintMatchesGround(page, scheme, `${path} system ${scheme}`);
      // What the browser shows before hydration: the shipped tag must already be this ground.
      expect(await shippedTint(page, path, scheme), `${path}: shipped ${scheme} tag vs ground`).toBe(
        await paintedGround(page),
      );
    }
  });
}

test("theme-color follows a stored choice against the system", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  for (const path of PAGES) {
    expect((await page.goto(path))?.status(), `${path}: status`).toBe(200);
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expectTintMatchesGround(page, "light", `${path} stored dark`);
  }
});

test("theme-color follows a press of the toggle", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  expect((await page.goto("/"))?.status(), "/: status").toBe(200);
  await page.getByRole("button", { name: "Zu dunklem Modus wechseln" }).first().click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expectTintMatchesGround(page, "light", "after toggle");
});
