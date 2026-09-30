import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GUARD_PREFIX,
  SITE_IDENTITY_MARKER,
  VERCEL_CHECKPOINT_TITLE,
  classifyTargetResponse,
} from "../e2e/live-target";

// The guard exists so that a smoke run against production can tell "the site changed" apart
// from "something else answered". These bodies are SYNTHETIC — no copy of the real 2026-08-22
// checkpoint page was kept; only its title and size were measured. The real-target red run
// (BASE_URL pointing at a foreign site) is recorded in the PR body.

const URL = "https://neckarshore.ai/";
const SITE_BODY = `<html><head><title>neckarshore.ai</title><script type="application/ld+json">{"@id":"${SITE_IDENTITY_MARKER}"}</script></head><body><h1>x</h1></body></html>`;
const CHECKPOINT_BODY = `<html><head><title>${VERCEL_CHECKPOINT_TITLE}</title></head><body><h1>Checking your browser</h1></body></html>`;

test("the site itself passes", () => {
  assert.deepEqual(classifyTargetResponse(URL, 200, SITE_BODY), { ok: true });
});

test("the checkpoint with HTTP 200 fails — the case a status check alone waves through", () => {
  const v = classifyTargetResponse(URL, 200, CHECKPOINT_BODY);
  assert.equal(v.ok, false);
  assert.ok(!v.ok && v.reason.startsWith(GUARD_PREFIX));
  assert.ok(!v.ok && v.reason.includes("Security Checkpoint"));
});

test("the checkpoint with HTTP 403 fails with the checkpoint message", () => {
  const v = classifyTargetResponse(URL, 403, CHECKPOINT_BODY);
  assert.ok(!v.ok && v.reason.includes("HTTP 403"));
});

test("any other page without the identity anchor fails — positive identity, not a blocklist", () => {
  const v = classifyTargetResponse(URL, 200, "<html><title>Example Domain</title></html>");
  assert.ok(!v.ok && v.reason.includes(SITE_IDENTITY_MARKER));
});

test("the marker is the Organization @id, not a free-standing literal", () => {
  assert.equal(SITE_IDENTITY_MARKER, "https://neckarshore.ai/#organization");
});
