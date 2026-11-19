// The real Umami id ships on Vercel production builds only (src/lib/umami.ts).
// Local builds, CI Lighthouse runs and previews must not count on the box.
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveUmamiWebsiteId } from "../../src/lib/umami";

const REAL = "96cf5102-5933-4d08-9ed6-c96423cca311";

test("Vercel production gets the real neckarshore.ai id", () => {
  assert.equal(resolveUmamiWebsiteId({ VERCEL_ENV: "production" }), REAL);
});

test("a Vercel preview gets no id, so the tracker is not rendered", () => {
  assert.equal(resolveUmamiWebsiteId({ VERCEL_ENV: "preview" }), "");
});

test("a local build (no VERCEL_ENV) gets no id", () => {
  assert.equal(resolveUmamiWebsiteId({}), "");
  assert.equal(resolveUmamiWebsiteId({ VERCEL_ENV: "development" }), "");
});

test("the e2e override wins over the environment", () => {
  const e2e = "e2e00000-0000-4000-8000-000000000000";
  assert.equal(resolveUmamiWebsiteId({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: e2e }), e2e);
  assert.equal(
    resolveUmamiWebsiteId({ NEXT_PUBLIC_UMAMI_WEBSITE_ID: e2e, VERCEL_ENV: "production" }),
    e2e,
  );
});
