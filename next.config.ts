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
const securityHeaders = [
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
