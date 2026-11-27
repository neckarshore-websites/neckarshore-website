// Spec for public/umami-before-send.js (planning #4006 row 6).
// Loads the shipped file itself into a sandbox with a fake window, so the test
// guards the file the browser gets, not a copy of its logic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(
  new URL("../../public/umami-before-send.js", import.meta.url),
  "utf8",
);

function load(navigator = {}, extra = {}) {
  const window = { navigator, ...extra };
  vm.runInNewContext(source, { window });
  assert.equal(typeof window.umamiBeforeSend, "function");
  return window.umamiBeforeSend;
}

const base = {
  website: "00000000-0000-0000-0000-000000000000",
  screen: "1920x1080",
  language: "de-DE",
  title: "German Rauhut",
  hostname: "rauhut.com",
  url: "https://rauhut.com/",
  referrer: "",
};

test("screen is removed from every payload type", () => {
  const hook = load();
  for (const type of ["event", "identify", "performance"]) {
    const out = hook(type, { ...base });
    assert.ok(!("screen" in out), `screen survived on ${type}`);
    assert.equal(out.language, "de-DE");
  }
});

test("the input payload is not mutated", () => {
  const hook = load();
  const input = { ...base, url: "https://rauhut.com/?gclid=1" };
  hook("event", input);
  assert.equal(input.screen, "1920x1080");
  assert.equal(input.url, "https://rauhut.com/?gclid=1");
});

test("Global Privacy Control sends nothing", () => {
  assert.equal(load({ globalPrivacyControl: true })("event", { ...base }), null);
});

test("Do Not Track sends nothing (navigator, window and legacy forms)", () => {
  assert.equal(load({ doNotTrack: "1" })("event", { ...base }), null);
  assert.equal(load({}, { doNotTrack: "1" })("event", { ...base }), null);
  assert.equal(load({ msDoNotTrack: "1" })("event", { ...base }), null);
  assert.notEqual(load({ doNotTrack: "0" })("event", { ...base }), null);
});

test("each Do Not Track signal counts on its own: one '1' beside a '0' still sends nothing", () => {
  // window.doNotTrack "0" used to win over navigator.doNotTrack "1" (CodeRabbit on #390).
  assert.equal(load({ doNotTrack: "1" }, { doNotTrack: "0" })("event", { ...base }), null);
  assert.equal(load({ doNotTrack: "0", msDoNotTrack: "1" })("event", { ...base }), null);
  assert.equal(load({ doNotTrack: "unspecified" }, { doNotTrack: "yes" })("event", { ...base }), null);
  assert.notEqual(load({ doNotTrack: "0", msDoNotTrack: "0" }, { doNotTrack: "0" })("event", { ...base }), null);
});

test("url keeps exactly the five utm keys, in order", () => {
  const out = load()("event", {
    ...base,
    url:
      "https://rauhut.com/en?utm_source=linkedin&gclid=abc&utm_medium=social" +
      "&utm_campaign=q4&utm_id=7&fbclid=x&utm_content=a&utm_term=b&email=a%40b.de",
  });
  assert.equal(
    out.url,
    "https://rauhut.com/en?utm_source=linkedin&utm_medium=social" +
      "&utm_campaign=q4&utm_content=a&utm_term=b",
  );
});

test("the filter is a list, not a prefix: utm_id and utm_foo are dropped", () => {
  const out = load()("event", {
    ...base,
    url: "https://rauhut.com/?utm_id=1&utm_foo=2&utm_sourcex=3",
  });
  assert.equal(out.url, "https://rauhut.com/");
});

test("referrer loses its whole query, utm keys included", () => {
  const hook = load();
  assert.equal(
    hook("event", {
      ...base,
      referrer: "https://www.google.com/search?q=rauhut&utm_source=g",
    }).referrer,
    "https://www.google.com/search",
  );
  assert.equal(
    hook("event", { ...base, referrer: "/x?utm_source=a&q=b" }).referrer,
    "/x",
  );
  assert.equal(
    hook("event", { ...base, referrer: "/en?token=secret#top" }).referrer,
    "/en",
  );
});

test("the fragment is dropped", () => {
  const out = load()("event", {
    ...base,
    url: "https://rauhut.com/?utm_source=x#kontakt",
  });
  assert.equal(out.url, "https://rauhut.com/?utm_source=x");
});

test("urls without a query pass through; empty values stay empty", () => {
  const out = load()("event", { ...base });
  assert.equal(out.url, "https://rauhut.com/");
  assert.equal(out.referrer, "");
});

test("a null payload stays null", () => {
  assert.equal(load()("event", null), null);
});
