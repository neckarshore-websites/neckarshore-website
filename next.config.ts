import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle-size guard: ensure modular per-icon imports for `lucide-react`.
  // Named imports (e.g. `import { Moon } from "lucide-react"`) are already
  // tree-shakeable; this pins the behaviour against future Next defaults.
  experimental: {
    optimizePackageImports: ["lucide-react"],
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
