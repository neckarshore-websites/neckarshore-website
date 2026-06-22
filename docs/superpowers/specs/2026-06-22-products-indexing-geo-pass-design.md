# Products Indexing + GEO Pass — Design (L-NECK-PRODUCTS-CONTENT-PASS, Scope A)

**Date:** 2026-06-22
**Author:** Linus FE
**Item:** L-NECK-PRODUCTS-CONTENT-PASS (neckarshore-planning/sessions/linus.yaml)
**Status:** design — awaiting user spec review before writing-plans

## Background (believe-the-ground)

The yaml item (written 2026-06-17 -d) describes "8 in-dev preview skeletons" needing real copy. **That is stale.** Verified against the repo on 2026-06-22:

- All 11 product detail pages already carry rich, founder-redacted content (each markdown file ends with the `Wie dieser Text entstand` provenance footer).
- The 4 MMP preview pages (`snakeoil-check`, `phonesis`, `local-seo-hub`, `prod-or-pretend`) each have a full markdown body (Problem / Wie es funktioniert / Idee / [Datenschutz] / Status & Roadmap) **and** a visible FAQ (all four are in `src/lib/product-faqs.ts`; `phonesis` is an unquoted key at line 80 — an earlier grep false-negative claimed it missing, corrected against the live page which renders 4 `<summary>` items).
- Schema, breadcrumbs, sitemap and the FAQ-schema gate are all already wired correctly (AD-19 native `<script>` JSON-LD, `BreadcrumbList` everywhere, `allProductRoutes()` filters `!noindex`).

So the real remaining work is **not** a content build. It is: flip the 4 previews to indexable (user decision 2026-06-22) and apply the must-fix GEO items the audit surfaced. A two-lens audit (GEO + schema) was run over the 17 `/products` routes; GEO readiness scored **63/100** (technical accessibility strong at 90, citability the drag at 58).

## Goal

Make the 4 MMP preview pages discoverable and citable by search + AI engines, with their structured-data posture staying honest (pre-launch: no `url`, no `offers`), and remove the dual-gate footgun so future launches are a one-flag change.

## Decisions (locked by user)

1. **Indexing:** the 4 MMP previews become indexable (noindex dropped). `restaurant-menu-update` stays noindex (private, genericized client skill).
2. **H2 wording:** full set — 3 question-shaped heading conversions per MMP page.
3. **Process:** full cycle (this spec → writing-plans → execute).

## Scope

### In scope (Scope A)

1. **Dual-gate refactor** — `src/components/PreviewProductPage.tsx`: `previewProductMetadata` derives `robots` from the portfolio `noindex` flag instead of hardcoding `index: false`. Single source of truth = `portfolio.ts`.
2. **noindex drop** — `src/lib/portfolio.ts`: remove `noindex: true` from `snakeoil-check`, `phonesis`, `local-seo-hub`, `prod-or-pretend`; update their inline comments. Keep it on `restaurant-menu-update`.
3. **llms.txt** — `public/llms.txt`: add a `## Products` section listing the product tree with one-line descriptions + URLs (closes the AI-discovery gap; the file currently describes only the company + flagship).
4. **robots.txt** — `public/robots.txt`: add an explicit `User-agent: OAI-SearchBot` / `Allow: /` block.
5. **Question-shaped H2s** — the 4 MMP markdown files: 3 heading conversions each (see mapping below).
6. **Test updates** — `tests/e2e/content-surface.spec.ts`: move the 4 slugs from `FAQ_NOINDEX` to `FAQ_INDEXABLE`; update the per-MMP heading-assertion lists (TC-CNT-036/039/042/045) to the new headings.

### Out of scope (→ backlog for MASCHIN)

- **#6 passage expansion** to 130–167 words — rejected for Scope A: the brand is "weniger ist mehr"; padding for word-count risks diluting crisp copy. Expand only where genuine substance is missing, in a later pass.
- **#7 `datePublished` / entity-graph `@id`** on product schema — real freshness signal, deferred. Note: keeping the preview schema unchanged means `TC-CNT-037/040` (`url`/`offers` undefined) stay green.
- **#8 multi-modal content** (comparison tables / diagrams on MMP pages) — separate per-product design work.

## Detailed changes

### 1. `previewProductMetadata` (single-source robots)

```ts
import { getItemBySlug } from "@/lib/portfolio";

export function previewProductMetadata({ slug, title }: { slug: string; title: string }): Metadata {
  const entry = getProductEntry(slug);
  if (!entry) return {};
  const item = getItemBySlug(slug);
  const noindex = item?.noindex ?? false;
  return {
    ...pageMetadata({ title, description: entry.definition, path: `/products/${slug}` }),
    robots: { index: !noindex, follow: true },
  };
}
```

Effect: `noindex` in `portfolio.ts` becomes the single switch for robots-meta **and** sitemap inclusion **and** FAQPage-schema activation (AP-1: one flag, three effects). Only the 4 `PreviewProductPage` consumers are affected; `restaurant-menu-update` is a bespoke page and is untouched by this refactor (its own noindex flag is preserved separately).

