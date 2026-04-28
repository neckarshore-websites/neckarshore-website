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
      "Apify-powered Obsidian skill for Instagram profiles and Reels. Reels transcribed locally via whisper.cpp, posts polished into neutral Markdown briefings by Anthropic Haiku.",
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
      "Apify-powered Obsidian skill for LinkedIn profiles and posts. Output: neutral Markdown briefings polished by Anthropic Haiku — no engagement-bait formatting.",
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
      "Obsidian skill for X profiles and threads via the official X API. Output: neutral Markdown briefings polished by Anthropic Haiku — ToS-compliant, no third-party scraping.",
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
      "Shared TypeScript utilities for the Obsidian social-scraper family — Apify wrappers, Haiku polishing, Markdown rendering. Lego blocks, no duplication.",
    chips: [
      { text: "TypeScript", variant: "dot" },
      { text: "Shared Lib", variant: "plain" },
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
];
