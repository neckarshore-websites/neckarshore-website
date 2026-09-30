/**
 * `test` with a `page` whose every document navigation is checked against the site identity
 * (see live-target.ts for why). Specs that can run against production (`@smoke`, via
 * `npm run test:smoke`) import `test` from here instead of from "@playwright/test".
 *
 * Checked on EVERY `page.goto`, not once before the run: the Vercel mitigation reacts to
 * traffic patterns, and a smoke run is traffic. A single pre-flight fetch can pass while the
 * browser gets challenged halfway through the suite.
 *
 * It runs against localhost too (the smoke specs are part of the CI E2E suite), which is
 * deliberate: that keeps the positive path exercised on every PR instead of only on the rare
 * manual live run.
 */
import { test as base, expect } from "@playwright/test";
import { classifyTargetResponse } from "./live-target";

export const test = base.extend({
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      // null = same-document navigation (hash change); there is no new document to check.
      if (response) {
        const verdict = classifyTargetResponse(
          response.url(),
          response.status(),
          await response.text(),
        );
        if (!verdict.ok) throw new Error(verdict.reason);
      }
      return response;
    };
    // Named `provide`, not `use`: the React hooks lint rule reads a bare `use(...)` as a hook call.
    await provide(page);
  },
});

export { expect };