### 2. portfolio.ts noindex drop

Remove the `noindex: true` line from the four items; rewrite their comments from "Stays noindex … until the public app launches" to note they are now indexable pre-launch (rich content, honest preview schema, discovery CTA). `restaurant-menu-update` keeps `noindex: true`.

### 3. H2 mapping (markdown files)

Keep `Das Problem`, `Datenschutz & Ethik` (phonesis only), and `Wie dieser Text entstand`. Convert:

| Current heading | New heading |
|---|---|
| Wie es funktioniert | Wie funktioniert [Produkt]? |
| Die Idee dahinter | Was [Produkt] anders macht |
| Status & Roadmap | Wann kommt [Produkt]? |

Concrete per file (`[Produkt]` resolved):

- **snakeoil-check.md:** `Wie funktioniert Snakeoil-Check?` · `Was Snakeoil-Check anders macht` · `Wann kommt Snakeoil-Check?`
- **phonesis.md:** `Wie funktioniert Phonesis?` · `Was Phonesis anders macht` · `Wann kommt Phonesis?` (keeps `Datenschutz & Ethik`)
- **local-seo-hub.md:** `Wie funktioniert Local-SEO-Hub?` · `Was Local-SEO-Hub anders macht` · `Wann kommt Local-SEO-Hub?`
- **prod-or-pretend.md:** `Wie funktioniert Prod-or-Pretend?` · `Was Prod-or-Pretend anders macht` · `Wann kommt Prod-or-Pretend?`

### 4. llms.txt `## Products` section

New section (English body, consistent with the file's existing English sections; descriptions derived from `portfolio.ts` taglines). Lists the flagship, the 5 MMPs, the 4 indexable OSS skills, and the Websites tier with absolute URLs. `restaurant-menu-update` is **not** listed (stays noindex/private).

### 5. robots.txt

Add, alongside the existing GPTBot/ClaudeBot/PerplexityBot/Google-Extended blocks:

```
User-agent: OAI-SearchBot
Allow: /
```

### 6. Test updates (`tests/e2e/content-surface.spec.ts`)

- `FAQ_NOINDEX` → move `snakeoil-check`, `phonesis`, `local-seo-hub`, `prod-or-pretend` into `FAQ_INDEXABLE`; leave `restaurant-menu-update` in `FAQ_NOINDEX`. Update the describe-block comment.
- TC-CNT-036/039/042/045 heading lists → replace the 3 converted headings with the new strings (per file above). `Das Problem` / `Datenschutz & Ethik` / `Wie dieser Text entstand` stay.
- TC-CNT-037/040 (and the prod-or-pretend/local-seo-hub equivalents) assert `url`/`offers` undefined — unchanged, must stay green (no schema change in Scope A).

## Behavior after the change (verification targets)

- Live sitemap gains exactly 4 URLs: `/products/{snakeoil-check,phonesis,local-seo-hub,prod-or-pretend}` (22 → 26 total).
- Those 4 pages' robots meta flips from `noindex, follow` to `index, follow`.
- FAQPage JSON-LD activates on all 4 (they already have FAQ data).
- SoftwareApplication schema on the 4 stays `previewSoftwareApplicationSchema` — no `url`, no `offers` (honest pre-launch).
- `restaurant-menu-update` unchanged (noindex, no FAQPage).

## Risks & mitigations

1. **Half-state launch** (sitemap says index, meta says noindex, or vice-versa) — eliminated by the single-source refactor (change 1).
2. **Test drift** — the heading + FAQ-gate tests are explicitly enumerated above; `npm run test:e2e` must pass before commit (DoD).
3. **Indexing thin pre-launch pages** — mitigated: the pages carry rich rich content + FAQ; the schema makes no false live/offer claim; the discovery CTA is honest.
4. **Other hidden assertions** on the 4 slugs' robots/sitemap state — a grep sweep over `tests/` for the slugs + `noindex`/`sitemap` is part of step 1 of the plan.

## Definition of Done

- `npm run lint` clean, `npm run build` green.
- `npm run test:e2e` all green; `npm run test:search:unit` green.
- Committed + pushed to `main`; Vercel auto-deploy.
- R2 live verification: sitemap +4, robots meta = index on the 4, FAQPage present (Rich-Results-eligible), `restaurant-menu-update` still noindex.
- Lighthouse unaffected (no perf-relevant change).
- Visual acceptance stays the user's call (no self-declared "done").

## Out-of-scope backlog seeds (FOR MASCHIN)

- MMP passage depth pass (#6), gated on a brand-voice call (concise vs. citation-length).
- Product-schema `datePublished` + entity-graph `@id` linkage to `#organization`/`#founder` (#7).
- Multi-modal content (comparison tables / diagrams) per MMP page (#8).
