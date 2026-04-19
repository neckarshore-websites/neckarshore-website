/**
 * Brand constants — single source of truth for OMNOPSIS naming.
 *
 * Casing convention (locked 2026-04-19, R2 of the rebranding-nachzug):
 *   - PRODUCT_SHORT  = "OMNOPSIS"             — all caps for human-facing brand
 *   - PRODUCT_NAME   = "OMNOPSIS Documentor+X" — full product label (use Documentor with `o`)
 *   - SECTION_ID     = "omnopsis"             — lowercase for HTML anchors, slugs, tracking keys
 *   - NAV_LABEL      = "OMNOPSIS"             — rendered in the nav
 *   - TRACK_KEY      = "nav_omnopsis"         — analytics event prefix
 *   - DAY_ONE        = 2026-03-22             — project birthday, first Claude Code session
 *
 * Historical context: the project was originally branded OMNIXIS through ~April 2026.
 * The pre-rename screenshots in `public/images/omnixis-*.{jpg,png}` keep their filenames
 * as historical artifacts — only the rendered surfaces (alt text, headings, tracking)
 * use the new OMNOPSIS brand.
 *
 * If you change any value here, run:
 *   git grep -i 'omnopsis\|omnixis' -- src/ public/llms.txt e2e/
 * to confirm nothing has drifted.
 */

export const BRAND = {
  PRODUCT_NAME: "OMNOPSIS Documentor+X",
  PRODUCT_SHORT: "OMNOPSIS",
  SECTION_ID: "omnopsis",
  NAV_LABEL: "OMNOPSIS",
  TRACK_KEY: "nav_omnopsis",
  DAY_ONE: new Date("2026-03-22"),
} as const;

export type Brand = typeof BRAND;
