---
title: Easter-Eggs Curator System (Spec 1)
status: draft-for-maschin-review
author: linus
reviewer: maschin
created: 2026-05-14
spec_id: easter-eggs-curator-system
supersedes: none
related:
  - "Brand Kit Prompt — neckarshore.ai (Nexus Vault)"
  - "Brand Kit Prompt — rauhut.com (Nexus Vault)"
  - "neckarshore-easter-eggs/README.md"
  - "neckarshore-easter-eggs-playlist (existing skill, reference pattern)"
scope: |
  Generation pipeline for session-close image artifacts.
  Live mode (new images per session) + Backfill mode (rework existing prompts).
  Distribution to social channels (X / Instagram / LinkedIn) is OUT OF SCOPE — that is Spec 2.
---

# Easter-Eggs Curator System (Spec 1)

> **Status: draft-for-maschin-review.** This document is a Linus-authored proposal. MASCHIN reviews, refines, and decides whether the canonical version lives here (`neckarshore-website/docs/specs/`) or migrates to the planning repo. No implementation begins before MASCHIN's review and a follow-up implementation plan.

## 1 — Problem Statement

Session-close Easter-Egg images have drifted into a single visual register over the last six weeks — warm-tungsten atmosphere, Caravaggio-style still life, Hopper-era cafeteria scenes, Italian-pine train-station mornings, candle-lit workbenches. The pattern reads as "1860s Dickens" — atmospheric, melancholic, technically nostalgic.

Two problems:

1. **Pattern fatigue.** After 20–30 images in the same register, the series stops surprising. Each new image confirms a pattern rather than adding to it.
2. **Brand mismatch — and this is the harder problem.** Both Neckarshore and rauhut.com brand kits explicitly forbid warm-industrial-nostalgia: cool engineered tech is the brand, not warm earth tones. The Easter Eggs have drifted into the wrong brand universe entirely. Automating the current state would cement the drift.

**Therefore**: before automation, install brand discipline. The persona writes a minimal session-close one-liner; a dedicated curator pipeline parses, lints, and renders within the brand corridor.

## 2 — Doctrine = Existing Brand Kits

The two brand kits are the source of truth for visual identity. The curator does not invent doctrine — it enforces the existing one.

| Brand | File (Nexus Vault) | Version |
|-------|---------------------|---------|
| Neckarshore | `Brand Kit Prompt — neckarshore.ai.md` | v3, 2026-05-11 |
| rauhut.com | `Brand Kit Prompt — rauhut.com.md` | v2, 2026-05-11 |

The curator copies the `VISUAL SYSTEM` block verbatim from the relevant brand kit into every render prompt. When the brand kits update, the curator re-reads them — they are not duplicated into curator code.

## 3 — Two-Layer Architecture

The system separates persona work (semantic input) from curation work (brand enforcement + rendering). This keeps personas in their core flow (coding, planning, design) and isolates brand discipline in a dedicated downstream layer.

| Layer | Who | When | Input | Output |
|-------|-----|------|-------|--------|
| A — Persona | Persona at session-close | Live, inline with session report | **One free-form line, max 25 words.** Example: `"ein einzelnes Variable-Font-File auf einem Schreibtisch — 36 KiB weniger, niemand merkt's"` | Appended to `image-collection.md` in the comedy-execution-engine assets (same pattern as `song-collection.md`) |
| B — Curator | Dedicated curator (form TBD — see Section 10) | Asynchronous: scheduled, on-demand, or batch backfill | Free-form line from Layer A | Structured briefing card + brand-compliant render + commit to `neckarshore-easter-eggs/images/` |

**Hard constraint:** Layer A imposes zero brand-discipline overhead on the persona. No lint warnings at session-close, no schema fields, no axis selection. The persona writes one line in natural voice and moves on.

## 4 — Hard Lint (forbidden vocabulary)

The curator runs a lint pass over both the persona one-liner and any intermediate prompts it generates. The following words / concepts are flagged:

