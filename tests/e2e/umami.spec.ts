// Umami wiring on neckarshore.ai (planning #4006 row 6). The hook's logic is
// covered by tests/unit/umami-before-send.test.mjs; this file proves that the
// browser runs it BEFORE the first request, and that the CSP lets the
// tracker through. The tracker itself is the stub from ./fixtures.
import type { Page, Request } from "./fixtures";
import { test, expect } from "./fixtures";
import { UMAMI_HOST } from "../../src/lib/umami";

function captureSends(page: Page): Request[] {
  const sends: Request[] = [];
  page.on("request", (req) => {
    if (req.url() === `${UMAMI_HOST}/api/send`) sends.push(req);
  });
  return sends;
}

test("the first request already carries no screen size and only the utm keys", async ({
  page,
}) => {
  const sends = captureSends(page);
  // Dr. Sommer's read-4 test: url keeps only the utm keys, the referrer
  // arrives without its query.
  await page.goto("/?utm_source=linkedin&foo=b&gclid=abc&utm_id=7&utm_term=po#x", {
    referer: "https://www.example.org/x?utm_source=a&q=b",
  });
  await expect.poll(() => sends.length).toBeGreaterThan(0);

  const { type, payload } = sends[0].postDataJSON();
  expect(type).toBe("event");
  expect(payload).not.toHaveProperty("screen");
  expect(new URL(payload.url).search).toBe("?utm_source=linkedin&utm_term=po");
  expect(payload.url).not.toContain("#");
  expect(payload.referrer).toBe("https://www.example.org/x");
});

test("the hook loads before the tracker", async ({ page }) => {
  await page.goto("/");
  // afterInteractive: Next inserts the tracker tag after hydration.
  await expect(page.locator(`script[src="${UMAMI_HOST}/script.js"]`)).toHaveCount(1);
  const order = await page.evaluate(() =>
    [...document.querySelectorAll("script[src]")]
      .map((s) => (s as HTMLScriptElement).src)
      .filter((src) => src.includes("umami") || src.includes("/script.js")),
  );
  const hook = order.findIndex((src) => src.endsWith("/umami-before-send.js"));
  const tracker = order.findIndex((src) => src === `${UMAMI_HOST}/script.js`);
  expect(hook, "hook script present").toBeGreaterThanOrEqual(0);
  expect(tracker, "tracker script present").toBeGreaterThan(hook);
});

test("Global Privacy Control: nothing is sent", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "globalPrivacyControl", {
      get: () => true,
    });
  });
  const sends = captureSends(page);
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1000);
  expect(sends).toHaveLength(0);
});

test("Do Not Track: nothing is sent", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "doNotTrack", {
      get: () => "1",
    });
  });
  const sends = captureSends(page);
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1000);
  expect(sends).toHaveLength(0);
});

test("the CSP admits the Umami host for script and connect, and nothing else new", async ({
  page,
}) => {
  const response = await page.goto("/");
  const csp = response?.headers()["content-security-policy"] ?? "";
  const directive = (name: string) =>
    csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(name + " ")) ?? "";
  expect(directive("script-src")).toContain(UMAMI_HOST);
  expect(directive("connect-src")).toContain(UMAMI_HOST);
  expect(directive("img-src")).not.toContain(UMAMI_HOST);
  expect(directive("frame-src")).not.toContain(UMAMI_HOST);
});
