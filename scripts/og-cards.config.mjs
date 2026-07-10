/**
 * Social Preview Cards — Config
 *
 * Each entry is a pure-data card definition. Layout/design is fixed in
 * `generate-og-image.mjs`; this file only varies content and target.
 *
 * To add a new card:
 *   1. Copy an existing entry, change `label`, `dest`, `headline`, `tagline`, `chips`.
 *   2. Run `node scripts/generate-og-image.mjs`.
 *   3. Check output visually.
 *
 * Dimensions reference (see docs/branding/README.md for rules):
 *   - `public/og-image.jpg`              1200 x 630  padding 72   — neckarshore.ai site OG (OpenGraph/Twitter)
 *   - `docs/branding/github-*.jpg`       1280 x 640  padding 80   — GitHub repo social preview cards
 *
 * Chip variants: "dot" (cyan glow dot), "plain" (default), "accent" (cyan outline + text).
 *
 * To temporarily skip a card: add `skip: true, skipReason: "…"`.
 */

export const cards = [
  // ─── neckarshore.ai Website OG (used by src/app/layout.tsx metadata) ───
  {
    label: "neckarshore.ai OG (website SSR)",
    dest: "public/og-image.jpg",
    width: 1200,
    height: 630,
    padding: 72,
    maxKB: 200,
    headline: "Software Development.",
    headlineAccent: "Closer to Home.",
    tagline:
      "KI-beschleunigte Softwareentwicklung aus Stuttgart. Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards.",
    chips: [
      { text: "Made in Germany", variant: "dot" },
      { text: "DSGVO-by-Design", variant: "plain" },
      { text: "AI-Powered", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: neckarshore-website ───
  {
    label: "GitHub Repo Card — neckarshore-website",
    dest: "docs/branding/github-social-preview-website.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "Software Development.",
    headlineAccent: "Closer to Home.",
    tagline:
      "KI-beschleunigte Softwareentwicklung aus Stuttgart. Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards.",
    chips: [
      { text: "Made in Germany", variant: "dot" },
      { text: "DSGVO-by-Design", variant: "plain" },
      { text: "AI-Powered", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: obsidian-vault-autopilot ───
  {
    label: "GitHub Repo Card — obsidian-vault-autopilot",
    dest: "docs/branding/github-social-preview-vault-autopilot.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "Obsidian Vault",
    headlineAccent: "Autopilot.",
    tagline:
      "AI-powered vault management for Claude Code. Sorts your inbox, renames your files, enriches your metadata — so you can focus on thinking instead of filing.",
    chips: [
      { text: "Skills", variant: "dot" },
      { text: "Open Source", variant: "plain" },
      { text: "MIT Licensed", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: obsidian-instagram-scraper (L18a) ───
  {
    label: "GitHub Repo Card — obsidian-instagram-scraper",
    dest: "docs/branding/github-social-preview-instagram-scraper.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "Instagram",
    headlineAccent: "in Markdown.",
    tagline:
      "Apify-powered Obsidian skill for Instagram profiles and Reels. Reels transcribed locally via whisper.cpp, posts polished into neutral Markdown briefings by the AI model of your choice.",
    chips: [
      { text: "Skill", variant: "dot" },
      { text: "Apify", variant: "plain" },
      { text: "Open Source", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: obsidian-linkedin-scraper (L18b) ───
  {
    label: "GitHub Repo Card — obsidian-linkedin-scraper",
    dest: "docs/branding/github-social-preview-linkedin-scraper.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "LinkedIn",
    headlineAccent: "in Markdown.",
    tagline:
      "Apify-powered Obsidian skill for LinkedIn profiles and posts. Output: neutral Markdown briefings polished by the AI model of your choice — no engagement-bait formatting.",
    chips: [
      { text: "Skill", variant: "dot" },
      { text: "Apify", variant: "plain" },
      { text: "Open Source", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: obsidian-x-scraper ───
  // Repo currently private; card prepared for future public release.
  {
    label: "GitHub Repo Card — obsidian-x-scraper",
    dest: "docs/branding/github-social-preview-x-scraper.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "X",
    headlineAccent: "in Markdown.",
    tagline:
      "Obsidian skill for X profiles and threads via the official X API. Output: neutral Markdown briefings polished by the AI model of your choice — ToS-compliant, no third-party scraping.",
    chips: [
      { text: "Skill", variant: "dot" },
      { text: "X API", variant: "plain" },
      { text: "Open Source", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: obsidian-social-scrapers-common (L18c) ───
  {
    label: "GitHub Repo Card — obsidian-social-scrapers-common",
    dest: "docs/branding/github-social-preview-scrapers-common.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "Social Scrapers",
    headlineAccent: "Shared core.",
    tagline:
      "Shared TypeScript utilities for the Obsidian social-scraper family — Apify wrappers, AI polishing, Markdown rendering. Lego blocks, no duplication.",
    chips: [
      { text: "TypeScript", variant: "dot" },
      { text: "Shared Lib", variant: "plain" },
      { text: "Open Source", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: imap-mailbox-cleanup ───
  // Personal repo (GmanFooFoo namespace), produced in the neckarshore.ai
  // visual system because it's part of the user's broader portfolio surface.
  {
    label: "GitHub Repo Card — imap-mailbox-cleanup",
    dest: "docs/branding/github-social-preview-imap-cleanup.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "Mailbox Triage.",
    headlineAccent: "Dry-run first.",
    tagline:
      "Hybrid CLI + Claude Code Skill for IONOS IMAP cleanup. Dry-run by default, soft-delete only, audit-logged. Battle-tested: 7.982 → 690 messages without a single loss.",
    chips: [
      { text: "Python", variant: "dot" },
      { text: "CLI + Skill", variant: "plain" },
      { text: "MIT Licensed", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: neckarshore-easter-eggs ───
  {
    label: "GitHub Repo Card — neckarshore-easter-eggs",
    dest: "docs/branding/github-social-preview-easter-eggs.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "Session Easter Eggs.",
    headlineAccent: "Auto-synced.",
    tagline:
      "Songs, films, posters and quotes from an AI-orchestration team's session-close rituals. Hallucination-guarded — only real songs, real films, real quotes make it in.",
    chips: [
      { text: "Skills", variant: "dot" },
      { text: "Verified", variant: "plain" },
      { text: "Open Source", variant: "accent" },
    ],
  },

  // ─── GitHub Repo Card: OMNOPSIS (core product) ───
  // Blocked on MASCHIN positioning brief — see docs/branding/positioning-request-maschin.md
  {
    label: "GitHub Repo Card — OMNOPSIS",
    dest: "docs/branding/github-social-preview-omnopsis.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "TBD",
    headlineAccent: "TBD.",
    tagline: "TBD — awaiting MASCHIN positioning brief.",
    chips: [
      { text: "TBD", variant: "dot" },
      { text: "TBD", variant: "plain" },
      { text: "TBD", variant: "accent" },
    ],
    skip: true,
    skipReason: "awaiting MASCHIN positioning — see docs/branding/positioning-request-maschin.md",
  },

  // ─── GitHub Repo Card: Comedy-Execution-Engine ───
  // Blocked on MASCHIN positioning brief — see docs/branding/positioning-request-maschin.md
  {
    label: "GitHub Repo Card — Comedy-Execution-Engine",
    dest: "docs/branding/github-social-preview-cee.jpg",
    width: 1280,
    height: 640,
    padding: 80,
    headline: "TBD",
    headlineAccent: "TBD.",
    tagline: "TBD — awaiting MASCHIN positioning brief.",
    chips: [
      { text: "TBD", variant: "dot" },
      { text: "TBD", variant: "plain" },
      { text: "TBD", variant: "accent" },
    ],
    skip: true,
    skipReason: "awaiting MASCHIN positioning — see docs/branding/positioning-request-maschin.md",
  },

  // ─── Product OG cards (public/og/<slug>.jpg) — per-product social preview, 1200x630 ───
  // Taglines copied verbatim from src/lib/portfolio.ts. Chips are DESCRIPTIVE only
  // (category/theme), never an availability claim. Set: L-NECK-OG-IMAGES-PER-PRODUCT (11 indexable).
  {
    label: "Product OG — omnopsis",
    dest: "public/og/omnopsis.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Omnopsis", headlineAccent: "Documentor+X.",
    tagline: "KI-first Documentation Engine für Engineering-Teams — fail-closed, BYOLLM, DSGVO-by-Design.",
    chips: [
      { text: "KI-first", variant: "dot" },
      { text: "BYOLLM", variant: "plain" },
      { text: "DSGVO-by-Design", variant: "accent" },
    ],
  },
  {
    label: "Product OG — clearpath",
    dest: "public/og/clearpath.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "ClearPath.",
    tagline: "Eine mentale Firewall gegen kognitive Verzerrungen.",
    chips: [
      { text: "Decision Support", variant: "dot" },
      { text: "Web-App", variant: "plain" },
      { text: "DSGVO", variant: "accent" },
    ],
  },
  {
    label: "Product OG — snakeoil-check",
    dest: "public/og/snakeoil-check.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Snakeoil", headlineAccent: "Check.",
    tagline: "Neutraler KI-Reality-Check für Online-Coachings und High-Ticket-Angebote.",
    chips: [
      { text: "KI-Reality-Check", variant: "dot" },
      { text: "Neutral", variant: "plain" },
      { text: "Made in Germany", variant: "accent" },
    ],
  },
  {
    label: "Product OG — phonesis",
    dest: "public/og/phonesis.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Phonesis", headlineAccent: "Voicebank.",
    tagline: "Ein Archiv echter menschlicher Stimmen für den deutschen Markt.",
    chips: [
      { text: "Voice Archive", variant: "dot" },
      { text: "Human Voices", variant: "plain" },
      { text: "Made in Germany", variant: "accent" },
    ],
  },
  {
    label: "Product OG — local-seo-hub",
    dest: "public/og/local-seo-hub.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Local-SEO", headlineAccent: "Hub.",
    tagline: "AI-first Sichtbarkeits-Plattform für lokale Unternehmen — Rankings, Reviews, Citations in einem Score.",
    chips: [
      { text: "Local SEO", variant: "dot" },
      { text: "AI-first", variant: "plain" },
      { text: "DSGVO", variant: "accent" },
    ],
  },
  {
    label: "Product OG — prod-or-pretend",
    dest: "public/og/prod-or-pretend.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Prod or", headlineAccent: "Pretend.",
    tagline: "Ein Qualitäts-Spiegel für Tech-Hype — prüft „an-einem-Wochenende-gebaut\"-Claims gegen echte Produktionsstandards.",
    chips: [
      { text: "Quality Mirror", variant: "dot" },
      { text: "Tech-Hype-Check", variant: "plain" },
      { text: "Open Standards", variant: "accent" },
    ],
  },
  {
    label: "Product OG — trustscope",
    dest: "public/og/trustscope.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Trust", headlineAccent: "Scope.",
    tagline: "Deterministischer Vier-Säulen-Trust-Report für öffentliche GitHub-Repos — Sicherheit, Governance, Community.",
    chips: [
      { text: "Trust Report", variant: "dot" },
      { text: "GitHub", variant: "plain" },
      { text: "MIT / Open Source", variant: "accent" },
    ],
  },
  {
    label: "Product OG — obsidian-vault-autopilot",
    dest: "public/og/obsidian-vault-autopilot.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Obsidian Vault", headlineAccent: "Autopilot.",
    tagline: "Open-Source-Automatisierung für Wissens-Vaults in Obsidian — sortiert, benennt, taggt und reichert Notizen an.",
    chips: [
      { text: "Claude Skill", variant: "dot" },
      { text: "Obsidian", variant: "plain" },
      { text: "Open Source", variant: "accent" },
    ],
  },
  {
    label: "Product OG — social-scrapers",
    dest: "public/og/social-scrapers.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Social", headlineAccent: "Scrapers.",
    tagline: "Obsidian-Skills für Instagram-, LinkedIn- und X-Profile — neutrale Markdown-Briefings statt Engagement-Bait.",
    chips: [
      { text: "Obsidian Skills", variant: "dot" },
      { text: "Apify + X API", variant: "plain" },
      { text: "Markdown", variant: "accent" },
    ],
  },
  {
    label: "Product OG — imap-mailbox-cleanup",
    dest: "public/og/imap-mailbox-cleanup.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "Mailbox Triage.", headlineAccent: "Dry-run first.",
    tagline: "Hybrid CLI + Claude-Skill für IONOS-IMAP-Postfach-Triage — dry-run by default, audit-logged.",
    chips: [
      { text: "CLI + Claude Skill", variant: "dot" },
      { text: "Dry-run", variant: "plain" },
      { text: "MIT / Open Source", variant: "accent" },
    ],
  },
  {
    label: "Product OG — ai-phrase-check",
    dest: "public/og/ai-phrase-check.jpg",
    width: 1200, height: 630, padding: 72, maxKB: 200,
    headline: "AI Phrase", headlineAccent: "Check.",
    tagline: "Erkennt KI-typische Floskeln in deutschem und englischem Text.",
    chips: [
      { text: "Claude Skill", variant: "dot" },
      { text: "DE + EN", variant: "plain" },
      { text: "MIT / Open Source", variant: "accent" },
    ],
  },
];
