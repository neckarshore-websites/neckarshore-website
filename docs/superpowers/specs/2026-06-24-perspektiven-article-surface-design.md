# Perspektiven — Article Surface (Design Spec)

> **Status:** Design approved (brainstorm 2026-06-24, Founder-steered). Next step: writing-plans → implementation plan.
> **Open item:** `L-NECK-ARTICLE-SURFACE-BRAINSTORM` (from 2026-06-23-linus-fe-b). This spec is its output.

## Context & Goal

The neckarshore.ai technical/structural SEO baseline is already excellent (#385 audit: 92/100). The remaining lever for AI-citability and organic authority is **content breadth on neckarshore's own domain** — a thought-leadership article surface aimed at DACH-Mittelstand CTOs.

This spec defines the **surface** (route, template, content collection, schema, tests, integration) plus an **authoring checklist** that encodes a citable structure. It does **not** write the article copy — that is a separate, downstream content effort (Founder + Gary).

**Primary purpose:** AI-Citability / GEO. The other three purposes (organic reach, sales-credibility, Gary's off-page feed) matter too, but GEO breaks ties in design decisions.

**Target AI engines (Founder-weighted):** Google AI Overviews (Gemini), Claude (Web Search), Microsoft Copilot (Bing). The GEO mechanics are ~90% engine-agnostic; a strong, structured `BlogPosting`/`FAQPage` schema over clean SSR HTML covers all three. ChatGPT / Perplexity are explicitly de-prioritised (Founder call: declining relevance for B2B research).

## Decisions (brainstorm outcomes)

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Surface name = **Perspektiven**, route `/perspektiven` | German (on-brand for "deutsche Wertarbeit statt Offshore"), premium thought-leadership signal, carries both opinion + factual guides. Not a generic "Blog". |
| 2 | **Mixed voice per article** — `author` field per article (`german-rauhut` \| `neckarshore`) | Founder-opinion pieces (Person schema, strong E-E-A-T) and neutral GEO-guides (Organization schema) live side by side. Serves all four purposes. |
| 3 | **Lean Cornerstone MVP** (Approach ①) — 4 deep pillar articles, flat index, no taxonomy infra | GEO rewards depth-per-page, not volume; cadence is unproven (zero articles today). `topic` field in the model lets tags/hubs graduate later (ADD, not REPLACE). |
| 4 | **FAQ block mandatory for the 4 MVP articles**, field optional in the model | Cornerstone pieces have the highest FAQPage payoff; all three target engines favour Q&A pairs. Later lighter articles may omit it. |
| 5 | Mirror the existing `products`/`websites` content-collection pattern | Lowest risk, consistent with the codebase; `collection.ts` + `markdown.ts` substrate already exists. |
| 6 | Glossar (DefinedTerm) sub-option **deferred** to a Fast-Follow spec | Don't run two unproven content types at once. The DefinedTerm mechanism is GEO-strong (only the retired bias *topic* was wrong); revisit with on-topic terms after the MVP proves out. |

## Content Model

### The 4 cornerstone pillars (MVP launch set)

Working titles/angles for the spec. Each is anchored to a neckarshore differentiator or product → double pull (thought-leadership + internal link graph). Actual copy is downstream.

| # | Pillar | Working title / citable angle | Voice | Product bridge |
|---|--------|------------------------------|-------|----------------|
| 1 | Nearshore vs Offshore | "Nearshore in Deutschland vs. Offshore: Was CTOs bei der Entwicklungs-Partnerwahl wirklich abwägen" — factual comparison (timezone, data-residency/DSGVO, communication, total-cost-of-ownership over day-rate) | Founder | core pitch |
| 2 | KI-beschleunigte Entwicklung | "KI-beschleunigte Softwareentwicklung: Was sich real ändert — und was Hype bleibt" — honest take on where AI delivers vs. where it doesn't, through the fail-closed / production-standard lens | Founder | Omnopsis · Prod-or-Pretend · Snakeoil-Check |
| 3 | DSGVO-by-Design | "DSGVO-by-Design: Datenschutz als Architektur-Entscheidung, nicht als Checkbox" — concrete practices (data residency, BYOLLM, no US-transfer, cookieless analytics) | neckarshore | whole build approach |
| 4 | Entscheidungsqualität für CTOs | "Entscheidungsqualität in der Tech-Führung: Bessere Architektur-Entscheidungen unter Unsicherheit" — frameworks against cognitive bias in tech decisions | Founder | ClearPath |

A 5th article ("Made in Germany Software" or a customer case) is a Fast-Follow, not MVP.

### Article frontmatter schema

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `title` | string | yes | H1 + card heading + `BlogPosting.headline` |
| `slug` | (filename) | yes | URL slug under `/perspektiven/<slug>` |
| `lead` | string | yes | The citable "money paragraph" (40–60 words) — also meta description + `BlogPosting.description` |
| `author` | `"german-rauhut" \| "neckarshore"` | yes | Selects Person vs Organization author node (unknown → Organization fallback) |
| `published` | ISO date | yes | `datePublished` + sort key (newest first on index) |
| `updated` | ISO date | no | `dateModified` (defaults to `published` if absent) |
| `topic` | string | yes | Pillar tag; future tags/hubs graduate from this field |
| `description` | string | no | Meta override (defaults to `lead`) |
| `faq` | `{ q, a }[]` | MVP: yes | End-of-article Q&A → `FAQPage` schema |

Body = Markdown, rendered via the existing `Prose` component + `markdown.ts` (sanitised). Structured into question-shaped H2s (see Citable Anatomy).

## Architecture

All routes are Server Components → SSR HTML that crawlers/AI read directly (GEO requirement). Statically baked at build time via `generateStaticParams`.

### Content collection

1. `src/content/perspektiven/*.md` — one file per article (4 at launch).
2. `src/lib/content/articles.ts` — typed loader on top of the generic `collection.ts`:
   - `getArticle(slug)` → `readEntry<ArticleFrontmatter>("perspektiven", slug)` → shaped `Article` (frontmatter + `bodyHtml` via `renderMarkdown`). Mirrors `products.ts`.
   - `getAllArticles()` → `readCollection<ArticleFrontmatter>("perspektiven")` (returns A→Z by slug), then **re-sorted by `published` desc** for display order.
3. Naming: path/route = `perspektiven` (matches the brand surface + German content); code types stay English (`Article`, `getArticle`) per codebase convention.

### Routes

| Route | File | Renders |
|-------|------|---------|
| `/perspektiven` | `src/app/perspektiven/page.tsx` | Index hub: intro lead + `ArticleCard` list (newest first) |
| `/perspektiven/[slug]` | `src/app/perspektiven/[slug]/page.tsx` | Detail: breadcrumb → `BlogPosting` JSON-LD → H1 → byline → `Prose` body → author bio → FAQ → back-to-index. `notFound()` on unknown slug. |

### Schema — `src/lib/schema/article.ts` (new)

- `BlogPosting` JSON-LD per detail page: `headline`, `description` (=lead), `datePublished`, `dateModified`, `author`, `publisher` (Organization), `mainEntityOfPage`.
- **Author switch:** `author: german-rauhut` → the existing standalone **Person** node from `organization.ts` (German Rauhut, `jobTitle: "Founder"`, sameAs LinkedIn/GitHub); `author: neckarshore` → the **Organization** node. Unknown value → Organization (fail-safe).
- Optional `FAQPage` when `faq` present (reuse the `ProductFaq` schema pattern).
- **Rendering: native `<script type="application/ld+json">` in the Server Component — NOT `next/script`** (AD-19; crawler must see schema in the raw SSR response).

### Integration touchpoints (the "don't forget" list)

1. `src/components/Nav.tsx` — add a top-level **Perspektiven** link (desktop nav + mobile nav both).
2. `src/app/sitemap.ts` — add `/perspektiven` + each article URL (indexable).
3. `src/app/api/search-index/route.ts` — add the `perspektiven` collection to the Cmd+K index builder.
4. `public/llms.txt` — add a "Perspektiven" section (mirrors products/websites sections).

### Components (reuse-first)

- **Reuse:** `Prose`, `Breadcrumbs`, `JsonLd`, `FounderImage` (bio), the `ProductFaq` pattern.
- **New (small, focused):** `ArticleCard` (index), `ArticleByline` (author + date), `AuthorBio` (name + role + credentials, Person/Org-aware).

## The Citable Article Anatomy (GEO core) — authoring checklist

Every article — whoever writes it — follows this structure. This is the difference between "a blog" and "a citable GEO surface". The checklist ships in the spec and is enforced by review (not code), with the `lead` and `faq` fields and the H2 discipline being the mechanical anchors.

1. **Citable lead (money paragraph):** first paragraph is a self-contained, quotable answer/definition (40–60 words), understandable without context. = the `lead` field, reused as meta description + schema `description`.
2. **Question-shaped H2s:** section headings are the actual questions a CTO asks ("Was kostet Offshore wirklich?"). Each H2 **answers its question in sentence 1–2** (inverted pyramid), then elaborates. The single biggest GEO lever (audit G2/G4).
3. **Factual density + attributable claims:** concrete numbers, named practices, no filler. Each core claim liftable as a standalone fact. Fits "weniger ist mehr" — no padding for word-count.
4. **FAQ block:** 3–5 Q&A at the end → `FAQPage` → directly citable pairs.
5. **Author authority block:** byline (name, role, date) + short bio with real credentials → E-E-A-T + Person/Org schema. Plus a brief "Wie dieser Text entstand" transparency note (trust signal, neckarshore-consistent).
6. **Internal product links:** each article links its product bridge (table above) → topical authority graph + funnel.
7. **External authority links:** link authoritative sources (DSGVO text, studies) where claims need backing → trust + source strength.

## Testing

Mirrors existing patterns; new suite suffix `PSP` (`TC-PSP-*`). Grep the **whole** `tests/` dir before assigning IDs (the `TC-[SUITE]-[NNN]` namespace spans e2e + unit files).

1. **e2e** `tests/e2e/perspektiven.spec.ts` (TC-PSP-*): index loads; each article page loads; breadcrumb present; **no console errors**.
2. **SEO** (extend `seo.spec.ts` or new): `BlogPosting` JSON-LD present + valid per article; `FAQPage` when present; meta title/description per article; canonical.
3. **A11y:** exactly one H1; heading hierarchy (question-H2s are real `h2`); alt text on any images.
4. **Unit:** sitemap contains `/perspektiven` + article URLs; search-index contains every article slug (the `search:unit` invariant); llms.txt has the Perspektiven section + URLs.
5. **Lighthouse:** new routes pass the hard gates (a11y / best-practices / SEO @95). Perf is soft-warn per the device matrix.

## Out of Scope (YAGNI — graduates later from the `topic` field)

- Category/topic hub pages, pagination, RSS, author archive pages, "related articles" algorithm, comments, tag-filter UI.
- The **glossar DefinedTerm sub-option** → Fast-Follow, separate spec.
- The **actual article copy** → downstream content effort (Founder + Gary). This spec defines structure + the 4 titles/angles, not the prose.
- Per-article hero images → optional, not MVP-blocking (text-first for GEO).

## Deliverable & Next

- **This brainstorm delivers:** this spec → then a writing-plans implementation plan for the **surface** (collection + routes + schema + components + integration + tests) + the authoring checklist.
- **The 4 article texts are a separate content effort** after the surface is built and verified.
- **Coordinate with Gary** — off-page now has live product landing pages; the article surface gives him citable, shareable cornerstone content to point at.
