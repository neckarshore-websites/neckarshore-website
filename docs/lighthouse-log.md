# Lighthouse Log

Rolling 14-day window of Lighthouse audit runs across all 3 profiles (Desktop, Mobile 5G, Mobile 4G).

See `CLAUDE.md` → "Lighthouse Device Matrix" for profile definitions and gate policy.

## Format

| # | Date | Commit | Profile | Perf | A11y | BP | SEO | LCP | TBT | CLS | Trigger |
|---|------|--------|---------|------|------|----|-----|-----|-----|-----|---------|

- **Profile:** `desktop`, `mobile-5g`, `mobile-4g` (the legacy `mobile-slow` / Edge-5G profile was retired 2026-06-18; older rows below keep it for history)
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
| 15 | 2026-04-12 | 65f2e26 | mobile-4g | 94 | **100** | 100 | 100 | 3.0s | 38ms | 0.001 | ad-hoc (post-A11y Hardening Pass) — closed all 6 dark-mode contrast violations: Pattern A (Logo `.AI`, Email link, CookieBanner) → `dark:text-accent-bright`; Pattern B (CTA "oder", footer copyright, LiveTicker wrapper) → new `dark:text-text-tertiary` token (#94A3B8, 6.4:1 on deep-space, 5.6:1 on surface). A11y 96 → 100. First mobile-4g run flagged Perf 89 (TBT 236ms CPU blip); re-run stabilized at 94. |
| 16 | 2026-04-12 | 65f2e26 | desktop | 100 | 100 | 100 | 100 | 680ms | 8ms | 0.001 | ad-hoc (post-A11y Hardening Pass) — unchanged, control run vs row 15 |
| 17 | 2026-04-13 | 3f9efc0 | mobile-slow | 67 | 96 | 100 | 100 | 9.6s | 120ms | 0.001 | Stage 2 baseline run 1/3 |
| 18 | 2026-04-13 | 3f9efc0 | mobile-slow | 68 | 96 | 100 | 100 | 9.5s | 46ms | 0.001 | Stage 2 baseline run 2/3 |
| 19 | 2026-04-13 | 3f9efc0 | mobile-slow | 68 | 96 | 100 | 100 | 9.4s | 44ms | 0.001 | Stage 2 baseline run 3/3 |
| 20 | 2026-04-19 | 2fcc117 | desktop | 100 | 96 | 100 | — | 719ms | 13ms | 0.004 | ci (post R4 OMNIXIS→OMNOPSIS rebrand) |
| 21 | 2026-04-19 | 2fcc117 | mobile-4g | 95 | 96 | 100 | — | 2.9s | 51ms | 0.037 | ci (post R4 OMNIXIS→OMNOPSIS rebrand) |
| 22 | 2026-04-19 | 2fcc117 | mobile-slow | 68 | 96 | 100 | — | 9.3s | 104ms | 0.037 | ci (post R4 OMNIXIS→OMNOPSIS rebrand) |
| 23 | 2026-06-17 | bbf92c1 | desktop | 100 | 96 | 100 | 100 | 704ms | 8ms | 0.001 | ad-hoc (/products/clearpath — ClearPath Durchstich) |
| 24 | 2026-06-17 | bbf92c1 | mobile-4g | 91 | 96 | 100 | 100 | 2.7s | 239ms | 0.000 | ad-hoc (/products/clearpath — ClearPath Durchstich) |
| 25 | 2026-06-17 | bbf92c1 | mobile-slow | 70 | 96 | 100 | 100 | 8.5s | 66ms | 0.002 | ad-hoc (/products/clearpath — ClearPath Durchstich) |
| 26 | 2026-06-21 | linus/product-faqs | desktop | 100 | 96 | 100 | 100 | 556ms | 0ms | 0.001 | ad-hoc (/products/omnopsis — FAQ-pass) |
| 27 | 2026-06-21 | linus/product-faqs | mobile-5g | 100 | 96 | 100 | 100 | 255ms | 8ms | 0.002 | ad-hoc (/products/omnopsis — FAQ-pass) |
| 28 | 2026-06-21 | linus/product-faqs | mobile-4g | 99 | 96 | 100 | 100 | 2.0s | 10ms | 0.002 | ad-hoc (/products/omnopsis — FAQ-pass) |
| 29 | 2026-06-22 | linus/clickable-cards | desktop | 100 | 96 | 100 | 100 | 532ms | 0ms | 0.001 | ad-hoc (/products/mmps — clickable cards) |
| 30 | 2026-06-22 | linus/clickable-cards | mobile-5g | 100 | 96 | 100 | 100 | 174ms | 10ms | 0.002 | ad-hoc (/products/mmps — clickable cards) |
| 31 | 2026-06-22 | linus/clickable-cards | mobile-4g | 97 | 96 | 100 | 100 | 2.6s | 10ms | 0.002 | ad-hoc (/products/mmps — clickable cards) |
| 32 | 2026-06-22 | linus/unify-card-layout | desktop | 100 | 96 | 100 | 100 | 568ms | 0ms | 0.001 | ad-hoc (/products/skills — unified 4-corner cards) |
| 33 | 2026-06-22 | linus/unify-card-layout | mobile-5g | 100 | 96 | 100 | 100 | 204ms | 10ms | 0.002 | ad-hoc (/products/skills — unified 4-corner cards) |
| 34 | 2026-06-22 | linus/unify-card-layout | mobile-4g | 96 | 96 | 100 | 100 | 2.8s | 10ms | 0.002 | ad-hoc (/products/skills — unified 4-corner cards) |
| 35 | 2026-06-22 | linus/products-detail-cta-table | desktop | 100 | 96 | 100 | 100 | 526ms | 0ms | 0.001 | ad-hoc (/products/websites/neckarshore — Technik table) |
| 36 | 2026-06-22 | linus/products-detail-cta-table | mobile-5g | 100 | 96 | 100 | 100 | 292ms | 15ms | 0.002 | ad-hoc (/products/websites/neckarshore — Technik table) |
| 37 | 2026-06-22 | linus/products-detail-cta-table | mobile-4g | 97 | 96 | 100 | 100 | 2.6s | 13ms | 0.002 | ad-hoc (/products/websites/neckarshore — Technik table) |

> **Baseline established 2026-04-10 (local, rows 1/3).** Mobile Slow (Edge-5G) reveals the blind spot: Perf 70-71, LCP 9.6s. This is the scenario a colleague reported from France on weak 5G. CI vs local delta is minimal (±1 point).

> **Prod-vs-local delta 2026-04-10 (rows 10-12).** Mobile Slow against the live Vercel URL scored Perf 44/53/54, LCP stable at 8.0s, TBT 231/561/1200ms. 10-point spread on Perf, 5× spread on TBT — run-to-run variance dominates the signal. LCP 8.0s vs local 9.6s (−1.6s) confirms CDN/edge caching is working; Perf delta vs local is misleading because local runs hit a cold prod build while prod runs hit CDN with variable TBT from Vercel function cold starts.

> **Stage 2 complete (2026-04-13).** 5 local/CI runs: [67, 68, 68, 70, 71]. Median 68, range 4 pts. Threshold set to `median − 5 = 63` (soft-warn). A11y/BP/SEO thresholds set to 95, matching other profiles. Validation run scored 56 (CPU contention outlier, TBT 277ms) — correctly triggered soft warning without blocking CI. Flakiness confirmed, soft-gate design validated.
