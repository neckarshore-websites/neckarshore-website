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
| Web Vitals | `tests/e2e/web-vitals.spec.ts` | 11 | Field CWV pipeline (TC-WV-*) — p75 lib units, `/api/track` web_vital ingest, browser beacon emission |
| Search | `tests/e2e/search.spec.ts` | 7 | Cmd+K site search (TC-SRCH-*) — open/close, glossar+product+section hits, mobile button, external new-tab (@external), no console errors |

Per-suite counts above have drifted (the table predates the Content `TC-CNT-*` suite); `docs/test-log.md` carries the authoritative run count (latest ~171 e2e). Plus a non-Playwright unit suite: **`npm run test:search:unit`** (12 checks, `tsx` + `node:assert`) — the search-index coverage invariant (every portfolio + glossar slug indexed).

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

Every test has a stable ID: `TC-[SUITE]-[NNN]`. Suites: `NAV`, `LNK`, `CAL`, `THM`, `RES`, `SEO`, `A11Y`, `SMK`, `STAT`, `WV`, `SRCH`, `MAN-OG`.
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

Profiles + gate logic are **centralized** in the shared package [`@neckarshore-websites/site-quality`](https://github.com/neckarshore-websites/site-quality) (single source of truth across all ecosystem sites; the package's own `defaults.test.mjs` locks the profile shape). This repo wires it via three things: a committed `.npmrc` (scope pin, no secret), a `site-quality.config.json` (baseUrl + paths + serve block), and one exact-version devDependency.

Three profiles. **Performance is soft-warn on all of them** (advisory, never blocks); **A11y / Best Practices / SEO are hard @95** on all of them (a drop fails CI).

| # | Profil | Form Factor | Network | CPU | Perf Gate | Perf Warn-Line | Purpose |
|---|--------|-------------|---------|-----|-----------|----------------|---------|
| 1 | Desktop | desktop | `--preset=desktop` (LAN) | 1× | Soft-Warn | 80 | LAN baseline — developer experience |
| 2 | Mobile 5G | mobile | 20ms / ~50 Mbps | 4× | Soft-Warn | 90 | Default mobile user (DACH, 5G-default) |
| 3 | Mobile 4G | mobile | 150ms / ~1.6 Mbps (Slow-4G) | 4× | Soft-Warn | 90 | Slow-network visibility canary |

5G is faster than 4G — the network ordering is correct. The pre-2026-06-18 "Mobile Slow (Edge-5G)" profile (400 Kbps / 6× CPU) was **deleted**: 400 Kbps is slower than 4G, so the "5G" label inverted reality; sub-4G is an unserviceable audience.

**Accessibility / Best Practices / SEO:** hard @95 on all three profiles — these are the only gates that fail CI.

### Commands

- `npm run lighthouse` — full local pipeline (`site-quality --serve`: build + start + all 3 profiles + stop)
- `npm run lighthouse:quick` — `site-quality` (CI mode, assumes server already on :3000)

Both run all three profiles (the package has no per-profile filter). Installing the package needs the `@neckarshore-websites` scope token: locally `export NODE_AUTH_TOKEN=$(gh auth token)` before `npm ci`; CI supplies it from `secrets.GITHUB_TOKEN` (the `lighthouse.yml` job has `permissions: packages: read`).

### Gate Philosophy

- **Performance is soft-warn everywhere (German Rauhut directive, 2026-06-18).** Perf scores track shared-runner CPU jitter, not the site — on the 1× desktop preset a fast static page swings {70, 86, 93, 98, 100} ⇔ TBT noise while LCP <1s / CLS 0.004 stay rock-solid. A hard perf gate cried wolf and got admin-bypassed repeatedly (PR #94, recurring `main` reds, the 2026-06-18 stats-commit red). It is now an **advisory warning line** per profile: the run prints `⚠` and lists the metric under "Soft warnings", but the exit code is unchanged. Visibility is kept (warning + logged LCP/TBT/CLS + run-to-run delta); the auto-block is gone. **Explicitly no hard perf gate on 4G** — the audience is 5G-default; we do not block the build on an old-tech network.
- **A11y / Best Practices / SEO are hard @95 on all three profiles** — deterministic categories (the site hits 100), so a drop is a real defect, not runner noise. These are the *only* failures that change the exit code.
- **Why the old hard perf gates were dropped:** the family-wide false-red cascade (neckarshore {86,93,98,100}, goldoni {89,90}, rauhut 67-spike, the deleted Edge-5G {44–71}) all stemmed from gating an inherently variable metric. The fix is structural — make perf advisory — not another threshold chase.

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
