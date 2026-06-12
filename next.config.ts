import type { NextConfig } from "next";

// OWASP-baseline security headers — parity with oakwoodgolfclub-website.
// Applied globally to every route via async headers(). Per Linus Bundle-A
// Plan-Doc 2026-05-21 § Work-Item 2.
//
// HSTS is intentionally omitted here: Vercel auto-emits
// `strict-transport-security: max-age=63072000` for verified custom domains
// (R2-verified 2026-05-25). Adding it twice would double-set the header.
//
// X-Frame-Options=SAMEORIGIN (not DENY as oakwood ships): marketing-landing-page
// posture per Plan-Doc rationale — allows same-domain embedding if a future
// preview/about route needs it, still blocks cross-origin clickjacking.
//
// Content-Security-Policy strategy (Linus 2026-06-07, L-RH-CSP-PER-SITE):
// Pragmatic policy for a static marketing landing page with no auth, no
// user accounts, and no user-generated content — so the residual XSS surface
// that `'unsafe-inline'` leaves open is minimal (there is no place to inject
// attacker content into the page).
//   - script-src 'unsafe-inline': REQUIRED, not optional. Next.js App Router
//     injects its own inline hydration/RSC bootstrap scripts
//     (`self.__next_f.push(...)`); the JSON-LD in JsonLd.tsx + page.tsx also
//     renders as inline <script>. A nonce-based strict CSP would need
//     middleware and would opt every route OUT of static generation —
//     directly sacrificing the Lighthouse-100 static-first posture this site
//     exists for. Deliberate trade: keep static + Lighthouse, land ~A (not
//     A+) on Mozilla Observatory.
//   - style-src 'unsafe-inline': Next.js + React inline style props.
//   - connect-src 'self': the custom analytics tracker (TrackerScript.tsx)
//     posts via navigator.sendBeacon to the same-origin /api/track — no
//     external analytics host (verified: no @vercel/analytics dependency).
//   - frame-ancestors 'self': mirrors X-Frame-Options=SAMEORIGIN above
//     (goldoni uses 'none'/DENY; neckarshore keeps the same-origin posture).
//   - Calendly CTA is a plain redirect <a href>, NOT an embedded widget, so
//     it needs no script-src/frame-src allowance. If a future change embeds
//     the Calendly popup/iframe, extend script-src + frame-src here.
// Development needs `'unsafe-eval'` because React's dev build + Next.js HMR
// use eval() for fast-refresh and debugging (callstack reconstruction). React
// NEVER uses eval() in production, so the production policy below omits it —
// keeping the live header strict. Without this dev-only carve-out, `next dev`
// (and the Playwright e2e suite, which runs against the dev server) throws
// "eval() is not supported" console errors under the CSP.
// Cloudflare Turnstile (Spam-Schutz des Kontaktformulars, dormant bis zur
// Aktivierung): das Widget-Script + der Challenge-iframe + die siteverify-
// Fetches laufen gegen https://challenges.cloudflare.com → freigegeben in
// script-src + frame-src + connect-src.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
  : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Bundle-size guard: ensure modular per-icon imports for `lucide-react`.
  // Named imports (e.g. `import { Moon } from "lucide-react"`) are already
  // tree-shakeable; this pins the behaviour against future Next defaults.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Canonical host enforcement: www → apex (308 permanent).
  // Activates automatically once DNS is set up for www.neckarshore.ai.
  // Goal: kill duplicate-host SEO risk (per seo-technical audit 2026-04-10).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.neckarshore.ai" }],
        destination: "https://neckarshore.ai/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
