/**
 * DefinedTerm JSON-LD for glossary entries.
 *
 * Each entry is a citable term in the neckarshore glossary term-set. `description` is
 * the one-sentence definition (the GEO-citable passage); `inDefinedTermSet` links the
 * term back to the glossary index so the entries form a recognised set, not orphans.
 */
const BASE_URL = "https://neckarshore.ai";

interface DefinedTermInput {
  term: string;
  definition: string;
  slug: string;
}

export function definedTermSchema({ term, definition, slug }: DefinedTermInput) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term,
    description: definition,
    url: `${BASE_URL}/glossar/${slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "neckarshore Glossar — Kognitive Verzerrungen",
      url: `${BASE_URL}/glossar`,
    },
  } as const;
}
