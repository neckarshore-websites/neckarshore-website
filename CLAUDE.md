@AGENTS.md

## E2E Tests (Playwright)

### Commands

- `npm run test:e2e` — run all tests (headless, ~27s)
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

- **Session start:** verify baseline is green before making changes
- **Session end:** verify nothing broke during the session
- Log results in `docs/test-log.md` after each run

### Adding Tests

- One spec file per concern, in `e2e/`
- Viewports: 393px (iPhone 15 Pro), 414px (iPhone 14 Plus), 768px (iPad Mini)
- Chromium only (Firefox/WebKit added when needed)
