# Skill Detail Template — Design Spec

> **Status:** Design (brainstorm-approved 2026-06-19). Implementation pending.
> **Owner:** Linus FE · **Reference impl:** OVA (`obsidian-vault-autopilot`, hardcoded — NOT yet a template).

## 1. Goal

Give the four preview Skills (social-scrapers, imap-mailbox-cleanup, ai-phrase-check, restaurant-menu-update) real, indexable detail pages, replacing the `[slug]` skeleton. OVA is the visual reference — but OVA is **288 lines of hardcoded JSX**, not a template. This spec creates the Skill content-collection so future Skills are data-driven.

> **Ground truth (2026-06-19):** No `skills` content-collection exists. OVA's sections are hardcoded. The `SkillCard` component IS reusable (icon/badge/capabilities/license/repo) and stays the hero.

## 2. Shared Architecture

Reuses the common detail-page architecture from [`2026-06-19-website-case-study-template.md`](./2026-06-19-website-case-study-template.md) §3–§5. **This spec only covers the Skill-specific delta.**

## 3. Delta — what makes a Skill page a Skill page

| Aspect | Skill value |
|--------|-------------|
| **Content** | NEW collection `src/content/skills/<slug>.md` + loader `src/lib/content/skills.ts` |
| **Hero** | The existing `SkillCard` (icon · Beta badge · capabilities `code`-list · license · GitHub button) rendered at `headingLevel="h1"` — already done on the OVA page |
| **Frontmatter** | `name`, `headline`, `lead`, `repoUrl`, `license`, `applicationCategory` (the SkillCard data already lives in `lib/skill-cards.ts` — reuse, don't duplicate) |
| **Axes (`## Headings`)** | Was ist X? · Die N Skills *(capabilities deep-dive)* · Sicher by Design · Datenschutz · Installation · Häufige Fragen *(FAQ)* |
| **Schema** | `SoftwareApplication` (OSS tool) |
| **Primary CTA** | "GitHub ↗" → `repoUrl` (`target="_blank"`) |
| **Card** | **Both** — internal detail link + GitHub button (already shipped via `SkillCard` + `detailHrefFor`) |

## 4. Path & Route

`src/app/products/<slug>/page.tsx` per Skill (mirrors OVA's path), thin wrapper: `SkillCard` hero + `getSkillEntry(slug)` body via `Prose`. The SkillCard data stays in `lib/skill-cards.ts`; the narrative axes come from the new Markdown collection. When a Skill page lands → drop `noindex` → sitemap + card detail link auto-light.

## 5. Consumers (today's skeletons)

social-scrapers · imap-mailbox-cleanup · ai-phrase-check · restaurant-menu-update. Each = `SkillCard` data (mostly exists) + `src/content/skills/<slug>.md` (the 6 axes) + drop `noindex`. social-scrapers granularity (1 card vs 3) is an open texting question carried from L-NECK-PRODUCTS-CONTENT-PASS.

## 6. Migration Note (not in scope now)

**OVA** is the migration candidate: its 288 hardcoded lines → the new Markdown collection once the template is proven on the four skeletons. Do NOT migrate OVA as part of the first build — prove the template on pages that have no content today, then lift OVA over. (Same discipline as the Website spec: build the template on greenfield, migrate the bespoke later.)

## 7. Tests

Per Skill page: 200, single H1, SkillCard hero present, the 6 axis headings, GitHub link `target="_blank"`, one `SoftwareApplication` JSON-LD block. Reuse the search-index coverage invariant style for "every Skill has a content entry".
