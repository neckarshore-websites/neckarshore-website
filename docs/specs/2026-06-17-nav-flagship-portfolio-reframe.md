# Nav + Flagship Portfolio-Reframe — Design

> **Status:** Built 2026-06-17 (Linus). Direction approved live by Founder (V2 + Produkte dropdown).
> Extends the [ClearPath product-surface Durchstich](https://github.com/neckarshore-ai/neckarshore-planning/blob/main/docs/plans/2026-06-16-mmp-product-surface-design.md)
> by reframing the homepage flagship section and surfacing the product portfolio in the header nav.

## Why

The homepage flagship section was Omnopsis-only (`UNSER FLAGGSCHIFF / Omnopsis Documentor+X` +
engine copy + Conceived/Born photos + timeline). With a growing portfolio (Omnopsis + MMPs +
Skills) and a new `/products` surface, the Founder wanted the header to lead with **Produkte**
(not a single product) and the flagship section to speak to the **portfolio + the build method**,
not Omnopsis alone. The stat tiles (already 4-of-6 ecosystem-wide) stay — they read as proof of
the method's output across the whole portfolio.

## Decisions

1. **Flagship section → portfolio statement (Version 2, Founder-picked over V1 Engine-led).**
   Eyebrow `Unser Portfolio`; H2 `Ein Flagship. Mehrere Produkte. Skills. Eine Bauweise.`; a tight
   lead + a 3-tier list (Omnopsis / ClearPath & MMPs / Skills) + `Alle Produkte →` CTA. The 6 stat
   tiles are kept unchanged. Section keeps `id="omnopsis"` so existing `/#omnopsis` anchors resolve.
2. **Header nav: `Produkte` dropdown replaces the `Omnopsis` link** (slim category style,
   Founder-picked over a product-listing mega-menu). Entries `Omnopsis` / `MMPs` / `Skills` →
   `/products#tier-{omnopsis,mmps,skills}` (the portal sections), plus `Alle Produkte`. Desktop:
   hover + click, chevron animation, `aria-expanded` / `aria-haspopup`, Escape-to-close,
   keyboard-reachable. Mobile: indented `Produkte` group inside the hamburger menu.
3. **Omnopsis story relocated to a dedicated `/products/omnopsis` hub.** The engine copy,
   BYOLLM/Fail-closed, the Conceived/Born whiteboard + first-session photos (interactive
   `ImageModal`), and the MVP/LIVE timeline move here so the homepage reframe loses nothing.
   No live CTA (Omnopsis is pre-launch — status badge `In Entwicklung · MVP Q2 2026 · Live Q3 2026`
   instead). `SoftwareApplication` JSON-LD without a free Offer or live URL (both would be false
   pre-launch). The dropdown chain now resolves cleanly: `Omnopsis` → `/products#tier-omnopsis` →
   the Omnopsis card → `/products/omnopsis`.
4. **`Firewall` is feminine (Duden).** ClearPath copy corrected across all 5 surfaces:
   `ein mentaler Firewall` → `eine mentale Firewall` (headline, product-card tagline, glossar
   intro + meta, clearpath page `<title>`).

## Deploy workflow (Founder directive, 2026-06-17)

**Direct-to-prod is the default for neckarshore.ai** — no preview-URL review step. Traffic is low
and the blast radius of a brief glitch is small. **Exception:** A/B comparisons (e.g. the V1/V2
flagship variants) may use a local mockup / preview deployment before deploying. This aligns with
the estate-wide "Freigabe auf Prod" workflow already in use on the sibling sites.

## Files

| File | Change |
|------|--------|
| `src/app/page.tsx` | Flagship section reframed to V2; removed Omnopsis story + unused `ImageModal` import |
| `src/components/Nav.tsx` | `Produkte` dropdown (desktop + mobile); removed `Omnopsis` link + `BRAND` import |
| `src/app/products/page.tsx` | Omnopsis card → `/products/omnopsis`; `scroll-mt-28` on tier headings |
| `src/app/products/omnopsis/page.tsx` | NEW — Omnopsis hub (story + photos + timeline + schema) |
| `src/content/products/clearpath.md`, `src/app/products/page.tsx`, `src/app/glossar/page.tsx`, `src/app/products/clearpath/page.tsx` | `Firewall` feminine |
| `tests/e2e/navigation.spec.ts` | TC-NAV-004 retargeted to the Produkte dropdown |
| `tests/e2e/content-surface.spec.ts` | TC-CNT-013 (Omnopsis card link) + `/products/omnopsis` in the SEO/GEO sweep |

## Out of scope / follow-ups

- **Card-design reuse:** Founder liked the Open-Source-section card design (badges, icons, GitHub
  buttons) — candidate pattern for future product pages. Captured, not built.
- **Websites + Agents tiers** (per the parent design's "How it generalizes" table) remain deferred.
- **`/#omnopsis` anchor:** still resolves (section id kept) but is no longer Omnopsis-specific; the
  canonical Omnopsis destination is now `/products/omnopsis`.
