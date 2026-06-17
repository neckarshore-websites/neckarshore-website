/**
 * Markdown → safe HTML — ported from the oakwoodgolfclub-website blog pipeline.
 *
 * marked (parse) → sanitize-html (allow-list). Content is repo-controlled and rendered
 * at build time; the sanitiser is defence-in-depth against a `</script>`-style breakout
 * surviving into the static HTML, and it normalises external links to safe rel attrs.
 */
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "h1",
  "h2",
  "figure",
  "figcaption",
];

/** Render a Markdown string to sanitised HTML (synchronous, build-time). */
export function renderMarkdown(md: string): string {
  const dirty = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      "*": ["class"],
    },
    // External links open in a new tab with safe rel; internal links are left intact.
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: isExternal
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : attribs,
        };
      },
    },
  });
}
