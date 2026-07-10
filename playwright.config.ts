import { defineConfig, devices } from "@playwright/test";
import { TEST_ANALYTICS_READ_TOKEN } from "./tests/e2e/analytics-test-token";

const PORT = process.env.PORT || "3000";
const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`;
const isLocal = baseURL.includes("localhost");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(isLocal
    ? {
        webServer: {
          command: `npm run dev -- --port ${PORT}`,
          url: `http://localhost:${PORT}`,
          reuseExistingServer: !process.env.CI,
          // Provision the analytics read-token on the managed dev server so the
          // /api/track GET PII success-path (TC-STAT-009-4/5) genuinely executes
          // in CI instead of test.skip'ing on an unset secret (WO-2 #400). The
          // value is a deterministic fixture, not a real secret — see
          // tests/e2e/analytics-test-token.ts. Playwright REPLACES the command
          // env when `env` is set, so spread process.env to keep PATH etc.
          //
          // CAVEAT (local only): `reuseExistingServer` is true off-CI, so if a
          // dev server is ALREADY running Playwright attaches to it and skips
          // this command + env — the token is only injected when Playwright
          // starts the server itself. To run these tests against a prestarted
          // server, export the same token first
          // (`export ANALYTICS_READ_TOKEN=…`), or the /api/track GET paths 401.
          // In CI `reuseExistingServer` is false, so the server is always fresh
          // and always gets the token.
          env: {
            ...(process.env as Record<string, string>),
            ANALYTICS_READ_TOKEN: TEST_ANALYTICS_READ_TOKEN,
          },
        },
      }
    : {}),
});
