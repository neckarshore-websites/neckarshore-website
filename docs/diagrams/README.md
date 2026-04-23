# Diagrams — neckarshore-website

Internal diagrams for the neckarshore.ai product landscape. Plain HTML with inline SVG/CSS, fully self-contained, brand-tokened from `hq/04-Marketing/Brand/style-guide.md` ("Neckar Blue" palette, Space Grotesk + Inter).

Open any file directly in a browser — no build step, no server.

## Files

| File | Subject | Last updated |
|---|---|---|
| `architecture.html` | Data flow: Confluence / Jira / GitHub → OMNOPSIS Documentor+X → living docs / tests / traceability | 2026-04-23 |

## Conventions

- One diagram per HTML file, self-contained (no shared CSS yet).
- Brand tokens hard-coded from the style guide — no build pipeline, so changes to the source-of-truth palette have to be propagated here manually.
- Not part of the Next.js build (outside `src/`, outside `public/`). Changes here do **not** affect the live site.
- Prefer subject-per-file over growing a single monolith.

## When to regenerate

- Brand palette or font changes in `hq/04-Marketing/Brand/style-guide.md`.
- Product naming changes (e.g. R4 rebrand propagation).
- Architecture changes in how OMNOPSIS consumes sources or emits outputs.
