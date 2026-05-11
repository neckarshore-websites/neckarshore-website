import { test, expect } from "@playwright/test";

const ENDPOINT = "/api/track";

// TC-STAT-009 — /api/track GET auth-hardening
// Source: dr-sommer Z1 Finding 1.1 (High/S) — GET endpoint exposed 90 days
// of visitor-hashes + geo + UTM + referrers without auth.
// Plan-doc: docs/plans/api-track-auth-hardening.md (omnopsis-planning)
test.describe("TC-STAT-009 — /api/track GET auth", () => {
  test("TC-STAT-009-1: GET without Authorization header returns 401", async ({ request }) => {
    const response = await request.get(ENDPOINT);
    expect(response.status()).toBe(401);
  });

  test("TC-STAT-009-2: GET with malformed Authorization header returns 401", async ({ request }) => {
    const response = await request.get(ENDPOINT, {
      headers: { Authorization: "Bearer not-a-real-token" },
    });
    expect(response.status()).toBe(401);
  });

  test("TC-STAT-009-3: GET with non-Bearer scheme returns 401", async ({ request }) => {
    const response = await request.get(ENDPOINT, {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    expect(response.status()).toBe(401);
  });

  test("TC-STAT-009-4: GET with correct Bearer token returns 200 with expected shape", async ({ request }) => {
    const token = process.env.ANALYTICS_READ_TOKEN;
    test.skip(!token, "ANALYTICS_READ_TOKEN not set in test env");
    const response = await request.get(ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    // Shape assertions — minimal top-level (full shape covered by T8 1.7)
    expect(body).toHaveProperty("totalEvents");
    expect(body).toHaveProperty("pageViews");
    expect(body).toHaveProperty("uniqueVisitors");
    expect(body).toHaveProperty("sessions");
    expect(body).toHaveProperty("data");
  });

  test("TC-STAT-009-5: Authenticated 200 response has Cache-Control: private, no-store", async ({ request }) => {
    const token = process.env.ANALYTICS_READ_TOKEN;
    test.skip(!token, "ANALYTICS_READ_TOKEN not set in test env");
    const response = await request.get(ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const cacheControl = response.headers()["cache-control"] || "";
    expect(cacheControl).toContain("private");
    expect(cacheControl).toContain("no-store");
  });

  // REGRESSION GUARD — non-negotiable per advisor-validated guardrail
  test("TC-STAT-009-6: POST without Authorization header still returns 200 (visitor-ping unaffected)", async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: { event: "page_view", page: "/test", source: "playwright" },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
  });
});
