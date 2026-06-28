# Backlog — neckarshore-website

Website-local quick-capture for out-of-scope ideas. The next session picks from the top
(P1 first). Completed items get struck through (`~~…~~`). Planning-estate items also flow
to MASCHIN via the session report (`FOR MASCHIN`); this file is the lightweight, repo-local list.

| # | Prio | Item | Notes |
|---|------|------|-------|
| 1 | P1 | **Markdown-Export: Dateiname mit Site-URL** — Founder request 2026-06-28. Der Export-Download soll die Site-URL im Dateinamen tragen: `neckarshore.ai - clearpath.md` statt `clearpath.md`. Falls der Punkt in `.ai` irgendwo Probleme macht (z.B. als vermeintliche Doppel-Endung), den Punkt durch einen Hyphen ersetzen → `neckarshore-ai - clearpath.md`. | Filename wird in `src/lib/export/builders/product.ts` gesetzt (`filename: \`${slug}.md\``) und im `Content-Disposition`-Header von `src/app/api/export/route.ts` verwendet. `SITE_NAME`/`SITE_URL` ist im Builder bereits vorhanden. Spaces im Disposition-Filename sind schon doppelt-gequotet → ok. **Gilt auch für den OGC-Port** (#2) → dort dieselbe Konvention. Test: TC-EXP-002 (Disposition-Filename) anpassen + ein Unit-Test auf den Builder-Filename. |
| 2 | P2 | **Markdown-Export auf Schwester-Sites portieren (OGC zuerst)** — Blog-Extraktion auf oakwoodgolfclub-website. | Generischen Kern (`serialize.ts`) verbatim kopieren; `builders/blog.ts` (`content/blog/*.md`) + `/blog/<slug>`-Resolver + `ExportButton` im Blog-Post-Template + `outputFileTracingIncludes` für `content/blog`. Schritt-für-Schritt-Guide in `docs/superpowers/specs/2026-06-28-markdown-export-design.md`. |
