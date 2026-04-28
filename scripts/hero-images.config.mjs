/**
 * Hero Images — Config
 *
 * GitHub repo hero images for the Obsidian Social-Scrapers family
 * (Linus L18a/b/c). Spec: ../docs/specs/linus-hero-images-social-scrapers.md
 * (mirror in omnopsis-planning).
 *
 * Format: 1280×640 PNG, ≤500 KB each.
 *
 * Two layout modes:
 *   - "platform-bridge": split composition (left: stylized profile-card hint,
 *     right: markdown-note stack, middle: bridge-element). Used for IG + LinkedIn.
 *   - "library-banner": center-composed module-blocks → central hub → 3 outflows.
 *     Used for Common-Lib (architecturally-toned).
 *
 * Run: node scripts/generate-hero-image.mjs
 */

export const heroes = [
  // ─── L18c — Common-Lib Banner (build first per spec § 7c — establishes Visual DNA) ───
  {
    label: "Hero — obsidian-social-scrapers-common",
    dest: "docs/branding/heroes/obsidian-social-scrapers-common.png",
    width: 1280,
    height: 640,
    maxKB: 500,
    layout: "library-banner",
    title: "obsidian-social-scrapers-common",
    subtitle: "Shared utilities for the Obsidian social-scrapers family",
    tagline: "Part of neckarshore-ai",
    // Library-Banner-specifics:
    backgroundIntensity: "deep", // darker than platform-bridge variants
    centralSymbol: "hub", // central diamond/hub
    moduleBlocks: 4, // count of "module" lego-style blocks feeding into the hub
    outflows: 3, // outflows from central symbol — IG / LinkedIn / X-abstract
  },

  // ─── L18a — Instagram-Scraper Hero ───
  {
    label: "Hero — obsidian-instagram-scraper",
    dest: "docs/branding/heroes/obsidian-instagram-scraper.png",
    width: 1280,
    height: 640,
    maxKB: 500,
    layout: "platform-bridge",
    title: "obsidian-instagram-scraper",
    subtitle: "Personal research toolkit",
    tagline: "Part of neckarshore-ai",
    // Platform-Bridge-specifics:
    backgroundIntensity: "mid", // mid-bright, user-facing
    profileCardShape: "ig-grid", // 3×3 square grid (IG feed-style)
    bridgeStyle: "particle-stream", // organic dots on a curve
  },

  // ─── L18b — LinkedIn-Scraper Hero ───
  {
    label: "Hero — obsidian-linkedin-scraper",
    dest: "docs/branding/heroes/obsidian-linkedin-scraper.png",
    width: 1280,
    height: 640,
    maxKB: 500,
    layout: "platform-bridge",
    title: "obsidian-linkedin-scraper",
    subtitle: "Personal research toolkit",
    tagline: "Part of neckarshore-ai",
    // Platform-Bridge-specifics:
    backgroundIntensity: "mid", // mid-bright, user-facing
    profileCardShape: "linkedin-banner", // horizontal-banner + post-excerpt cards
    bridgeStyle: "tabular-rows", // structured, business-meets-tech
  },
];
