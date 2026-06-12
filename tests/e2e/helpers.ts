// Shared constants and utilities for E2E tests

/** All public pages on the site */
export const PAGES = ["/", "/impressum", "/datenschutz"] as const;

/** Data-driven viewports from StatCounter Germany Feb 2026 */
export const VIEWPORTS = [
  { name: "iPhone 15 Pro", width: 393, height: 852 },
  { name: "iPhone 14 Plus", width: 414, height: 896 },
  { name: "iPad Mini", width: 768, height: 1024 },
] as const;

/** Homepage anchor sections */
export const SECTIONS = ["services", "why-nearshore", "omnopsis", "founder"] as const;

/** Calendly booking URL */
export const CALENDLY_URL = "https://calendly.com/rauhut/20min";

/** Scroll/navigation timeout */
export const SCROLL_TIMEOUT = 5000;

/** WCAG AA minimum contrast ratio for normal text */
export const WCAG_AA_RATIO = 4.5;

// --- WCAG contrast utilities ---

function parseRgb(rgb: string): [number, number, number] {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

function luminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Calculate WCAG 2.1 contrast ratio between two rgb() color strings */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(parseRgb(fg));
  const l2 = luminance(parseRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

