/**
 * Markdown-export serializer — the content-agnostic CORE of the page-export feature.
 *
 * This module knows nothing about products, blog posts, or any site: it turns a
 * structured input (frontmatter fields + title + lead + raw body + extra sections)
 * into a single, well-formed Markdown document with a self-describing YAML header.
 *
 * It is the piece meant to be COPIED VERBATIM across the sibling website repos so the
 * exported `.md` format stays identical everywhere (Obsidian- and LLM-friendly). The
 * per-repo wiring (which loader, which content dir) lives in builders/ + resolve.ts.
 */

export interface ExportSection {
  /** Section heading, rendered as an H2. */
  heading: string;
  /** Markdown body of the section (e.g. the FAQ rendered by faqToMarkdown). */
  body: string;
}

export interface MarkdownDocumentInput {
  /** Ordered key/value pairs for the YAML frontmatter header. Insertion order is preserved. */
  frontmatter: Record<string, string>;
  /** The document H1. */
  title: string;
  /** Optional lead/summary, rendered as a blockquote under the H1. Omitted when empty. */
  lead?: string;
  /** Raw Markdown body (1:1 from the source file). */
  body: string;
  /** Extra trailing sections (e.g. the data-driven FAQ). */
  sections?: ExportSection[];
}

/** Double-quote a YAML scalar, escaping backslashes and quotes so any value is safe. */
function quoteYaml(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Render an ordered map of fields as a fenced YAML frontmatter block (no trailing newline). */
function yamlFrontmatter(fields: Record<string, string>): string {
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${quoteYaml(value)}`);
  return `---\n${lines.join("\n")}\n---`;
}

/** Render FAQ Q&A pairs as Markdown: each question an H3, the answer the paragraph below. */
export function faqToMarkdown(items: { q: string; a: string }[]): string {
  return items.map((item) => `### ${item.q}\n\n${item.a}`).join("\n\n");
}

/** Escape a single GFM table cell: collapse newlines, escape the pipe, trim. */
function escapeCell(cell: string): string {
  return cell.replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

/** Render a GFM (pipe) table from a header row and data rows. */
export function tableToMarkdown(headers: string[], rows: string[][]): string {
  const headerLine = `| ${headers.map(escapeCell).join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const bodyLines = rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`);
  return [headerLine, separator, ...bodyLines].join("\n");
}

/** Assemble a complete Markdown document from structured input. Ends with a single newline. */
export function buildMarkdownDocument(input: MarkdownDocumentInput): string {
  const parts: string[] = [yamlFrontmatter(input.frontmatter), `# ${input.title}`];

  if (input.lead && input.lead.trim()) parts.push(`> ${input.lead.trim()}`);

  const body = input.body.trim();
  if (body) parts.push(body);

  for (const section of input.sections ?? []) {
    parts.push(`## ${section.heading}\n\n${section.body}`);
  }

  return parts.join("\n\n") + "\n";
}
