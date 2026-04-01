@AGENTS.md

## E2E Tests (Playwright)

### Commands

- `npm run test:e2e` — run all tests (headless, ~27s)
- `npm run test:e2e:ui` — run with Playwright UI (interactive debugging)

### Test Suites

| Suite | File | Tests | What |
|-------|------|-------|------|
| Navigation | `e2e/navigation.spec.ts` | 7 | Anchor links, footer, logo, mobile menu |
| Links | `e2e/links.spec.ts` | 6 | No 404s, external links `target="_blank"` |
| Calendly | `e2e/calendly.spec.ts` | 3 | CTA URL correct, reachable, on all pages |
| Theme | `e2e/theme.spec.ts` | 3 | Dark/light toggle, accent contrast, no invisible text |
| Responsive | `e2e/responsive.spec.ts` | 12 | No overflow on 393/414/768px, nav usable |
| SEO | `e2e/seo.spec.ts` | 6 | Meta tags, JSON-LD, robots.txt, sitemap.xml |
| Accessibility | `e2e/accessibility.spec.ts` | 5 | H1 count, heading hierarchy, lang, alt text, aria |

### When to Run

- **Session start:** verify baseline is green before making changes
- **Session end:** verify nothing broke during the session
- Log results in `docs/test-log.md` after each run

### Adding Tests

- One spec file per concern, in `e2e/`
- Viewports: 393px (iPhone 15 Pro), 414px (iPhone 14 Plus), 768px (iPad Mini)
- Chromium only (Firefox/WebKit added when needed)
