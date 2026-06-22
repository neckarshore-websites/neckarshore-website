# Product Card Layout — the four-corner principle

Source of truth for how every card on the `/products` surface is laid out. Locked
2026-06-22 after the card-system unification. If you touch `ProductCard`, `SkillCard`,
or `StatusPill`, read this first.

## The principle

Every card — MMP, Skill, Website, Flagship, portal teaser — uses the **same four
corners**:

```
┌─────────────────────────────────────────────┐
│ Title (top-left)        GitHub / Website ↗ (TR) │
│                                               │
│   … description / capability list …           │
│                                               │
│ [Status pill] (BL)          Mehr erfahren → (BR)│
└─────────────────────────────────────────────┘
```

| Corner | Content | Notes |
|--------|---------|-------|
| Top-left | Card title | Same row/height as the top-right link. Skill cards prefix the title with the tool icon. |
| Top-right | Link to **GitHub** (OSS/MMP) or **Website ↗** (website tier) | A real `<a target="_blank">`. Absent where there is no such link (flagship, internal). |
| Bottom-left | **Status pill** | One short word — see the status table below. On skill cards the OSS license sits as small text next to it. |
| Bottom-right | **Mehr erfahren →** | The detail-page link. Also the *stretched* whole-card link (see Clickability). |

## Status pill (bottom-left, on every card)

The pill reflects the card's **honest current status**, not a raw flag.

| Card | Pill | Source |
|------|------|--------|
| omnopsis (flagship) | `In Entwicklung` | `statusLabel` override — pre-launch (MVP Q2 2026), so it must NOT say "Live" despite `status: "live"`. |
| clearpath | `Live` | derived from `status` |
| MMP previews (snakeoil-check, phonesis, local-seo-hub, prod-or-pretend) | `In Entwicklung` | `status: "preview"` |
| Websites (neckarshore.ai, ristorante-goldoni.de, oakwoodgolfclub.de, rauhut.com) | `Live` | `status: "external"` |
| OSS skills (OVA, social-scrapers, imap, ai-phrase-check) | `Beta` | `SkillCardData.badge` |
| Restaurant-Menüpflege (private) | `Referenz-Beispiel` | `SkillCardData.footerBadge` |

- **ProductCard** label: `statusPillLabel(item)` in `src/lib/portfolio.ts` — `statusLabel`
  override wins, else `{preview→"In Entwicklung", live→"Live", external→"Live"}`.
- **SkillCard** label: `card.badge ?? card.footerBadge`.
- The pill itself renders via the shared `<StatusPill>` (`src/components/StatusPill.tsx`),
  so the styling (muted, uppercase, rounded) is byte-identical everywhere.

## Clickability

Cards are a `<div>` (never a whole-card `<a>`, because they carry a secondary
GitHub/Website `<a>` and anchors can't nest). The **whole card is still clickable** via a
stretched `::after` overlay on the bottom-right "Mehr erfahren" link
(`after:absolute after:inset-0`). The title link and the top-right link carry
`relative z-10` so they stay above the overlay and remain independently clickable. A
`group` + hover affordance signals the card is clickable. Skill cards used only as a
detail-page hero (no `detailHref`) are intentionally not clickable.

## Components

| File | Role |
|------|------|
| `src/components/StatusPill.tsx` | The shared bottom-left pill. |
| `src/components/ProductCard.tsx` | MMP / flagship / website / portal-teaser cards. One unified render; per-variant differences are just the top-right link + the CTA target. |
| `src/components/SkillCard.tsx` | OSS skill cards (listing + detail-page hero). Same four corners; adds the icon (top-left, before the title) and the capability list. |
| `src/lib/portfolio.ts` | `statusPillLabel(item)` + the `statusLabel?` override field. |

## Tests

- `TC-CNT-057` / `TC-CNT-058` — whole-card click navigates; GitHub button stays its own target.
- `TC-CNT-059` — every sub-portal card type shows its status pill.
- `TC-CNT-016` — website cards show a "Live" pill + a "Website" link (never "Extern").
