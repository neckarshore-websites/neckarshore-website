/**
 * Brand constants — single source of truth for Omnopsis naming.
 *
 * Casing convention (R2 locked 2026-05-08, Title-Case for the brand):
 *   - PRODUCT_SHORT  = "Omnopsis"             — Title-Case for human-facing brand
 *   - PRODUCT_NAME   = "Omnopsis Documentor+X" — full product label (Documentor with `o`)
 *   - SECTION_ID     = "omnopsis"             — lowercase for HTML anchors, slugs, tracking keys
 *   - NAV_LABEL      = "Omnopsis"             — rendered in the nav
 *   - TRACK_KEY      = "nav_omnopsis"         — analytics event prefix
 *   - DAY_ONE        = 2026-03-22             — project birthday, first Claude Code session
 *
 * Why Title-Case (not all-caps): the trademark filing (DPMA) is for "Omnopsis"
 * as a Title-Case wordmark. The interim all-caps surface (April 2026) was a
 * carry-over from the prior OMNIXIS branding and has been corrected.
 *
 * Historical context: the project was originally branded OMNIXIS through
 * ~April 2026. The pre-rename screenshots in `public/images/omnixis-*.{jpg,png}`
 * keep their filenames as historical artifacts — only the rendered surfaces
 * (alt text, headings, tracking) use the current Omnopsis brand.
 *
 * If you change any value here, run:
 *   git grep -i 'omnopsis\|omnixis' -- src/ public/llms.txt e2e/
 * to confirm nothing has drifted.
 */

export const BRAND = {
  PRODUCT_NAME: "Omnopsis Documentor+X",
  PRODUCT_SHORT: "Omnopsis",
  SECTION_ID: "omnopsis",
  NAV_LABEL: "Omnopsis",
  TRACK_KEY: "nav_omnopsis",
  DAY_ONE: new Date("2026-03-22"),
} as const;

export type Brand = typeof BRAND;
