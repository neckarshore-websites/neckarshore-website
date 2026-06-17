# Test Log

E2E test results from Playwright runs. One row per run — failures listed inline.
Rows older than 14 days are deleted.

| # | Date | Time | Trigger | Commit | Total | Passed | Failed | Duration | Failures |
|---|------|------|---------|--------|-------|--------|--------|----------|----------|
| 24 | 2026-06-12 | — | session-start | deed060 | 91 | 88 | 0 | 49.9s | — (3 skipped intentional; TC-STAT-002 now green). Precondition run before wiring e2e.yml into CI. |
| 25 | 2026-06-12 | — | session-end | 46b80a3 | 91 | 88 | 0 | 45.0s | — (3 skipped intentional). On main post e2e.yml merge (PR #27). CI gate runs 87 (excl. 4 @external). |
| 26 | 2026-06-12 | — | ad-hoc | b8556ff | 91 | 88 | 0 | 21.6s | — (3 skipped intentional). Contact form added (dormant Turnstile) in #cta; a11y/responsive/smoke/console all green. |
| 27 | 2026-06-17 | — | session-end | baa3025 | 137 | 133 | 0 | 42.0s | — (4 skipped intentional: ANALYTICS_READ_TOKEN-gated). +34 content-surface tests (TC-CNT-001..031) for the ClearPath product-surface Durchstich (/glossar + /products + /products/clearpath); incl. TC-CNT-007/024 "Wie dieser Text entstand" note gate. PR #40 CI green on baa3025. |
| 28 | 2026-06-17 | — | ad-hoc | 07cd4a2 | 168 | 162 | 0 | 1.9m | — (4 skipped intentional: ANALYTICS_READ_TOKEN-gated; CI-parity retries=2). Products tree rebuild: 4 sub-portals + 8 /products/[slug] skeletons + config-driven Nav; TC-NAV-004 + TC-CNT-010 + TC-CNT-030/031 NEW_PAGES updated. 2 flaky recovered on retry (TC-NAV-006/007 nav-scroll on /impressum+/datenschutz — next-dev-under-load timing on untouched code; main baseline + standalone both green). |
| 29 | 2026-06-17 | — | ad-hoc | d0672a8 | 164 | 160 | 0 | 1.1m | — (4 skipped intentional: ANALYTICS_READ_TOKEN-gated; CI-parity). SkillCard rebuild on /products/skills — rich OSS cards replace the ProductCard grid; accessibility (no heading skip, cards @h2) + content-surface + responsive @393px all green. |
| 30 | 2026-06-17 | — | ad-hoc | 72cfb27 | 164 | 160 | 0 | 53.1s | — (4 skipped intentional; CI-parity). 5th Skills card (Restaurant-Menüpflege reference) + repo-optional SkillCard. NOTE: a prior run falsely reported 87 fail — a zombie reuse-existing dev server on :3000 (degraded under parallel-session load); killed, clean re-run = 160 pass. |
