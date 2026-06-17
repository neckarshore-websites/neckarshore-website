# Test Log

E2E test results from Playwright runs. One row per run — failures listed inline.
Rows older than 14 days are deleted.

| # | Date | Time | Trigger | Commit | Total | Passed | Failed | Duration | Failures |
|---|------|------|---------|--------|-------|--------|--------|----------|----------|
| 24 | 2026-06-12 | — | session-start | deed060 | 91 | 88 | 0 | 49.9s | — (3 skipped intentional; TC-STAT-002 now green). Precondition run before wiring e2e.yml into CI. |
| 25 | 2026-06-12 | — | session-end | 46b80a3 | 91 | 88 | 0 | 45.0s | — (3 skipped intentional). On main post e2e.yml merge (PR #27). CI gate runs 87 (excl. 4 @external). |
| 26 | 2026-06-12 | — | ad-hoc | b8556ff | 91 | 88 | 0 | 21.6s | — (3 skipped intentional). Contact form added (dormant Turnstile) in #cta; a11y/responsive/smoke/console all green. |
| 27 | 2026-06-17 | — | session-end | baa3025 | 137 | 133 | 0 | 42.0s | — (4 skipped intentional: ANALYTICS_READ_TOKEN-gated). +34 content-surface tests (TC-CNT-001..031) for the ClearPath product-surface Durchstich (/glossar + /products + /products/clearpath); incl. TC-CNT-007/024 "Wie dieser Text entstand" note gate. PR #40 CI green on baa3025. |
