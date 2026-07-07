import { test, expect } from "@playwright/test";

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