```
warm, tungsten, golden hour, candle, candle-lit, lamp glow, lantern,
cinematic, dramatic light, moody, atmospheric, melancholic light,
Hopper, Vermeer, Caravaggio, Rembrandt, Bauhaus (as visual style), Magritte,
vintage, nostalgic, edwardian, dickensian, 1860, 1920s, 1950s, mid-century,
italienische Pinien, italian pines, bahnsteig, train station platform,
café, cafeteria, restaurant scene, espresso machine, marble countertop,
brass, cream, beige, bronze, earth tones, terracotta, ochre,
stillleben, still life with objects on wooden table,
shallow depth of field, bokeh, soft focus
```

**Lint mechanic — decision deferred to MASCHIN (see Section 10):**
- Hard-fail variant: lint hit → curator rejects, kicks back for rewrite (or auto-rewrite via LLM).
- Soft-filter variant: lint hit → curator strips / paraphrases the offending fragment, continues to render.

The list is versioned in the curator config and grows empirically — when a new pattern emerges that violates brand, it gets added.

## 5 — Visual Axes Corridor

The brand kits fix four of six visual axes per universe. The curator rotates the remaining two (Medium, Subject) to produce variance within the corridor.

| Axis | Neckarshore (fixed) | rauhut.com (fixed) |
|------|---------------------|---------------------|
| Ground | Off-White `#F8FAFC` OR Deep Navy `#0A2540` | Deep Black `#0A0A0A` — always |
| Palette | `#0A2540` / `#F8FAFC` / `#00D4FF` (Teal sparingly) | `#0A0A0A` / `#F5F5F5` / `#22D3EE` H1 / `#F59E0B` labels (dual-accent) |
| Typography (when present in image) | Space Grotesk (display) + Inter (body) | Inter only |
| Light | Cool studio OR low-key dark | Low-key dark, soft frontal |

| Axis | Curator rotates (both universes) |
|------|----------------------------------|
| Medium | photo (cool tech) / editorial illustration / mockup / wireframe-diagram / abstract geometric pattern / UI-screen / vector-icon-composition |
| Subject | tools, workspace, mockup-tile, abstract "N"-wave or "gr"-monogram geometry, real-but-quiet people, UI-frames, code-frames, stat-tiles |

**Rotation rule:** The curator tracks the medium of the last N rendered images per universe (suggested N=5). It biases toward un-recent media when choosing. Persona may override via an optional `medium_hint` in Layer A's one-liner (e.g. prefix `[mockup]` or `[diagram]`), but the default is curator-rotation.

## 6 — Briefing-Card Schema (curator-internal)

The curator parses the Layer A one-liner into this structure before rendering. **This is internal — the persona never sees it.**

```yaml
universe: neckarshore | rauhut
subject: <1 sentence, max 25 words, concrete: what is in the image>
tension: <1 sentence, max 25 words: what the image says about the session>
key_objects: <1-3 concrete things, comma-separated>
mood_hint: <quiet | satirical | paranoid | euphoric | melancholic | absurd | bureaucratic | curious>
medium_hint: <photo | illustration | mockup | diagram | wireframe | pattern | ui-screen | vector-icon>
source_line: <verbatim Layer A one-liner>
source_session: <session report path>
persona: <linus | bob | maschin | obi | sensei | ...>
```

Parsing is LLM-assisted (Haiku-class is sufficient). The parser is prompted with the brand-kit `VISUAL SYSTEM` block as constraint context, so it cannot extract forbidden vocabulary into structured fields.

**Universe inference:** Default rule — Neckarshore personas (Linus, Bob, MASCHIN, Steffi, Obi, James, Gary, Jack, Trillian, Dr. Sommer) → `neckarshore`. rauhut.com personas (Sensei, personal-life work, Hans-Cee, Lorne-Cee) → `rauhut`. Persona-to-universe mapping versioned in curator config. Override possible via explicit `[universe: rauhut]` prefix in Layer A.

## 7 — Style-Director Render Schema (Mode Y — Narrative Scene)

The curator constructs a render prompt by concatenating:

