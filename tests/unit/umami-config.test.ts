// The real Umami id only on Vercel production builds (planning #4006 row 6).
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveUmamiWebsiteId } from "../../src/lib/umami.ts";

test("production gets the real id", () => {
  assert.match(resolveUmamiWebsiteId({ VERCEL_ENV: "production" }), /^[0-9a-f-]{36}$/);
});

test("preview, development and a local build get no id", () => {
  for (const VERCEL_ENV of ["preview", "development", undefined]) {
    assert.equal(resolveUmamiWebsiteId({ VERCEL_ENV }), "", String(VERCEL_ENV));
  }
});

test("the e2e override wins in both directions", () => {
  assert.equal(resolveUmamiWebsiteId({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: "e2e", VERCEL_ENV: "production" }), "e2e");
  assert.equal(resolveUmamiWebsiteId({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: "e2e" }), "e2e");
});
