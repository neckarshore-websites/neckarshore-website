import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