```
[VERBATIM: VISUAL SYSTEM block from brand kit for the selected universe]

NARRATIVE SUBJECT (this session):
Subject: {briefing.subject}
Tension: {briefing.tension}
Key objects: {briefing.key_objects}
Mood: {briefing.mood_hint}
Medium: {briefing.medium_hint}

The image is a SINGLE NARRATIVE SCENE rendered strictly within the Brand Visual System above.
This is NOT a brand board — no footer label, no page number, no logo overlay.
This is a session artifact: one image that tells the session's story through the chosen subject and medium.

AVOID (hard lint — never appear in the image):
{verbatim hard-lint list from Section 4}

Aspect: <TBD MASCHIN — see Open Questions>
```

The aspect ratio, image-gen provider, and post-render brand-compliance check are deferred to MASCHIN (Section 10).

## 8 — Backfill Mode

The curator has two operational modes that share the same pipeline downstream of input:

| Mode | Trigger | Input Source | Use Case |
|------|---------|--------------|----------|
| Live | On-demand or scheduled, after a new entry lands in `image-collection.md` | Newest unprocessed Layer-A line | Standard per-session rendering |
| Backfill | Explicit CLI invocation with optional date range | All historical `poster_prompt:` fields in `omnopsis-planning/docs/reports/*.md` plus any pre-Layer-A images | Migrate the existing ~30 drifted prompts into brand-compliant renders, retiring the old ones |

Backfill specifics:

1. Scan reports for `poster_prompt:` YAML fields and any explicit Easter-Egg image references.
2. For each found prompt: extract the source line (it is typically already richer than a Layer A one-liner — the curator down-samples it to a 25-word equivalent, deliberately discarding the brand-incompatible decoration).
3. Run the same parse → lint → render pipeline as Live.
4. Commit renders under `neckarshore-easter-eggs/images/<YYYY-MM-DD>-<persona>-<slug>.{jpg,png}` with the briefing card as sibling YAML.
5. Mark each source as `backfilled: true` in a curator state file to avoid double-processing.

Backfill runs in a dedicated session, triggered by a human operator. No persona is involved in backfill.

## 9 — Persona-Side Format

Add `image-collection.md` to `comedy-execution-engine/assets/`, mirroring the existing `song-collection.md` structure. Suggested entry shape:

```markdown
## 2026-05-14 — Linus — Font Subset Session

> ein einzelnes Variable-Font-File auf einem Schreibtisch — 36 KiB weniger, niemand merkt's

(optional inline override: `[medium: mockup]` or `[universe: rauhut]`)
```

That is the persona's entire contribution. One line, no schema, no lint, no brand vocabulary required. The persona's voice lives in the wording choice; the curator handles everything else.

## 10 — Open Questions for MASCHIN

The following decisions exceed Linus's domain (visual / frontend) and belong to system architecture. They are listed here as inputs to MASCHIN's spec review and implementation plan.

| # | Question | Linus' lean (non-binding) |
|---|----------|---------------------------|
| 1 | Curator form: dedicated persona-agent, skill (analog `neckarshore-easter-eggs-playlist`), CLI-tool, or hybrid? | Skill + CLI hybrid. Deterministic pipeline, persona-agnostic, user-triggered or cron. A new persona feels heavyweight. |
| 2 | Image-generation provider: OpenAI gpt-image-1, Midjourney API, Replicate (SDXL / FLUX), Together AI? | gpt-image-1 — already used by user for brand kits, identical prompt format. Pricing acceptable for low volume. |
| 3 | Lint mechanic: hard-fail or soft-filter? | Soft-filter for backfill (else most historical prompts fail). Hard-fail for Live after a grace period. |
| 4 | Post-render brand-compliance check: LLM-as-judge on the rendered image (Claude vision / GPT-4V) or trust the prompt? | LLM-as-judge with a brand-compliance rubric, especially during the first weeks. Reject + re-roll on failure. |
| 5 | Aspect ratio: 16:9 (X / poster), 4:5 (brand-kit consistent), 1:1 (Instagram-grid)? | 16:9 default for Easter-Egg poster use. Spec 2 (Distribution) may need additional ratios — defer cropping logic to Spec 2. |
| 6 | Persistence structure in `neckarshore-easter-eggs/images/`: file naming, sibling YAML schema, archive vs. latest section? | `<YYYY-MM-DD>-<persona>-<slug>.{jpg,png}` + `.yaml` sibling with full briefing card. Monthly archive folders after v1.1. |
| 7 | Hallucination guards: what is the equivalent of the Spotify+MusicBrainz pattern for images? | Brand-compliance check (Q4) IS the hallucination guard for visuals. Different problem class than songs. |
| 8 | Curator memory: where does the rotation state live (last-N media per universe)? | YAML file in curator state dir, or sqlite. Whatever the chosen curator form (Q1) supports cleanly. |
| 9 | Lint vocabulary lifecycle: who maintains it, how does it grow? | Linus owns the seed list, additions via session reports flagged "lint candidate". Quarterly review. |
| 10 | Failure handling: render fails / quota exceeded / brand-judge rejects N times — what happens? | Backoff + retry + final fallback to "unverified" folder mirroring the playlist skill's pattern. |
| 11 | Backfill scope: how far back? All reports? Last 3 months? | All reports. Volume is manageable (~30 prompts). Cost cap explicit in Backfill CLI. |
| 12 | Persona-to-universe mapping: where is it canonical? | Curator config file, sourced from `omnopsis-planning/docs/reference/personas.md` if such mapping exists; otherwise document it in the curator config and surface to MASCHIN. |

