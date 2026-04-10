# Lighthouse Log

Rolling 14-day window of Lighthouse audit runs across all 3 profiles (Desktop, Mobile 4G, Mobile Slow).

See `CLAUDE.md` → "Lighthouse Device Matrix" for profile definitions and gate policy.

## Format

| # | Date | Commit | Profile | Perf | A11y | BP | SEO | LCP | TBT | CLS | Trigger |
|---|------|--------|---------|------|------|----|-----|-----|-----|-----|---------|

- **Profile:** `desktop`, `mobile-4g`, `mobile-slow`
- **Trigger:** `session-start`, `session-end`, `ad-hoc`, `ci`
- **LCP / TBT:** milliseconds or seconds
- **CLS:** unitless (target < 0.1)
- **Cleanup:** rows older than 14 days deleted at session close

## Runs

| # | Date | Commit | Profile | Perf | A11y | BP | SEO | LCP | TBT | CLS | Trigger |
|---|------|--------|---------|------|------|----|-----|-----|-----|-----|---------|
| 1 | 2026-04-10 | b6015bc | desktop | 100 | 100 | 100 | 100 | 678ms | 0ms | 0.001 | local-baseline |
| 2 | 2026-04-10 | b6015bc | mobile-4g | 95 | 100 | 100 | 100 | 2.8s | 74ms | 0.001 | local-baseline |
| 3 | 2026-04-10 | b6015bc | mobile-slow | 71 | 100 | 100 | 100 | 9.6s | 124ms | 0.001 | local-baseline |
| 4 | 2026-04-10 | ccded1b | desktop | 100 | 100 | 100 | 100 | 525ms | 16ms | 0.001 | ci |
| 5 | 2026-04-10 | ccded1b | mobile-4g | 94 | 100 | 100 | 100 | 3.0s | 100ms | 0.001 | ci |
| 6 | 2026-04-10 | ccded1b | mobile-slow | 70 | 100 | 100 | 100 | 9.6s | 159ms | 0.001 | ci |

> **Baseline established 2026-04-10.** Mobile Slow (Edge-5G) reveals the blind spot: Perf 70-71, LCP 9.6s. This is the scenario a colleague reported from France on weak 5G. CI vs local delta is minimal (±1 point), confirming the profile is stable across hosts. Stage 2 follow-up: set Mobile Slow threshold based on this baseline (e.g., Perf ≥ 65) once 3-5 runs confirm variance envelope.
