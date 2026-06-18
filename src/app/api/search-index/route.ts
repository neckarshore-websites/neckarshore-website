import { buildSearchDocs } from "@/lib/search/index-data";

// Statically generated at build time → served from the CDN, fetched lazily by the
// search overlay on first open. No runtime compute, no cookies, no external service.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchDocs());
}
