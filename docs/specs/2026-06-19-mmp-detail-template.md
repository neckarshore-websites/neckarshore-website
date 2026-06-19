# MMP Detail Template — Design Spec

> **Status:** Design (brainstorm-approved 2026-06-19). Implementation pending.
> **Owner:** Linus FE · **Reference impl:** ClearPath (the only MMP detail page built today).

## 1. Goal

Generalise the **MMP product detail page** so the four preview MMPs (snakeoil-check, phonesis, local-seo-hub, prod-or-pretend) get real, indexable pages instead of the generic `[slug]` "In Entwicklung" skeleton. ClearPath already follows this shape (Markdown content-collection); this spec makes it the template, not a one-off.

> **Ground truth (2026-06-19):** ClearPath is the *only* MMP page using the `products` content-collection. The other four are noindex `[slug]` skeletons. Omnopsis/OVA are hardcoded bespoke pages, NOT this template.

## 2. Shared Architecture

Reuses the common detail-page architecture defined in [`2026-06-19-website-case-study-template.md`](./2026-06-19-website-case-study-template.md) §3–§5: Markdown content-collection → per-item page → `Prose` body → JSON-LD → breadcrumb. **This spec only covers the MMP-specific delta.**

## 3. Delta — what makes an MMP page an MMP page

| Aspect | MMP value |
|--------|-----------|
| **Content** | `src/content/products/<slug>.md` (the existing collection — already used by ClearPath) |
| **Frontmatter** | `name`, `headline`, `definition` (citable lead), `liveUrl`, `applicationCategory` |
| **Axes (`## Headings`)** | Das Problem · Wie es funktioniert · Live ausprobieren · Die Idee dahinter · Status & Roadmap · Verwandte Begriffe *(optional — Glossar links, ClearPath has it)* · Wie dieser Text entstand *(E-E-A-T note)* |
| **Schema** | `SoftwareApplication` (`applicationCategory` per item) |
| **Primary CTA** | "Live ausprobieren →" → `liveUrl` (`target="_blank"`) |
| **Card** | Internal detail link (the live-app link is a CTA *on* the detail page, not a second card button) |

## 4. Path & Route

Each MMP gets its own page. Two options, decide at build:
- **A (consistent with ClearPath):** bespoke thin `src/app/products/<slug>/page.tsx` per MMP, ~25 lines, calling `getProductEntry(slug)` — like clearpath/page.tsx. Explicit, no magic.
- **B (fully generic):** one route resolving any MMP slug with a content-collection entry. Less duplication, but diverges from the established per-page pattern.

Recommendation: **A** — mirrors the proven ClearPath page (low risk, explicit), and an MMP page is cheap to add (one `.md` + one ~25-line wrapper). Promote to B only if a 3rd+ identical wrapper appears (rule-of-three).

When an MMP page lands: drop its `noindex` in `portfolio.ts` → it auto-enters the sitemap and its card detail link lights up.

## 5. Consumers (today's skeletons)

snakeoil-check · phonesis · local-seo-hub · prod-or-pretend. Each = one `src/content/products/<slug>.md` + one thin page wrapper + drop `noindex`. Content per item: AI-draft → Rauhut-edit; snakeoil/phonesis are preview products (honest "in Entwicklung" framing in axis "Status & Roadmap").

## 6. Tests

Per MMP page: 200, single H1 = headline, definition is first paragraph, live link `target="_blank"`, exactly one `SoftwareApplication` JSON-LD block (mirrors TC-CNT-020…023 for ClearPath).

## 7. Out of Scope

- Omnopsis is a Flagship, not an MMP (separate spec).
- No migration of the bespoke pages here.
- "Verwandte Begriffe" (Glossar) is per-item optional, not required.
