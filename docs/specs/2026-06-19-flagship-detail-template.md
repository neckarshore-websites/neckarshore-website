# Flagship Detail Template — Design Spec (deliberately thin)

> **Status:** Design sketch (brainstorm-approved 2026-06-19). **Premature to build — see §1.**
> **Owner:** Linus FE · **Reference impl:** Omnopsis (`omnopsis`, hardcoded bespoke, 176 lines).

## 1. Why this spec is thin (honest scope)

There is exactly **one** Flagship today — Omnopsis — and its page is a hardcoded bespoke component (176 lines), not a template. A template for a single consumer is **premature abstraction** (Rule-of-Three: build the abstraction at the 3rd repetition, not the 1st). Founder-confirmed 2026-06-19: spec the *shape* now so it's ready, but do **not** build a Flagship template until a 2nd Flagship exists.

> **Ground truth (2026-06-19):** Omnopsis is hardcoded JSX, no content-collection. It works and is live. It stays bespoke.

## 2. Shared Architecture

If/when a 2nd Flagship justifies a template, it reuses the common detail-page architecture from [`2026-06-19-website-case-study-template.md`](./2026-06-19-website-case-study-template.md) §3–§5.

## 3. Delta — the Flagship shape (for the future template)

| Aspect | Flagship value |
|--------|----------------|
| **Content** | (future) `src/content/flagships/<slug>.md` |
| **Frontmatter** | `name`, `headline`, `lead`, `applicationCategory`, optional `liveUrl` |
| **Axes (`## Headings`)** | Vision / Das Problem · Was es löst · Wie es funktioniert / Architektur · Status & Roadmap · Wie dieser Text entstand. A Flagship page is the richest of the four — more story, more depth than an MMP. |
| **Schema** | `SoftwareApplication` (`BusinessApplication`) — pre-launch: **no Offer, no fake live URL** (the AD-19 / products-tree discipline: a free Offer or live URL that doesn't exist is a false claim) |
| **Primary CTA** | "Kennenlerntermin buchen →" (Calendly) — Flagships are sales-led, not self-serve |
| **Card** | Internal detail link |

## 4. Today's action: none (intentional)

Omnopsis stays as-is. No `flagships` collection, no generic route. This spec is the **lock of the shape** so a future build is fast, not a build order.

## 5. Migration Note

When the Flagship template is built (2nd Flagship trigger), Omnopsis becomes the migration candidate — same "build on greenfield, migrate bespoke later" discipline as the Website + Skill specs.

## 6. Out of Scope

Everything until a 2nd Flagship exists. This spec exists to prevent re-deriving the shape later, not to authorise work now.
