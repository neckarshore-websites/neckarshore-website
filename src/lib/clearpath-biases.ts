/**
 * The cognitive biases ClearPath guards against — rendered as a lean table on the
 * ClearPath product page (/products/clearpath).
 *
 * Consolidated here 2026-06-23 when the standalone /glossar surface was retired:
 * a glossary of cognitive biases is ClearPath's domain, not neckarshore.ai's
 * corporate-site topic. So the bias content lives with the product, and each term
 * links out to its authoritative German Wikipedia article instead of a bespoke
 * neckarshore page. ClearPath addresses the well-known set of ~52 thinking errors;
 * this is the lean first selection, expandable one row at a time.
 *
 * `definition` is the one-sentence citable lead carried over VERBATIM from the
 * retired glossar entries (no editorial trimming — the secured content). The
 * Wikipedia URLs are HTTP-200-verified (2026-06-23): note the Überlebenden-
 * Verzerrung article lives under the English lemma `Survivorship_Bias` on de.wp
 * (the German term redirects to a 404), so it points there deliberately.
 */
export interface ClearPathBias {
  /** German term — the table row heading. */
  term: string;
  /** English alias, e.g. "Confirmation Bias". */
  alias: string;
  /** One-sentence, self-contained explanation — the citable unit. */
  definition: string;
  /** Authoritative German Wikipedia article (HTTP-200-verified). */
  wikipediaUrl: string;
}

export const CLEARPATH_BIASES: ClearPathBias[] = [
  {
    term: "Bestätigungsfehler",
    alias: "Confirmation Bias",
    definition:
      "Der Bestätigungsfehler ist die Neigung, Informationen so zu suchen, zu deuten und zu erinnern, dass sie die eigene bestehende Überzeugung stützen — und Gegenbelege auszublenden.",
    wikipediaUrl: "https://de.wikipedia.org/wiki/Bestätigungsfehler",
  },
  {
    term: "Überlebenden-Verzerrung",
    alias: "Survivorship Bias",
    definition:
      "Die Überlebenden-Verzerrung ist der Denkfehler, nur die sichtbaren Erfolge zu betrachten und die gescheiterten Fälle zu übersehen, die es gar nicht erst in die Statistik geschafft haben.",
    wikipediaUrl: "https://de.wikipedia.org/wiki/Survivorship_Bias",
  },
  {
    term: "Versunkene-Kosten-Falle",
    alias: "Sunk-Cost Fallacy",
    definition:
      "Die Versunkene-Kosten-Falle ist die Neigung, an einer Sache festzuhalten, weil man bereits Zeit, Geld oder Mühe investiert hat — obwohl der Blick allein nach vorn den Abbruch nahelegt.",
    wikipediaUrl: "https://de.wikipedia.org/wiki/Versunkene_Kosten",
  },
];
