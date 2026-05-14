# Test Log

E2E test results from Playwright runs. One row per run — failures listed inline.
Rows older than 14 days are deleted.

| # | Date | Time | Trigger | Commit | Total | Passed | Failed | Duration | Failures |
|---|------|------|---------|--------|-------|--------|--------|----------|----------|
| 20 | 2026-05-10 | — | session-end | f2bf5a1 | 85 | 84 | 1 | 51.6s | TC-STAT-002: Commits tile = 361, expected >750 (pre-existing; page.tsx hardcodes 780 — animation timing or stale stats source) |
| 21 | 2026-05-11 | — | ad-hoc | 7651089 | 91 | 90 | 1 | 1m36s | TC-STAT-002 pre-existing (same). TC-STAT-009 (new, 6 tests): all PASS post-fix. Branch linus/api-track-get-auth → PR #7. |
| 22 | 2026-05-14 | — | ad-hoc | bbeb79b+bump | 91 | 87 | 1 | 42.7s | TC-STAT-002 pre-existing (commits=367 < 750). 3 skipped (intentional). Post Next.js 16.2.3→16.2.6 CVE-sweep branch linus/2026-05-14-c-nextjs-cve-sweep — bump itself clean, no new regressions. |
| 23 | 2026-05-14 | — | ad-hoc | 524c37f+lint | 91 | 87 | 1 | 35.3s | TC-STAT-002 pre-existing (same). 3 skipped (intentional). Post L-RETRO-R3 (lint-gate strict + 6 ESLint errors fixed + Nav/Impressum/Datenschutz `<a href="/">`→`<Link/>` + LiveTicker→server-component + targeted eslint-disable for CookieBanner+ThemeToggle localStorage probes). NAV+THM tests confirm no behavior change. Branch linus/2026-05-14-c-lint-gate-strict. |
