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

  // ─── GitHub Repo Card: OMNIXIS (core product) ───
  // Blocked on MASCHIN positioning brief — see docs/branding/positioning-request-maschin.md
  {
    label: "GitHub Repo Card — OMNIXIS",
    dest: "docs/branding/github-social-preview-omnixis.jpg",
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
