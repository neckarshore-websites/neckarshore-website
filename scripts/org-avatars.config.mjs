/**
 * GitHub Org Avatars — Config
 *
 * One transparent 512×512 PNG per neckarshore GitHub organization. All share the
 * N-monogram (Logo 8) as family DNA; child orgs carry a color-coded corner badge
 * (color + letter). The parent org `neckarshore-ai` stays badge-free = mothership.
 *
 * Design rationale & decision (Variante A) lives in docs/branding/README.md
 * ("Org Avatars" section). Layout/geometry is fixed in DESIGN below; this file
 * only varies which orgs exist and their badge letter + color.
 *
 * To add an org:
 *   1. Copy an entry below, set `key`, `letter`, `color`.
 *   2. Run `node scripts/generate-org-avatars.mjs`.
 *   3. Eyeball the output in public/images/brand/org-avatars/.
 *
 * Base image: public/images/brand/neckarshore-icon-base.png (Logo 8, 183px raster).
 * Swap this for a high-res / SVG export once the designer delivers — geometry stays.
 */

export const DESIGN = {
  canvas: 512, // GitHub recommends ~500×500, square, <1MB (PNG keeps transparency)
  icon: 468, // monogram tile size — leaves ~4% transparent safe-area each side
  pad: 22, // (canvas - icon) / 2
  iconRadius: "22%", // squircle rounding of the monogram tile
  squircleBg: "#1B2934", // monogram tile fill (sampled from Logo 8)
  badge: 224, // larger badge (v3) — overlaps well into the N by design
  badgeRadius: "27%",
  badgeOffset: 41, // right & bottom inset of badge from canvas edge
  ring: 10, // navy separator ring around the badge (box-shadow)
  letterSize: 125, // Space Grotesk badge letter (px)
  letterWeight: 700,
  baseImage: "public/images/brand/neckarshore-icon-base.png",
  outDir: "public/images/brand/org-avatars",
};

export const orgs = [
  { key: "ai", letter: null, color: null }, // parent — no badge
  { key: "websites", letter: "W", color: "#00B8D4" }, // Teal (in-palette accent)
  { key: "agents", letter: "A", color: "#6366F1" }, // Indigo
  { key: "mmps", letter: "M", color: "#F59E0B" }, // Amber
  { key: "skills", letter: "S", color: "#10B981" }, // Emerald (in-palette success)
  // Flagship product org (OMNOPSIS.AI) — same N-monogram system, distinct badge color
  { key: "omnopsis", letter: "O", color: "#F43F5E" }, // Rose (picked 2026-06-05)
];
