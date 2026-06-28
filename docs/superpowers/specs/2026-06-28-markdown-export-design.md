# Design: Markdown-Export ("Als Markdown")

## Context

Content pages should offer a one-click export of their content as structured Markdown,
so the Founder (and any visitor) can pull a page into Obsidian, hand it to an LLM, or edit
it offline and feed the revised text back into the source. The decisive insight: the pages
are already Markdown-backed (`src/content/products/*.md`, and on OGC `content/blog/*.md`),
and the files the edits round-trip back into ARE those Markdown sources. So the export
serves the **clean source markdown** server-side rather than scraping the rendered DOM —
lossless round-trip, ~zero client JS (Lighthouse stays at 100), and exactly the shape an
LLM/Obsidian wants.

This is the neckarshore.ai reference implementation; the design is built to be copied to
the sibling site repos (OGC first — see "Cross-site port" below).

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Server-side **source** export, not DOM→Markdown | Lossless round-trip into the authored `.md`; reuses existing loaders; zero client JS. |
| 2 | FAQ (and other data-driven sections) assembled from their data source | `faqForSlug()` is structured data — re-serialized cleanly, no DOM scraping. |
| 3 | **Download only** (`.md` attachment) | The button stays a plain `<a download>` → no client component, no JS cost. |
| 4 | **Per-repo module + copyable core** | The generic serializer is identical everywhere; the wiring (loader, content dir) is per-repo. No npm package yet. |
| 5 | Coverage = content pages with a `.md` source | Products now; OGC blog on port. Home/legal (hand-written JSX) are out of scope — they'd need the DOM path we rejected. |

## Architecture

A route handler returns `text/markdown` with `Content-Disposition: attachment`. The button
is a server-rendered `<a download>`. No provider/overlay (unlike Cmd+K search).

| File | Role | Portability |
|------|------|-------------|
| `src/lib/export/serialize.ts` | Generic serializer: YAML frontmatter, `buildMarkdownDocument()`, `faqToMarkdown()` | **Copy verbatim** across sites |
| `src/lib/export/builders/product.ts` | `buildProductMarkdown(slug, opts)` — reads source `.md` + FAQ, calls serializer | Per-repo |
| `src/lib/export/resolve.ts` | `resolveExport(path, opts)` — path → builder; `null` for non-exportable | Per-repo |
| `src/app/api/export/route.ts` | `GET ?path=` → resolve → markdown attachment (200/404/400) | Near-identical |
| `src/components/export/ExportButton.tsx` | `<a download>` + lucide `Download` | Near-identical (Tailwind tokens differ) |

### Data flow

1. `ExportButton path="/products/clearpath"` renders `<a href="/api/export?path=%2Fproducts%2Fclearpath" download>`.
2. `GET /api/export?path=/products/clearpath` → `resolveExport()` matches `/^\/products\/([a-z0-9-]+)\/?$/` → `buildProductMarkdown("clearpath")`.
3. Builder reads the **raw** body + frontmatter via `readEntry("products", slug)` (not the rendered `bodyHtml`), pulls `faqForSlug(slug)`, calls `buildMarkdownDocument()`.
4. Handler returns the string as `text/markdown; charset=utf-8`, `Content-Disposition: attachment; filename="clearpath.md"`.
5. No match → `404`; `path` not starting with `/` → `400`.

### Output format

```markdown
---
title: "ClearPath — eine mentale Firewall gegen kognitive Verzerrungen."
source: "https://neckarshore.ai/products/clearpath"
site: "neckarshore.ai"
exported: "2026-06-28"
---

# ClearPath — …

> Beschreibe eine Entscheidung, …

## Das Problem
…(raw body, 1:1 from clearpath.md)…

## Häufige Fragen
### Was macht ClearPath?
…
```

YAML values are double-quoted + escaped (any value is safe). The `source:` field enables
the round-trip back into the source file.

### Security

The product slug charset is locked to `[a-z0-9-]`, so `/products/../x` never matches the
resolver, and `readEntry` joins a fixed content root — defence in depth against traversal.
No header injection: the filename is `<slug>.md` with that same charset.

### Production file tracing

The handler reads `.md` at request time. Next's tracer can't see the dynamic slug, so
`next.config.ts` force-includes the content dir:

```ts
outputFileTracingIncludes: { "/api/export": ["src/content/products/**/*.md"] }
```

Verified against a production build + `next start`: `200 text/markdown` with the full
document (dev-server alone would mask a missing-file regression).

## Tests

- **Unit** (`npm run test:unit`): `tests/unit/export-markdown.test.ts` — TC-EXP-U01..U08 (serializer structure/escaping, builder assembly from real `clearpath.md` + FAQ, resolver path matching + null for traversal/non-exportable).
- **E2E** (`npm run test:e2e`): `tests/e2e/export.spec.ts` — TC-EXP-001..006 (button present on bespoke + preview templates, endpoint contract, body content, 404/400). Runs against the dev server, so it does NOT exercise file tracing — that is a manual prod-build check.

## Cross-site port (OGC next)

1. Copy `serialize.ts` verbatim.
2. New `builders/blog.ts` → `buildBlogMarkdown(slug)` reading `content/blog/<slug>.md` (frontmatter `title`/`excerpt`/`date` → header; raw body). OGC has no per-post FAQ → no extra section.
3. `resolve.ts` → add `/^\/blog\/([a-z0-9-]+)\/?$/` matcher.
4. Route handler: same shape; `outputFileTracingIncludes: { "/api/export": ["content/blog/**/*.md"] }` (OGC content dir is `content/`, not `src/content/`).
5. `ExportButton` in the blog-post template (`app/blog/[slug]/page.tsx`).

## Out of scope / follow-ups

1. Product-specific structured blocks (e.g. the ClearPath biases table) — currently NOT in the export (header + body + FAQ only). Add per-product if the value justifies it.
2. Home/legal export — would need the DOM/hybrid path (rejected). Alternative: move legal content from JSX into `.md`, then it becomes exportable.
3. Promote the serializer core to a shared package once it has proven stable across ≥2 sites.
