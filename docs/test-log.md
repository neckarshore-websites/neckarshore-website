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
| 7 | 2026-04-12 | 23:50:00 | session-end | 600f9e4 | 79 | 79 | 0 | 39s | — (post-OG-Drift-Fix, 5 new SEO tests: TC-SEO-010..014) |
| 8 | 2026-04-13 | — | session-start | cd42d31 | 79 | 79 | 0 | 34s | — |
| 9 | 2026-04-13 | — | ad-hoc | 7dea3d4 | 82 | 82 | 0 | 42s | — (post-OG-description-fix, 3 new: TC-SEO-015..017) |
| 10 | 2026-04-13 | — | ad-hoc | 75af305 | 85 | 85 | 0 | 48s | — (post-canonical-fix, 3 new: TC-SEO-018..020) |
| 11 | 2026-04-13 | — | session-end | 75af305 | 85 | 85 | 0 | 53s | — |
| 12 | 2026-04-13 | — | session-end | 108cc05 | 85 | 85 | 0 | 28s | — (Session B: article:author removed, logo srcset trimmed, font preload deferred) |
| 13 | 2026-04-13 | — | session-start | 3f9efc0 | 85 | 85 | 0 | 34s | — |
| 14 | 2026-04-13 | — | session-end | b2422ef | 85 | 85 | 0 | 37s | — (Session C: Mobile Slow Stage 2 threshold set) |
| 15 | 2026-04-13 | — | session-start | 16abeee | 85 | 85 | 0 | 51s | — |
| 16 | 2026-04-13 | — | session-end | 8c41c4d | 85 | 85 | 0 | 21s | — |
| 17 | 2026-04-14 | — | session-start | 927d3d5 | 85 | 85 | 0 | 24s | — |
| 18 | 2026-04-14 | — | ad-hoc | 927d3d5 | 85 | 85 | 0 | 30s | — (post Next 16.2.3 + lucide-react pin + optimizePackageImports) |
| 19 | 2026-04-19 | — | ad-hoc | (pre-commit) | 85 | 85 | 0 | 53s | — (R4 OMNIXIS→OMNOPSIS rebrand: lib/brand.ts + page.tsx + Nav + TrackerScript + llms.txt + 3 e2e specs; section anchor #omnixis→#omnopsis) |
