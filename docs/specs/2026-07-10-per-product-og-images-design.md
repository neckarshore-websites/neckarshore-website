# Per-Product OG / Social-Preview Images

**Date:** 2026-07-10
**Owner:** Linus (build) → User (visual accept)
**Backlog item:** `L-NECK-OG-IMAGES-PER-PRODUCT`
**Status:** design — awaiting user review

## Goal

Replace the single shared `/og-image.jpg` on every product page with a
**per-product** OG/social-preview card, so a shared link to any indexable
product renders a card specific to that product (LinkedIn, Slack, X, WhatsApp).

## Scope

Per-product cards for the **11 indexable products** — every product with a
bespoke detail page that is NOT `noindex`:

| # | Slug | Category |
|---|------|----------|
| 1 | `omnopsis` | Flagship |
| 2 | `clearpath` | MMP |
| 3 | `snakeoil-check` | MMP |
| 4 | `phonesis` | MMP |
| 5 | `local-seo-hub` | MMP |
| 6 | `prod-or-pretend` | MMP |
| 7 | `trustscope` | MMP |
| 8 | `obsidian-vault-autopilot` | Skill |
| 9 | `social-scrapers` | Skill |
| 10 | `imap-mailbox-cleanup` | Skill |
| 11 | `ai-phrase-check` | Skill |

### Non-goals

1. `restaurant-menu-update` — the only `noindex: true` product (private,
   genericized client skill). A polished card for a page held out of the
   index is a credibility risk (advisor note in the item). **Excluded.**
2. Sub-portal pages (`/products/flagships`, `/mmps`, `/skills`) and the main
   `/products` portal — this item is per-*product*, not per-category.
3. Website case studies (`/products/websites/<slug>`) — external live sites,
   separate surface. **Excluded.**
4. **No status signal on the card** (user decision 2026-07-10). Cards are
   uniform; chips are *descriptive* (category / theme), never an availability
   claim — so a preview-stage product's card cannot over-promise.

## Card design

Reuse the existing pipeline unchanged — `scripts/generate-og-image.mjs`
(fixed layout) + `scripts/og-cards.config.mjs` (pure-data entries). Add 11
new entries:

- **Dimensions:** 1200 × 630, padding 72, `maxKB: 200` — matches the site OG
  and Twitter `summary_large_image` (the existing `public/og-image.jpg` shape).
- **Destination:** `public/og/<slug>.jpg`.
- **`headline` / `headlineAccent`:** the product name, split in the established
  config style (e.g. `"Obsidian Vault"` + `"Autopilot."`).
- **`tagline`:** the product's existing `tagline` from `src/lib/portfolio.ts` —
  reused verbatim, no newly-invented copy (stays consistent with the page body
  and the JSON-LD).
- **`chips`:** descriptive only (category + one or two theme chips drawn from
  the product's nature — e.g. `"Claude Skill"`, `"DSGVO"`, `"Open Source"`).
  No `"Live"` / `"In Entwicklung"` status chip.

## Wiring

One clean extension point, backward-compatible:

1. **`src/lib/seo.ts` `pageMetadata()`** — add an optional param
   `image?: { url: string; width: number; height: number; alt: string }`.
   When present, it drives `openGraph.images` + `twitter.images`; when absent,
   the current shared `OG_IMAGE` is used. Every existing caller is unaffected.
2. **A small helper** (e.g. `productOgImage(slug, alt)`) returns the per-slug
   image object (`/og/<slug>.jpg`, 1200 × 630, alt derived from name+tagline).
3. **Each of the 11 product pages** passes `image: productOgImage(...)` into its
   `pageMetadata(...)` call. Five pages use a bespoke `generateMetadata` that
   does not visibly route through `pageMetadata`
   (`local-seo-hub`, `phonesis`, `prod-or-pretend`, `snakeoil-check`,
   `trustscope`) — each is checked individually and either routed through the
   extended helper or given the image on its manual `openGraph`/`twitter` block.
4. Generate the 11 jpgs (`node scripts/generate-og-image.mjs`) and commit them
   under `public/og/`.

## Tests

1. **e2e (new `TC-SEO-*`):** for each indexable product page, assert its
   `og:image` and `twitter:image` are the per-slug card (`/og/<slug>.jpg`),
   NOT the shared `/og-image.jpg`, and that the asset resolves 200.
2. **Manual (`TC-MAN-OG-*`):** a `docs/manual-tests.md` entry for the visual
   preview pass (LinkedIn Post Inspector / Slack unfurl).

## Definition of Done

- 11 cards generated + committed; wiring green.
- e2e per-product og:image invariant passes in CI.
- No console errors; Lighthouse A11y/BP/SEO hard-gates (95) unaffected.
- **Founder visual-accept** of the rendered cards (the VISUAL gate — Linus
  does not self-accept visual output).
