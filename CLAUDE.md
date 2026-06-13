@AGENTS.md

## Deploy Policy

- **Push after every commit on `main`.** No local-only commits — Vercel auto-deploys on push.
- Exception: only hold back if explicitly told to ("nicht pushen", "noch nicht deployen").

## E2E Tests (Playwright)

### Commands

- `npm run test:e2e` — run all tests (headless, ~25s)
- `npm run test:e2e:ui` — run with Playwright UI (interactive debugging)

### Test Suites

| Suite | File | Tests | What |
|-------|------|-------|------|
| Smoke | `tests/e2e/smoke.spec.ts` | 5 | Critical-path loads (TC-SMK-*) — homepage, subpages, no console errors |
| Navigation | `tests/e2e/navigation.spec.ts` | 10 | Anchor scroll per section, subpage nav, footer, logo, mobile menu |
| Links | `tests/e2e/links.spec.ts` | 9 | No 404s, `target="_blank"`, external link reachability |
| Calendly | `tests/e2e/calendly.spec.ts` | 3 | CTA URL correct, reachable, on all pages |
| Theme | `tests/e2e/theme.spec.ts` | 3 | Dark/light toggle, WCAG AA contrast (accent + headings) |
| Responsive | `tests/e2e/responsive.spec.ts` | 12 | No overflow on 393/414/768px, nav usable |
| SEO | `tests/e2e/seo.spec.ts` | 20 | Meta title/description per page, JSON-LD, robots.txt, sitemap.xml |
| Accessibility | `tests/e2e/accessibility.spec.ts` | 15 | H1 count, heading hierarchy, lang, alt text, aria — all pages |
| Stats | `tests/e2e/stats.spec.ts` | 8 | Stats tiles render with backend values (TC-STAT-*) |
| API Track Auth | `tests/e2e/api-track-auth.spec.ts` | 6 | `/api/track` GET auth-hardening (TC-STAT-009, dr-sommer Z1.1) |

Total: 91 tests across 10 suites.

### When to Run

- **Session start:** `npm run test:e2e`, log as `session-start`
- **Session end:** `npm run test:e2e`, log as `session-end`
- **After significant changes:** log as `ad-hoc`

### Logging Results

Log every run in `docs/test-log.md` — one row per run (compact format):

```
| # | Date | Time | Trigger | Commit | Total | Passed | Failed | Duration | Failures |
```

- **Trigger:** `session-start`, `session-end`, or `ad-hoc`
- **Failures:** test ID + short description, or `—` if all green
- **Cleanup:** delete rows older than 14 days

### Test IDs

Every test has a stable ID: `TC-[SUITE]-[NNN]`. Suites: `NAV`, `LNK`, `CAL`, `THM`, `RES`, `SEO`, `A11Y`, `SMK`, `STAT`, `MAN-OG`.
Use test IDs when referencing tests in logs, reports, and issues.

### Adding Tests

- One spec file per concern, in `tests/e2e/`
- Assign the next available TC-ID in the suite
- Viewports: 393px (iPhone 15 Pro), 414px (iPhone 14 Plus), 768px (iPad Mini)
- Chromium only (Firefox/WebKit added when needed)

## Manual Tests (Human-in-the-Loop)

### Test Cases

Documented in `docs/manual-tests.md`. These require a human with browser access (OG previews, LinkedIn inspector, Rich Results Test).

Suites: `TC-MAN-OG-001` through `TC-MAN-OG-004`.

### When to Offer

At session end, after E2E tests pass, ask:
> "E2E grün. Willst du in diesem Run die manuellen Test Cases durchführen? (`docs/manual-tests.md`)"

Only offer when: OG/meta tags changed, SEO work done, or deploy to production happened.

### Logging Results

Log results in the "Results Log" table in `docs/manual-tests.md`. Tester is always "User".

## CI Health Check (Session Startup)

At every session start, **before any feature work**, run:

```bash
gh run list --workflow=lighthouse.yml --limit=3 --json conclusion,createdAt,headBranch
gh run list --workflow=lint.yml --limit=3 --json conclusion,createdAt,headBranch
gh run list --workflow=update-stats.yml --limit=3 --json conclusion,createdAt,headBranch
```

(No dedicated `e2e.yml` workflow — E2E suite runs locally via `npm run test:e2e`. CI-side E2E is a backlog item.)

- If any run shows `"conclusion": "failure"` → investigate and fix **before** starting new work
- Report CI status in session greeting: "CI: ✅ grün" or "CI: ❌ Lighthouse failing since [date]"
- Lighthouse runs on every push to `main` and weekly (Monday 06:00 UTC)

## Lighthouse Device Matrix

Three profiles, differentiated gates. Hard gates fail CI; soft gates report warnings only.

| # | Profil | Form Factor | Network | CPU | Gate | Perf Threshold | Purpose |
|---|--------|-------------|---------|-----|------|----------------|---------|
| 1 | Desktop | desktop | 40ms / 10 Mbps | 1× | Hard | 80 | LAN baseline — developer experience |
| 2 | Mobile 4G | mobile | 150ms / 1.6 Mbps | 4× | Hard | 90 | Default mobile user (German city) |
| 3 | Mobile Slow | mobile | 400ms / 400 Kbps | 6× | Soft-Warn | 63 | Edge-of-coverage (weak 5G, rural, train) |

