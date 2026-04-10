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
| 7 | 2026-04-10 | 7c6ac9a | mobile-4g | 93 | 100 | 100 | 100 | 3.0s | 102ms | 0.000 | ad-hoc (pre-SEO-fix; baseline before srcset repair) |
| 8 | 2026-04-10 | 7c6ac9a | desktop | 100 | 100 | 100 | 100 | 653ms | 0ms | 0.001 | ad-hoc (pre-SEO-fix; baseline before srcset repair) |
| 9 | 2026-04-10 | 052863b | mobile-4g | 95 | 100 | 100 | 100 | 2.6s | 70ms | 0.000 | ad-hoc (post-deploy vs prod, srcset-fix validation — LCP −0.4s vs row 7) |
| 10 | 2026-04-10 | 052863b | mobile-slow | 54 | 100 | 100 | 100 | 8.0s | 231ms | 0.000 | ad-hoc (Stage 2 baseline 1/3 vs prod) |
| 11 | 2026-04-10 | 052863b | mobile-slow | 53 | 100 | 100 | 100 | 8.0s | 561ms | 0.001 | ad-hoc (Stage 2 baseline 2/3 vs prod) |
| 12 | 2026-04-10 | 052863b | mobile-slow | 44 | 100 | 100 | 100 | 8.0s | 1.2s | 0.001 | ad-hoc (Stage 2 baseline 3/3 vs prod) |
| 13 | 2026-04-10 | 27db642 | mobile-4g | 94 | 96 | 100 | 100 | 2.6s | 122ms | 0.000 | session-start vs prod — **A11y regression**: 19x `text-accent` (#0e7490) on slate-800/900 below WCAG AA (2.74-3.33:1, need 4.5:1), stat-tile subtitles |
| 14 | 2026-04-10 | 91aa708 | mobile-4g | 93 | 96 | 100 | 100 | 2.6s | 141ms | 0.000 | post-fix vs prod — stat-tile fix (`accent-bright`) shipped + verified. A11y stays at 96 because axe now surfaces 6 other contrast issues (CTA muted, Email link, Footer mono, CookieBanner link, hero inline-accent, `text-text-secondary/50` opacity). **Accepted at 96 > 95 hard gate**, deferred as P2 "A11y Hardening Pass" |

> **Baseline established 2026-04-10 (local, rows 1/3).** Mobile Slow (Edge-5G) reveals the blind spot: Perf 70-71, LCP 9.6s. This is the scenario a colleague reported from France on weak 5G. CI vs local delta is minimal (±1 point).

> **Prod-vs-local delta 2026-04-10 (rows 10-12).** Mobile Slow against the live Vercel URL scored Perf 44/53/54, LCP stable at 8.0s, TBT 231/561/1200ms. 10-point spread on Perf, 5× spread on TBT — run-to-run variance dominates the signal. LCP 8.0s vs local 9.6s (−1.6s) confirms CDN/edge caching is working; Perf delta vs local is misleading because local runs hit a cold prod build while prod runs hit CDN with variable TBT from Vercel function cold starts.

> **Stage 2 gate decision:** Cannot set hard threshold yet. 3 runs with 10-point Perf variance violate the "stable baseline" prerequisite. Options: (a) collect 5 more runs in same conditions, compute p25 and set `p25 − 3`; (b) investigate TBT variance root cause first (likely hydration JS on slow CPU emulation). Keeping soft-warn until either is resolved. See session report 2026-04-10-linus-fe-d.md.
