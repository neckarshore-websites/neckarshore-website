/**
 * Prose — renders build-time-sanitised Markdown HTML.
 *
 * `html` is produced exclusively by `renderMarkdown()` (marked + sanitize-html) from
 * repo-controlled content, never from runtime/user input. Styling is hand-written in
 * `globals.css` under `.prose-content` (no @tailwindcss/typography — keeps the bundle lean).
 */
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-content"
      // Sanitised at build time by renderMarkdown() — see component docblock.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
