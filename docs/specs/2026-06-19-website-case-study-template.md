# Website Case-Study Template — Design Spec

> **Status:** Design (brainstorm-approved 2026-06-19). Implementation pending (next session).
> **Owner:** Linus FE · **Founder direction:** 2026-06-19 (German Rauhut)

## 1. Goal

Give the **Websites** tier on `/products` real **internal case-study detail pages** instead of pure external link-outs. A website project (Goldoni first) gets a page on neckarshore.ai that explains the project — customer need, approach, tech, ongoing care — plus a link to the live site. This is citable, indexable portfolio content (SEO/GEO + proof of work for DACH CTOs), not just a click away to a third-party domain.

This is a **template**: one generic, data-driven page type that all four website projects (Goldoni, Oakwood, Rauhut, neckarshore.ai) fill with the same seven content axes. Adding a website = one Markdown file + one `caseStudySlug` line (AP-1).

## 2. The Seven Content Axes (fixed for every website)

| # | Section | Content | Covers |
|---|---------|---------|--------|
| 1 | Hero / Übersicht | H1 (`headline`) + 1-sentence citable `lead` + "Website live ansehen ↗" | What it is |
| 2 | Ausgangslage | What the customer needed | Customer view |
| 3 | Ansatz | How we solved it (KI-accelerated, DSGVO-by-Design, static/fast, …) | Approach |
| 4 | Technik & Architektur | The stack, as compact chips/list | Tech / architecture |
| 5 | Laufende Pflege | How the site is maintained & improved | Continuous improvement |
| 6 | Status | What is live today — honest, no invented metrics | Proof |
| 7 | Ausblick | What is planned, what could still come | Roadmap |

Hero = frontmatter; axes 2–7 are Markdown body `## Headings` in this order.

## 3. Content Architecture (Ansatz A — Markdown per website)

New content collection `src/content/websites/<slug>.md`, parallel to `products/`. Reuses the existing collection/markdown pipeline (`readEntry` + `renderMarkdown` + `Prose`).

**Frontmatter** (`WebsiteFrontmatter`):
- `name: string` — display name
- `headline: string` — H1
- `lead: string` — citable 1-sentence summary (meta description + page lead)
- `liveUrl: string` — the live external domain
- `techStack: string[]` — rendered as chips in axis 4
- `status: string` — e.g. "Live seit 2026"

**Body:** axes 2–7 as `## Headings` (see §2).

**Loader** `src/lib/content/websites.ts` → `getWebsiteEntry(slug): WebsiteEntry | null` (analog `getProductEntry`, adds `techStack` + `status`, returns `bodyHtml`).

## 4. Data Model (`portfolio.ts`)

Website items gain two fields:
- `caseStudySlug?: string` — when set, an internal case-study page exists at `/products/websites/<caseStudySlug>`.
- `liveUrl: string` — the external live domain (today's external `href` becomes this).

Behaviour:
- **With `caseStudySlug`** → the card shows **both**: title/CTA → internal case study, separate "Website ↗" button → `liveUrl`.
- **Without** → external link-out as today, badge "Website" (already shipped, PR #50).

> The external link MUST keep `target="_blank" rel="noopener"` — `TC-LNK` asserts every `https://` link carries it. This is the regression guard when an external card stops being a pure `<a>`.

## 5. Route — `/products/websites/[slug]`

Nested under the category sub-portal (no collision with the `/products/[slug]` preview-skeleton route). Renders the `websites` collection:

`Nav → Breadcrumb (Start / Produkte / Websites / Name) → H1 (headline) → lead → "Website live ansehen ↗" CTA → tech-stack chips → Prose (axes 2–7) → Footer`

- `generateStaticParams()` from website items with a `caseStudySlug`.
- **JSON-LD: `CreativeWork`** (the case study describes a web project). Indexable — added to the sitemap via `allProductRoutes()` (drop the external-only exclusion for items with a `caseStudySlug`).

## 6. Card — "Beides" (`ProductCard` extension)

Mirror the Skills `detailHrefFor` pattern: a website item with `caseStudySlug` renders as an internal `<Link>` (title + "Mehr erfahren →") plus a separate "Website ↗" `<a target="_blank" href={liveUrl}>` button. Without a case study → unchanged external card (badge "Website").

## 7. First Instance — Goldoni

`src/content/websites/ristorante-goldoni.md` with the seven axes. The tech/approach/care text is **our** statement (no owner gate). Restaurant-specific claims get **Silvio Brunetti's sighting** before they go live (consistent with the L-GO-UEBER-UNS owner gate). `portfolio.ts`: Goldoni item gets `caseStudySlug: "ristorante-goldoni"` + `liveUrl: "https://ristorante-goldoni.de"`.

## 8. Tests

- `TC-CNT-0xx`: case-study route 200, single H1 = headline, the seven axis `## Headings` present, live link `target="_blank"`, exactly one `CreativeWork` JSON-LD block.
- `TC-CNT-0xx`: a website card with a case study shows both the internal detail link AND the external "Website ↗" button (`target="_blank"`).
- Reuse the optional "7 axes present" lint as a content invariant (like the search-index coverage unit test).

## 9. Out of Scope (YAGNI)

- No structured-data store for case studies (Ansatz B/Hybrid rejected — Markdown is enough).
- No CMS, no per-axis component system — axes are Markdown headings, not typed fields.
- Oakwood / Rauhut / neckarshore.ai case studies = later instances; this spec ships Goldoni only.
- No invented metrics in axis 6 (Status) — honest current state only.

## 10. Open Points

1. **Silvio sighting** for the restaurant-specific text on the Goldoni page (tech/approach text is unblocked).
2. **`CreativeWork` vs `WebSite` schema** — confirm at build time against the Rich Results Test.
3. Whether the existing external Goldoni card flips to "both" immediately (needs the case study live first).
