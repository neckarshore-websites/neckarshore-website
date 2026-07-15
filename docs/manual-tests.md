# Manual Tests (Human-in-the-Loop)

These tests require a human with browser access. They verify platform-specific rendering that automated E2E tests cannot cover.

## When to Run

- After OG/meta tag changes
- After SEO work or schema changes
- Before LinkedIn/social media campaigns
- Monthly as a routine check

## Test Cases

| # | ID | Test | Tool | URL | What to check | Frequency |
|---|----|------|------|-----|---------------|-----------|
| 1 | TC-MAN-OG-001 | OG Preview — All Platforms | OpenGraph.xyz | https://www.opengraph.xyz/ | Image renders (not cropped/distorted), title + description readable, no metadata warnings | After OG/meta changes, monthly |
| 2 | TC-MAN-OG-002 | LinkedIn Post Inspector | LinkedIn | https://www.linkedin.com/post-inspector/ | Preview matches brand, author found, description adequate length (>=100 chars) | After OG/meta changes, before LinkedIn campaigns |
| 3 | TC-MAN-OG-003 | X/Twitter Card Validator | X | https://cards-dev.twitter.com/validator | Card renders as `summary_large_image`, image + text correct | After X account created, after OG changes |
| 4 | TC-MAN-OG-004 | Google Rich Results Test | Google | https://search.google.com/test/rich-results | JSON-LD valid, all @types detected, no errors | After schema/JSON-LD changes |
| 5 | TC-MAN-OG-005 | Per-Product OG Cards — Visual Accept | OpenGraph.xyz / LinkedIn | 11 `/products/<slug>` URLs (indexable set) | Each product URL unfurls its OWN card (`/og/<slug>.jpg`) — correct headline/tagline/chips, not cropped, brand block intact | After per-product OG changes; Founder visual-accept gate (L-NECK-OG-IMAGES-PER-PRODUCT) |
| 6 | TC-MAN-FAQ-001 | FAQPage Rich Results — product detail pages | Google | https://search.google.com/test/rich-results | Test each of the 6 FAQPage URLs: `/products/omnopsis`, `/products/clearpath`, `/products/websites/neckarshore`, `/products/websites/ristorante-goldoni`, `/products/websites/oakwood-golf-club`, `/products/websites/rauhut` — **FAQPage** detected, every Q&A parsed, zero errors/warnings. (The 5 noindex preview pages deliberately emit NO FAQPage — do not test those.) | After FAQ/schema changes |

## Results Log

| # | Date | Tester | TC-ID | Result | Notes |
|---|------|--------|-------|--------|-------|
| 1 | 2026-04-13 | User | TC-MAN-OG-001 | PASS | Image + metadata correct on all platforms. Description flagged as short (97 chars) — fixed this session. |
| 2 | 2026-04-13 | User | TC-MAN-OG-002 | PASS (with warnings) | Author: "No author found", Publish date: missing. Author fix deployed this session. |
| 3 | 2026-04-13 | User | TC-MAN-OG-003 | FAIL | No X/Twitter account exists for neckarshore.ai. User task — coordinate with Gary. |
| 4 | 2026-07-15 | User | TC-MAN-OG-005 | PASS | All 11 per-product cards accepted (Founder visual-accept gate, L-NECK-OG-IMAGES-PER-PRODUCT). Reviewed via a proof sheet showing each card against its spec (headline/tagline/chips) at Prüfgröße + LinkedIn-feed size (552px) — the tagline is 27px on a 1200px canvas, so feed-size legibility was the load-bearing check. Mechanics verified against prod beforehand: 11/11 `og:image` wired to their own `/og/<slug>.jpg`, all 200, all 1200×630, 64–81 KB (limit 200). |
