# /products Portfolio — Top-3 Teaser Reframe

**Date:** 2026-06-18
**Author:** Linus (FE)
**Status:** implemented
**Scope:** `src/lib/portfolio.ts`, `src/app/products/page.tsx`, e2e tests

## Problem

The `/products` portal listed the FULL category (5 MMPs, 5 Skills, 4 Websites) as
cards. That over-weighted the overview and buried the signal. The Founder asked to
reduce each category to its most important products and push the rest one level down.

## Taxonomy model (Founder, 2026-06-18)

| Category | Meaning | Today | Logic |
|----------|---------|-------|-------|
| Flagships | **Hauptprodukte** | only Omnopsis | Omnopsis is *one* flagship of eventually many — more follow |
| MMPs | **Nebenprodukte** (Minimum Marketable Products) | ClearPath & Co. | a breakout MMP is promoted to a flagship |
| Skills | Skill-products in the broad sense / projects | OVA & Co. | "not too dogmatic" |
| Websites | Web presences — **Beifang** | Goldoni & Co. | by-catch |

Key shift: copy used to imply "Omnopsis **is** the flagship" (singular). The model is
"Omnopsis is **one** Hauptprodukt of future many" (plural). The `flagships` subtitle moved
from "Unser Flaggschiff" → "Unsere Hauptprodukte". The word "Nebenprodukt" stays internal —
public MMP copy is framed positively ("marktreife Produkte mit klarem Fokus"), never as
"by-product" (would undersell to a customer).

## Mechanism (data-driven, AP-1)

- `PortfolioItem` gains `featured?: boolean`. `PortfolioCategory` gains `intro: string`.
- The **`/products` portal** renders only `featuredItems(category)` (the Top-N) + a quieter
  "mehr" tile when `hiddenItemCount(category) > 0`. The tile links to the sub-portal and
  shows "+N weitere".
- The **sub-portals** (`SubPortal`) keep rendering the FULL category — unchanged.
- Within a category, featured items lead in their declared order (Founder's Top-N), the
  remainder follows A→Z (global sorting NFR, logical-lead exception).
- Featuring a product = 1 flag (AP-1: "add/feature = 1 edit"). All items stay in `PORTFOLIO`,
  so the sitemap, `[slug]` route, and the search-index coverage invariant are untouched.

## Top-3 per category

| Category | Featured (in order) | Behind "mehr" (sub-portal only) |
|----------|---------------------|----------------------------------|
| Flagships | Omnopsis | — (no mehr tile; 0 hidden) |
| MMPs | ClearPath · Snakeoil-Check · Phonesis | Local-SEO-Hub, Prod-or-Pretend |
| Skills | Obsidian Vault Autopilot · Social Scrapers · IMAP Mailbox Cleanup | AI Phrase Check, Restaurant-Menüpflege |
| Websites | neckarshore.ai · Ristorante Goldoni · Oakwood Golf Club | Rauhut |

## Per-category framing text (draft — Founder edit)

Shown between the category heading and the cards. Drafts; the Founder edits on the live page.

- **Flagships:** "Produkte, die einen Markt gewinnen sollen. Omnopsis ist das erste — weitere folgen."
- **MMPs:** "Marktreife Produkte mit klarem Fokus — jedes löst ein konkretes Problem. Schlägt eines durch, wird es zum Hauptprodukt."
- **Skills:** "Kleine, scharf geschnittene Open-Source-Werkzeuge — die Tools, die wir selbst täglich benutzen. Jetzt auch für euch."
- **Websites:** "Echte Kundenprojekte, nebenbei entstanden — dieselbe Bauweise wie alles andere: KI-beschleunigt, DSGVO-by-Design."

## Tests

- `TC-CNT-014`: portal shows only the featured MMPs + a "mehr" tile; dropped MMPs absent
  from the MMPs section.
- `TC-CNT-015`: the MMP sub-portal lists the FULL category (featured + dropped).
- Existing `TC-CNT-010/011/012/013` and the SEO/GEO sweep stay green (headings unchanged;
  ClearPath + Omnopsis are featured; all detail/sub-portal routes unchanged).

## Scope boundary (deferred — NOT in this change)

- The **homepage flagship block** (the dark "Unser Portfolio" band on `/`) and its **headline**
  are intentionally untouched. They get reworked together, after this PR merges:
  - Headline "Ein Flagship. Mehrere Produkte. Skills. Eine Bauweise." — revisit (Founder A/B pick).
  - 3-tier list — **Option A (locked)**: category-led, plural-honest, concrete example names,
    no Websites line:
    - "Flagships — Hauptprodukte. Heute Omnopsis, weitere folgen."
    - "MMPs — marktreife Produkte, z.B. ClearPath & Snakeoil-Check."
    - "Skills — fokussierte Open-Source-Werkzeuge."
