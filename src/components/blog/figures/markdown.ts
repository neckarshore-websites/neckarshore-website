/**
 * Figure id → Markdown, for the "Als Markdown" export of a blog post.
 *
 * A figure is a React component on the page; in the exported file its marker would otherwise
 * be an empty HTML comment, and the reader's AI would lose exactly the tables the article
 * points to. These renderers read the same data as the components (teststrategie-data.ts).
 * A `Record<FigureId, …>`, so a registered id without a Markdown renderer fails the type check.
 * No React here: the export route imports this on the server.
 */
import type { FigureId } from "@/lib/content/blog-figures";
import { tableToMarkdown } from "@/lib/export/serialize";
import { REGISTER, RUNS, VOCABULARY, type Rich } from "./teststrategie-data";

export function richToMarkdown(value: Rich): string {
  return value.map((part) => (typeof part === "string" ? part : `**${part.b}**`)).join("");
}

const bold = (s: string) => `**${s}**`;

function register(): string {
  const tables = REGISTER.apps.map((a) =>
    tableToMarkdown(
      [a.app, "Stufe"],
      a.areas.map((area) => [area.detail ? `${bold(area.name)} · ${area.detail}` : bold(area.name), area.tier]),
    ),
  );
  const levels = REGISTER.levels
    .map((l, i) => `${i + 1}. ${bold(l.name)}${l.isNew ? " (neu)" : ""}: ${l.what}`)
    .join("\n");
  return [
    `### ${REGISTER.caption}`,
    bold(REGISTER.registerHeading),
    ...tables,
    richToMarkdown(REGISTER.note),
    `${bold(REGISTER.levelsHeading)} (oben zuerst)`,
    levels,
    `${REGISTER.axisBottom} · ${REGISTER.axisTop}`,
    `_${REGISTER.source}_`,
  ].join("\n\n");
}

function runs(): string {
  return [
    `### ${RUNS.caption}`,
    tableToMarkdown(
      ["#", "Testlauf", ...RUNS.columns],
      RUNS.runs.map((r, i) => [String(i + 1), bold(r.name), r.content, r.trigger, r.passed]),
    ),
  ].join("\n\n");
}

function vocabulary(): string {
  return [
    `### ${VOCABULARY.caption}`,
    VOCABULARY.lead,
    tableToMarkdown(
      [...VOCABULARY.renamedHeader],
      VOCABULARY.renamed.map((r) => [r.before, richToMarkdown(r.now)]),
    ),
    tableToMarkdown(
      [...VOCABULARY.keptHeader],
      VOCABULARY.kept.map((r) => [`${bold(r.term)}${r.isNew ? " (neu)" : ""}`, r.meaning]),
    ),
    richToMarkdown(VOCABULARY.houseTerms),
    `_${VOCABULARY.source}_`,
  ].join("\n\n");
}

export const FIGURE_MARKDOWN: Record<FigureId, () => string> = {
  "teststrategie-risikoregister": register,
  "teststrategie-testlaeufe": runs,
  "teststrategie-vokabular": vocabulary,
};

/** Replace every figure marker in a raw post body with the figure's Markdown. */
export function bodyWithFigures(body: string): string {
  return body.replace(/<!--\s*figur:\s*([a-z0-9-]+)\s*-->/g, (marker, id: string) => {
    const render = FIGURE_MARKDOWN[id as FigureId];
    if (!render) throw new Error(`[blog export] unknown figure "${id}"`);
    return render();
  });
}
