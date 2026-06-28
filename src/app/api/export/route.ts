import { resolveExport } from "@/lib/export/resolve";
import { SITE_URL } from "@/lib/site-config";

/**
 * GET /api/export?path=/products/<slug>
 *
 * Serves the CLEAN SOURCE markdown of an exportable content page as a downloadable
 * `.md` file (Content-Disposition: attachment). Download-only by design — the export
 * button is a plain server-rendered `<a download>`, so this feature ships ZERO client JS.
 *
 *   200 → text/markdown attachment
 *   404 → `path` is not an exportable content page (no .md source)
 *   400 → malformed `path` param
 *
 * The exportable set is decided by resolveExport(); the product slug charset is locked
 * to [a-z0-9-], which also closes path traversal.
 */
export async function GET(request: Request): Promise<Response> {
  const path = new URL(request.url).searchParams.get("path") ?? "";

  // Must be an internal absolute path; reject anything else before touching the resolver.
  if (!path.startsWith("/")) {
    return Response.json({ error: "invalid path" }, { status: 400 });
  }

  const exportedAt = new Date().toISOString().slice(0, 10);
  const result = resolveExport(path, { baseUrl: SITE_URL, exportedAt });

  if (!result) {
    return Response.json({ error: "not exportable" }, { status: 404 });
  }

  return new Response(result.markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      // Source content is build-static (changes only on deploy) — safe to cache briefly.
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