**Accessibility / Best Practices / SEO:** all 95 across all profiles (hard on Desktop + Mobile 4G, soft-warn on Mobile Slow).

### Commands

- `npm run lighthouse:quick` — all 3 profiles (CI mode, assumes server on :3000)
- `npm run lighthouse:desktop` — single profile for dev-loop iteration
- `npm run lighthouse:mobile` — single profile (Mobile 4G) for dev-loop
- `npm run lighthouse:slow` — single profile (Mobile Slow / Edge-5G) for dev-loop
- `npm run lighthouse` — full pipeline (build + start + all profiles + stop)

### Gate Philosophy

- **Desktop (hard, 80):** Relaxed 95 → 80 on 2026-06-13 (cross-site calibration, D-LIN-27-2 / Codify-Brief #458 "anchor below worst-observed"). On a 1× CPU preset these static pages are so fast the composite Perf score tracks shared-runner TBT jitter, not the site — observed {86, 93, 98, 100} ⇔ TBT {308, 203, 105, 2}ms while LCP <1s / CLS 0.004 stay rock-solid. The old 95 false-red on pure runner noise and got admin-bypassed repeatedly (PR #94, neckarshore main reds). 80 sits ~6pp under worst-normal-observed; a real regression below 80 still hard-fails. Mobile 4G (90) is the real perf canary.
- **Mobile 4G (hard, 90):** Mobile 4G scores 96 in practice. 6-point buffer. Catches silent regressions — the previous threshold of 85 was a monitoring hole, not a safety net.
- **Mobile Slow (soft, 63):** Stage 2 complete (2026-04-13). 5-run baseline: [67, 68, 68, 70, 71], median 68, threshold = median − 5. Purpose is **visibility**, not blocking.

### Reports

Per-profile JSON reports land in `.lighthouse/report-<profile>.json` and are uploaded as CI artifacts (14-day retention). Script surfaces LCP / FCP / TBT / CLS / Speed Index raw values alongside category scores.

### Delta Awareness

If a previous report exists before a run, the script prints the score delta next to each category (e.g., `Performance: 94 (−2 vs last)`). Helps spot slow drift over time.

### Logging Results

Log every run in `docs/lighthouse-log.md` — one row per run per profile:

```
| # | Date | Commit | Profile | Perf | A11y | BP | SEO | LCP | TBT | CLS | Trigger |
```

- **Trigger:** `session-start`, `session-end`, `ad-hoc`, `ci`
- **Cleanup:** delete rows older than 14 days

## SEO — Structured Data (JSON-LD)

> **Important:** Render JSON-LD via a **native HTML `<script type="application/ld+json">` tag**, NOT via `next/script`.

### Why (AD-19, Session C 2026-04-10)

`next/script` with `strategy="beforeInteractive"` or `"afterInteractive"` injects the payload into Next's hydration stream, not into the server-rendered HTML. Google's crawler reads the raw SSR response and will NOT see schema that only exists in the hydration payload — the brand entity becomes invisible to search.

This bit us once: the XSS security hook blocked the raw-HTML injection prop on inline script elements, we worked around it with `next/script`, and shipped a JSON-LD that looked correct in DevTools but was missing from `curl https://neckarshore.ai/`. Google Rich Results Test: zero items detected.

### The Rule

1. Use a native `<script>` element rendered directly in JSX, with the schema JSON as its text content.
2. Render it inside a **Server Component** (not a Client Component) so it lands in the SSR HTML.
3. If the XSS/security hook blocks the pattern, talk to James — do NOT reach for `next/script` as the workaround.

### Verification (mandatory after any JSON-LD change)

```bash
# 1. Confirm both scripts are in the SSR HTML, not the hydration payload:
curl -s https://neckarshore.ai/ | grep -c 'application/ld+json'   # expect >= 2

# 2. Parse and list @types from @graph:
curl -s https://neckarshore.ai/ | python3 -c "import sys,re,json; [print(n.get('@type')) for m in re.findall(r'<script[^>]*ld\+json[^>]*>(.*?)</script>', sys.stdin.read(), re.DOTALL) for n in (json.loads(m).get('@graph',[json.loads(m)]))]"

# 3. Run Google Rich Results Test against the live URL (user, browser):
#    https://search.google.com/test/rich-results?url=https%3A%2F%2Fneckarshore.ai%2F
```

Expected `@types`: `['Organization','ProfessionalService']`, `Person`, `WebSite`, `WebPage`, `FAQPage`.

### Related

- Schema source of truth: `lib/schema/organization.ts`
- Planning decision: AD-19 — JsonLd via Native Script Tag (omnopsis-planning/docs/decisions/)
- Incident reports: Linus Session B + C (omnopsis-planning/docs/reports/2026-04-10-linus-fe-{b,c}.md)
