/**
 * Per-product extra export sections — the structured, page-specific blocks that aren't
 * in the Markdown body or the FAQ (PER-REPO part).
 *
 * Today: the ClearPath "Die wichtigsten Denkfehler" table (rendered as JSX on the page
 * from CLEARPATH_BIASES). The export must carry these tables too — so each lives here as
 * a slug-keyed entry that serializes its data source to a Markdown table. Adding the next
 * product table is one entry, no changes to the builder (AP-1: add, don't replace).
 *
 * Lazy thunks so importing this module doesn't eagerly build every table.
 */
import { CLEARPATH_BIASES } from "@/lib/clearpath-biases";
import { tableToMarkdown, type ExportSection } from "./serialize";

const SECTIONS: Record<string, () => ExportSection[]> = {
  clearpath: () => [
    {
      heading: "Die wichtigsten Denkfehler",
      body: tableToMarkdown(
        ["Denkfehler", "In einem Satz", "Mehr"],
        CLEARPATH_BIASES.map((bias) => [
          `${bias.term} (${bias.alias})`,
          bias.definition,
          `[Wikipedia ↗](${bias.wikipediaUrl})`,
        ]),
      ),
    },
  ],
};

/** Extra structured sections (e.g. data-driven tables) for a product slug, or `[]`. */
export function extraSectionsForSlug(slug: string): ExportSection[] {
  return SECTIONS[slug]?.() ?? [];
}