## 11 — Out of Scope

The following items are explicitly NOT part of Spec 1. They belong to follow-up specs.

| Item | Belongs to |
|------|-----------|
| Distribution to X, Instagram, LinkedIn | Spec 2 — separate brainstorming session |
| Channel-specific cropping / caption generation | Spec 2 |
| Posting cadence, queue management, post-time optimization | Spec 2 |
| Engagement tracking | Spec 2 or later |
| Doctrine for the OGC product or other brand universes | Future, when those products acquire Easter-Egg traditions |

## 12 — Spec-Splitting Recommendation

| Spec | Title | Status | Order |
|------|-------|--------|-------|
| 1 | Easter-Eggs Curator System (Live + Backfill) | This document, draft for MASCHIN | First |
| 2 | Easter-Eggs Distribution Layer (X / Instagram / LinkedIn) | Not yet written. Brainstorming session required after Spec 1 is locked. | After Spec 1 implementation in-review |

Spec 2 depends on Spec 1's output structure (Section 9 file naming + sibling YAML), so Spec 2 cannot be designed until Spec 1 is locked. Implementation of Spec 2 may proceed in parallel with Spec 1's continued backfill operations, since they share no write paths.

## 13 — Acceptance Criteria for This Draft

This draft is considered ready for MASCHIN-review when:

- [x] Problem statement names the drift and the brand mismatch explicitly
- [x] Doctrine is anchored to existing brand kit files, not re-invented
- [x] Two-Layer architecture is unambiguous: persona burden = one line
- [x] Hard lint vocabulary is enumerated, not described
- [x] Visual axes corridor is tabular per universe
- [x] Curator-internal briefing card schema is YAML-shaped
- [x] Backfill mode is described as a second mode of the same pipeline, not a separate system
- [x] Distribution is explicitly out of scope with a forward reference
- [x] Open questions for MASCHIN are enumerated with non-binding leans
- [x] No image-gen provider, CLI shape, or implementation detail is locked — those are MASCHIN's calls

## 14 — Self-Review Notes (author: linus)

- The lint vocabulary in Section 4 may be over-inclusive. Once the curator runs on backfill, MASCHIN may see legitimate session content getting flagged. Treat the list as v0 — expect tuning.
- The `medium_hint` and `universe` overrides in Layer A (Section 5, Section 6) are escape hatches for personas who do want some control. If they prove unused after 3 months, remove them — every escape hatch is technical debt.
- Section 7's render prompt is presented as a single concatenation. In practice, the brand-kit `VISUAL SYSTEM` block is long (~30 lines). The actual prompt may need to be split into system / user messages depending on the chosen image-gen provider. That is an implementation detail for MASCHIN.
- Aspect ratio (Q5) is the single biggest gap. If MASCHIN chooses 4:5 (brand-kit consistent), Spec 2 cropping logic gets harder. If 16:9, the visual feel is different from the brand-kit boards. Recommend MASCHIN runs 3-5 test renders in each ratio before locking.
