/**
 * Guards for the opt-out signal on /api/track (Art. 21(5) GDPR; DPO finding
 * DS-NS-GPC-OBJECTION, report 2026-10-05-dr-sommer-dpo-271-2877-art14).
 *
 * The visitor id changes every day and the salt is deleted, so an objection by
 * mail cannot stop the counting of FUTURE visits: we cannot recognise the
 * visitor. The browser signal is the one objection that works, so the route
 * must honour it before it touches anything.
 *
 * WHAT THIS CANNOT DO: prove that the running route skips the write. That is
 * tests/e2e/privacy.spec.ts TC-PRIV-002/003, against the served route.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { hasOptOutSignal } from "../../src/lib/tracking-signal";

const headers = (init: Record<string, string>) => new Headers(init);

test("Sec-GPC: 1 is an opt-out", () => {
  assert.equal(hasOptOutSignal(headers({ "Sec-GPC": "1" })), true);
});

test("DNT: 1 is an opt-out", () => {
  assert.equal(hasOptOutSignal(headers({ DNT: "1" })), true);
});

test("no signal is not an opt-out", () => {
  assert.equal(hasOptOutSignal(headers({})), false);
});

test("DNT: 0 and other values are not an opt-out", () => {
  // DNT: 0 is an explicit "tracking is fine"; anything else is not a signal.
  assert.equal(hasOptOutSignal(headers({ DNT: "0" })), false);
  assert.equal(hasOptOutSignal(headers({ "Sec-GPC": "0" })), false);
  assert.equal(hasOptOutSignal(headers({ "Sec-GPC": "true" })), false);
});

test("one signal is enough when the other says 0", () => {
  assert.equal(hasOptOutSignal(headers({ "Sec-GPC": "1", DNT: "0" })), true);
});

test("surrounding whitespace does not hide the signal", () => {
  assert.equal(hasOptOutSignal(headers({ "Sec-GPC": " 1 " })), true);
});

test("the route checks the signal before it reads the body, the address or the salt", () => {
  const route = readFileSync(new URL("../../src/app/api/track/route.ts", import.meta.url), "utf8");
  const post = route.slice(route.indexOf("export async function POST"));
  const check = post.indexOf("hasOptOutSignal(");
  assert.notEqual(check, -1, "POST does not call hasOptOutSignal");
  for (const later of ["req.json()", "getClientIp(req)", "store.dailySalt(", "store.push("]) {
    const at = post.indexOf(later);
    assert.notEqual(at, -1, `POST no longer contains ${later} — this test needs a new anchor`);
    assert.ok(check < at, `the signal check must come before ${later}`);
  }
});

test("the browser script checks the signal before it sends", () => {
  const script = readFileSync(new URL("../../src/components/TrackerScript.tsx", import.meta.url), "utf8");
  const track = script.slice(script.indexOf("function track("));
  const check = track.indexOf("browserOptedOut()");
  const send = track.indexOf("navigator.sendBeacon(");
  assert.notEqual(check, -1, "track() does not call browserOptedOut()");
  assert.notEqual(send, -1, "track() no longer calls sendBeacon — this test needs a new anchor");
  assert.ok(check < send, "the signal check must come before sendBeacon");
});
