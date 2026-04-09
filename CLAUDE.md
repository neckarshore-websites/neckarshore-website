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
| Navigation | `e2e/navigation.spec.ts` | 10 | Anchor scroll per section, subpage nav, footer, logo, mobile menu |
| Links | `e2e/links.spec.ts` | 9 | No 404s, `target="_blank"`, external link reachability |
| Calendly | `e2e/calendly.spec.ts` | 3 | CTA URL correct, reachable, on all pages |
| Theme | `e2e/theme.spec.ts` | 3 | Dark/light toggle, WCAG AA contrast (accent + headings) |
| Responsive | `e2e/responsive.spec.ts` | 12 | No overflow on 393/414/768px, nav usable |
| SEO | `e2e/seo.spec.ts` | 9 | Meta title/description per page, JSON-LD, robots.txt, sitemap.xml |
| Accessibility | `e2e/accessibility.spec.ts` | 15 | H1 count, heading hierarchy, lang, alt text, aria — all pages |

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

Every test has a stable ID: `TC-[SUITE]-[NNN]`. Suites: `NAV`, `LNK`, `CAL`, `THM`, `RES`, `SEO`, `A11Y`.
Use test IDs when referencing tests in logs, reports, and issues.

### Adding Tests

- One spec file per concern, in `e2e/`
- Assign the next available TC-ID in the suite
- Viewports: 393px (iPhone 15 Pro), 414px (iPhone 14 Plus), 768px (iPad Mini)
- Chromium only (Firefox/WebKit added when needed)

## CI Health Check (Session Startup)

At every session start, **before any feature work**, run:

```bash
gh run list --workflow=lighthouse.yml --limit=3 --json conclusion,createdAt,headBranch
gh run list --workflow=e2e.yml --limit=3 --json conclusion,createdAt,headBranch 2>/dev/null
```

- If any run shows `"conclusion": "failure"` → investigate and fix **before** starting new work
- Report CI status in session greeting: "CI: ✅ grün" or "CI: ❌ Lighthouse failing since [date]"
- Lighthouse runs on every push to `main` and weekly (Monday 06:00 UTC)
