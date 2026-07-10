/**
 * Deterministic test-only Bearer token for the `/api/track` GET PII-read
 * success-path tests (TC-STAT-009-4/5).
 *
 * WHY THIS EXISTS
 * ---------------
 * The `/api/track` GET endpoint gates the 90-day visitor-hash + geo + UTM +
 * referrer PII read behind `ANALYTICS_READ_TOKEN` (dr-sommer Z1 Finding 1.1).
 * CI provisions no such token, so the success-path assertions used to
 * `test.skip` on the unset env var — meaning the PII-read behaviour on the
 * flagship site was never actually exercised in CI (false coverage, WO-2 #400).
 *
 * This constant is NOT a secret. It exists purely so the Playwright-managed
 * dev server (see `playwright.config.ts` → `webServer.env`) and the auth spec
 * agree on a value, letting the success-path genuinely execute in CI WITHOUT
 * provisioning a real production secret (AP-1: prefer a fixture over a real
 * secret in CI).
 *
 * If a real `ANALYTICS_READ_TOKEN` is present in the environment (e.g. a local
 * run against a provisioned server), it wins — server and test stay in sync.
 */
export const TEST_ANALYTICS_READ_TOKEN =
  process.env.ANALYTICS_READ_TOKEN ||
  "e2e-fixture-analytics-read-token-not-a-secret-000000000000000000";
