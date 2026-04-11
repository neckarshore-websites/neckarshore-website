# Test Log

E2E test results from Playwright runs. One row per run — failures listed inline.
Rows older than 14 days are deleted.

| # | Date | Time | Trigger | Commit | Total | Passed | Failed | Duration | Failures |
|---|------|------|---------|--------|-------|--------|--------|----------|----------|
| 1 | 2026-04-01 | 16:42:00 | ad-hoc | 10909c5 | 48 | 48 | 0 | 27s | — |
| 2 | 2026-04-01 | 22:08:00 | session-end | ad64e98 | 61 | 61 | 0 | 33s | — |
| 3 | 2026-04-10 | 11:02:00 | session-end | 8c0ca90 | 13 | 13 | 0 | 10s | — (smoke-only vs prod; local webServer blocked by :3000) |
| 4 | 2026-04-10 | 12:20:00 | ad-hoc | 7c6ac9a | 74 | 74 | 0 | 17s | — (post-SEO-brand-fix; full suite vs 127.0.0.1:3001, port 3000 blocked by OMNIXIS backend) |
| 5 | 2026-04-12 | 00:30:00 | session-start | 2aa6371 | 74 | 74 | 0 | 56s | — (Playwright webServer on PORT=3100 while OMNIXIS backend held :3000 — Item #14 fix validated) |
| 6 | 2026-04-12 | 00:47:00 | ad-hoc | 711a4a2 | 74 | 74 | 0 | 46s | — (post-A11y Hardening Pass verification, PORT=3100, all Theme/Contrast TC-THM-001..003 green) |
