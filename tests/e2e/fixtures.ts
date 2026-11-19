// Shared Playwright fixture: every page answers the Umami host locally.
//
// The e2e server runs with a test website id (playwright.config.ts), so the
// layout renders the Umami tracker in every test. Without this fixture each
// test would depend on stats.neckarshore.ai being reachable from the runner.
//
// The stub follows the contract of Umami's tracker v3.4.1
// (src/tracker/index.ts at tag v3.4.1, read 2026-11-18): it reads its config
// from data-* attributes on its own <script>, calls window[data-before-send]
// (type, payload) and sends nothing when that returns a falsy value; the
// payload carries website, screen, language, title, hostname, url, referrer.
// It is NOT the real tracker: it proves the wiring (attributes, CSP, load
// order of the hook), while scripts/umami-before-send.test.mjs proves the
// hook's logic. The real tracker is checked against the box at go-live.
import { test as base, expect } from "@playwright/test";
import { UMAMI_HOST } from "../../src/lib/umami";

export const UMAMI_STUB = `(() => {
  const s = document.currentScript;
  const cfg = (k) => s.getAttribute("data-" + k);
  if (cfg("do-not-track") === "true" && navigator.doNotTrack === "1") return;
  const host = s.src.split("/").slice(0, -1).join("/");
  const payload = {
    website: cfg("website-id"),
    screen: screen.width + "x" + screen.height,
    language: navigator.language,
    title: document.title,
    hostname: location.hostname,
    url: location.href,
    referrer: document.referrer,
  };
  const hook = window[cfg("before-send")];
  const out = typeof hook === "function" ? hook("event", payload) : payload;
  if (!out) return;
  fetch(host + "/api/send", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "event", payload: out }),
  });
})();`;

export const test = base.extend<{ umamiStub: void }>({
  umamiStub: [
    async ({ page }, use) => {
      await page.route(`${UMAMI_HOST}/**`, (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path === "/script.js") {
          return route.fulfill({
            contentType: "application/javascript",
            body: UMAMI_STUB,
          });
        }
        return route.fulfill({ contentType: "application/json", body: "{}" });
      });
      await use();
    },
    { auto: true },
  ],
});

export { expect };
