import { Download } from "lucide-react";

/**
 * "Als Markdown" export action.
 *
 * A plain server-rendered `<a download>` pointing at the /api/export endpoint, which
 * returns the page's clean source markdown as a downloadable `.md` file. No client
 * component, no JS — it stays a link, so it costs nothing on the Lighthouse budget.
 *
 * Rendered only on pages that have an exportable source (product detail pages); the
 * endpoint 404s for anything resolveExport() doesn't recognise.
 */
export function ExportButton({ path, className }: { path: string; className?: string }) {
  const href = `/api/export?path=${encodeURIComponent(path)}`;

  return (
    <a
      href={href}
      download
      data-track="export_markdown"
      aria-label="Seiteninhalt als Markdown-Datei herunterladen"
      title="Seiteninhalt als Markdown-Datei herunterladen"
      className={`inline-flex items-center gap-1.5 rounded-lg border border-primary/15 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent dark:border-text-secondary/20 dark:text-text-tertiary dark:hover:border-accent/50 dark:hover:text-accent${
        className ? ` ${className}` : ""
      }`}
    >
      <Download size={15} aria-hidden="true" />
      Als Markdown
    </a>
  );
}
