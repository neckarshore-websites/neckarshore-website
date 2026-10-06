import { test, expect, type APIRequestContext } from "@playwright/test";
import { TEST_ANALYTICS_READ_TOKEN } from "./analytics-test-token";

// Cookies the site is permitted to set on first load WITHOUT prior user consent.
// Empty today: neckarshore.ai sets zero cookies — the consent banner was removed in
// a3b5470 (DPO decision #75: only technically-necessary storage, no tracking, no
// third parties). Add an entry here ONLY via a documented Founder/DPO decision; an
// un-allowlisted cookie fails the guard closed.
const ESSENTIAL_COOKIE_ALLOWLIST: string[] = [];

test.describe("Privacy — consent & cookie hygiene", () => {
  // TC-PRIV-001: robust regression-guard for a3b5470 ("remove CookieBanner + datenschutz
  // accuracy"). Rather than assert on the (brittle) presence/absence of a banner UI, this
  // asserts the underlying COMPLIANCE INVARIANT the fix protects: no tracking without
  // consent. On a first, un-interacted homepage load the site must set no non-essential
  // cookie. This survives a future *legitimate* consent+banner (which would only set a
  // cookie AFTER the user opts in), yet fails closed the moment any tracking cookie lands
  // before consent. Uses context().cookies() so both JS-set and HttpOnly Set-Cookie
  // tracking cookies are caught. Rot-Beweis (Case B): reverting a3b5470 re-mounts a
  // localStorage-only banner and does NOT set a cookie, so revert alone stays green —
  // the guard's teeth are proven by error-injection (document.cookie='track=1' → RED),
  // per issue #114.
  test("TC-PRIV-001: homepage sets no non-essential cookie on first load (no tracking without consent)", async ({
    page,
  }) => {
    await page.goto("/");
    // No user interaction — capture the pure first-load cookie state.
    const cookies = await page.context().cookies();
    const nonEssential = cookies
      .map((c) => c.name)
      .filter((name) => !ESSENTIAL_COOKIE_ALLOWLIST.includes(name));
    expect(
      nonEssential,
      `unexpected non-essential cookie(s) set before consent: ${nonEssential.join(", ") || "(none)"}`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Opt-out signal — Art. 21(5) GDPR, DPO finding DS-NS-GPC-OBJECTION
// ---------------------------------------------------------------------------
// The visitor id changes daily, so an objection by mail cannot stop the counting
// of future visits. The browser signal (Sec-GPC / DNT) is the objection that
// works: a request that carries it must leave nothing in the store.
//
// Each probe uses a page name no other test writes, and reads the store back
// through the authenticated GET. TC-PRIV-002 is the control: it proves the
// read-back SEES a stored event. Without it, 003/004 would be green on a store
// that cannot be read at all.

const ENDPOINT = "/api/track";

async function storedPages(request: APIRequestContext): Promise<string[]> {
  const res = await request.get(`${ENDPOINT}?include_test=true`, {
    headers: { Authorization: `Bearer ${TEST_ANALYTICS_READ_TOKEN}` },
  });
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { data: Record<string, Array<{ page: string }>> };
  return Object.values(body.data).flat().map((e) => e.page);
}

const probePage = (label: string) => `/__optout-probe-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

test.describe("Privacy — opt-out signal on /api/track", () => {
  test("TC-PRIV-002: control — an event without a signal is stored and can be read back", async ({ request }) => {
    const page = probePage("control");
    const res = await request.post(ENDPOINT, { data: { event: "page_view", page, source: "playwright" } });
    expect(res.status()).toBe(200);
    expect(await storedPages(request)).toContain(page);
  });

  test("TC-PRIV-003: an event with Sec-GPC: 1 is answered 200 and not stored", async ({ request }) => {
    const page = probePage("gpc");
    const res = await request.post(ENDPOINT, {
      headers: { "Sec-GPC": "1" },
      data: { event: "page_view", page, source: "playwright" },
    });
    expect(res.status()).toBe(200);
    expect(await storedPages(request)).not.toContain(page);
  });

  test("TC-PRIV-004: an event with DNT: 1 is answered 200 and not stored", async ({ request }) => {
    const page = probePage("dnt");
    const res = await request.post(ENDPOINT, {
      headers: { DNT: "1" },
      data: { event: "page_view", page, source: "playwright" },
    });
    expect(res.status()).toBe(200);
    expect(await storedPages(request)).not.toContain(page);
  });

  for (const [id, label, init] of [
    ["TC-PRIV-005", "globalPrivacyControl", () => Object.defineProperty(navigator, "globalPrivacyControl", { get: () => true })],
    ["TC-PRIV-006", "doNotTrack", () => Object.defineProperty(navigator, "doNotTrack", { get: () => "1" })],
  ] as const) {
    test(`${id}: a browser with ${label} set sends nothing to /api/track`, async ({ page }) => {
      await page.addInitScript(init);
      const sent: string[] = [];
      page.on("request", (req) => {
        if (req.method() === "POST" && req.url().includes(ENDPOINT)) sent.push(req.url());
      });
      await page.goto("/");
      await page.mouse.wheel(0, 4000); // scroll_depth + section_view would fire here
      await page.waitForTimeout(500);
      await page.goto("/impressum"); // page-hide flushes the web-vitals beacons
      await page.waitForTimeout(500);
      expect(sent, `beacons sent despite ${label}`).toEqual([]);
    });
  }

  test("TC-PRIV-007: control — a browser without a signal does send to /api/track", async ({ page }) => {
    const sent: string[] = [];
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().includes(ENDPOINT)) sent.push(req.url());
    });
    await page.goto("/");
    await expect.poll(() => sent.length, { timeout: 10_000 }).toBeGreaterThanOrEqual(1);
  });
});
