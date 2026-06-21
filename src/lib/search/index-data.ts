/**
 * Builds the full searchable document set for the Cmd+K palette.
 *
 * SERVER-ONLY: reads the glossar markdown collection via node:fs (through
 * `@/lib/content/glossar`). NEVER import this from a client component — the
 * client must import only `./types`. The force-static `/api/search-index` route
 * is the single consumer; it runs this at build time and serves the JSON from
 * the CDN, so there is no runtime compute.
 *
 * Coverage contract ("alle Seiten indiziert, nach Inhalt suchbar, Tiefe egal"):
 *   - Products  → one doc per portfolio item (live + preview skeletons + external
 *                 link-outs), derived from PORTFOLIO so a new product is indexed
 *                 automatically (AP-1). On-site search ≠ robots index: the noindex
 *                 preview skeletons ARE searchable on purpose.
 *   - Glossar   → one doc per entry, full text (definition + aliases + body prose).
 *   - Pages     → every route + the stable home sections (#services / #why-nearshore
 *                 / #founder / #faq) as deep-link docs, with curated leads mirroring
 *                 the on-page copy (no fragile JSX scraping). #open-source is NOT
 *                 indexed — it is conditionally rendered (OSS_LAUNCH_VISIBLE).
 */
import { allCategories } from "@/lib/portfolio";
import { getAllGlossarEntries, getGlossarEntry } from "@/lib/content/glossar";
import type { SearchDoc } from "./types";

/** Sanitised glossar HTML → plain search text. */
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Curated page index — every route + the stable home sections. Mirrors each page's
// real copy / metadata description so "search by content" hits without scraping JSX.
const PAGES: { id: string; title: string; text: string; category: string; url: string }[] = [
  {
    id: "page:/",
    title: "neckarshore.ai — Software Development. Closer to Home.",
    text: "KI-beschleunigte Nearshore-Softwareentwicklung aus Stuttgart. Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards — ohne Offshore-Risiko, ohne Big-4-Preise. DSGVO-by-Design, Made in Germany, AI-Powered. Neckarshore AI.",
    category: "Startseite",
    url: "/",
  },
  {
    id: "page:/#services",
    title: "Unsere Services",
    text: "AI-Powered Development, Documentation Automation, AI Consulting & Strategy, DSGVO-by-Design, Quality Engineering und Nearshore Partnership. Production-Stack: NestJS, TypeScript, PostgreSQL. BYOLLM, OWASP LLM Top 10, EU AI Act Compliance. KI-Strategie-Beratung für DACH-Unternehmen.",
    category: "Startseite",
    url: "/#services",
  },
  {
    id: "page:/#why-nearshore",
    title: "Warum Nearshore?",
    text: "Was ist Nearshore-Entwicklung? Nearshore vs. Offshore, vs. Big-4-Consultancies, vs. Freelancer. Gleiche Zeitzone, gleiche Sprache, gleiche DSGVO-Standards. Enterprise-Qualität ohne Enterprise-Preise. KI-beschleunigt, kulturelles Alignment, Stuttgart-basiert.",
    category: "Startseite",
    url: "/#why-nearshore",
  },
  {
    id: "page:/#founder",
    title: "Über uns — German Rauhut",
    text: "German Rauhut, Gründer von neckarshore.ai. Ehemaliger Mercedes-Benz IT, jetzt Gründer von Neckarshore AI in Stuttgart. Software mit KI-Beschleunigung. Ein Senior-Architekt mit einem KI-gestützten Expertensystem. Kontext ist das neue Öl.",
    category: "Startseite",
    url: "/#founder",
  },
  {
    id: "page:/#faq",
    title: "Häufige Fragen",
    text: "Was ist Omnopsis Documentor+X? Was bedeutet BYOLLM — Bring Your Own LLM? Was kostet Nearshore-Entwicklung bei neckarshore.ai? Wo sitzt neckarshore.ai — Stuttgart, Deutschland. Ist neckarshore.ai DSGVO-konform? Fail-closed: lieber schweigen als lügen.",
    category: "Startseite",
    url: "/#faq",
  },
  {
    id: "page:/products",
    title: "Produkte",
    text: "Das neckarshore.ai-Portfolio: ein Flagship (Omnopsis), mehrere Produkte mit Marktreife (MMPs), fokussierte Open-Source-Skills und Web-Präsenzen. Strukturiert gebaut — KI-beschleunigt, DSGVO-by-Design, Made in Germany.",
    category: "Seite",
    url: "/products",
  },
  {
    id: "page:/glossar",
    title: "Glossar",
    text: "Ein kuratiertes Glossar kognitiver Verzerrungen — jeder Denkfehler in einem Satz erklärt, mit Kontext und Bezug zu ClearPath, der mentalen Firewall gegen Verzerrungen.",
    category: "Seite",
    url: "/glossar",
  },
  {
    id: "page:/impressum",
    title: "Impressum",
    text: "Impressum von neckarshore.ai — German Rauhut, IT Consulting & Digital Ventures, Stuttgart. Angaben gemäß § 5 TMG.",
    category: "Seite",
    url: "/impressum",
  },
  {
    id: "page:/datenschutz",
    title: "Datenschutz",
    text: "Datenschutzerklärung von neckarshore.ai — Informationen zur Datenverarbeitung, Cookies und Ihren Rechten gemäß DSGVO.",
    category: "Seite",
    url: "/datenschutz",
  },
];

/** Build the full searchable document set across pages, products and the glossar. */
export function buildSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  // 1) Curated pages + home sections.
  for (const p of PAGES) {
    docs.push({ id: p.id, type: "page", title: p.title, text: p.text, category: p.category, url: p.url });
  }

  // 2) Products — sub-portal pages + every portfolio item (derived from PORTFOLIO).
  for (const cat of allCategories()) {
    docs.push({
      id: `page:${cat.href}`,
      type: "page",
      title: cat.title,
      text: `${cat.subtitle}. ${cat.items.map((i) => i.name).join(", ")}.`,
      category: "Produkte",
      url: cat.href,
    });
    for (const item of cat.items) {
      // Website items with a case study resolve to their INTERNAL /products/websites/<slug>
      // page (the card's primary destination) — not the external domain — so on-site search
      // opens the case study, with the live site one click further. Items without a case
      // study keep their href (internal detail page, or an external link-out).
      const url = item.caseStudySlug
        ? `/products/websites/${item.caseStudySlug}`
        : item.href;
      const isExternalLink = item.isExternal && !item.caseStudySlug;
      docs.push({
        id: `product:${cat.id}:${item.slug}`,
        type: "product",
        title: item.name,
        text: item.tagline,
        category: cat.title,
        url,
        ...(isExternalLink ? { external: true } : {}),
      });
    }
  }

  // 3) Glossar — full text (definition + aliases + body prose).
  for (const meta of getAllGlossarEntries()) {
    const entry = getGlossarEntry(meta.slug);
    const body = entry ? htmlToText(entry.bodyHtml) : "";
    docs.push({
      id: `glossar:${meta.slug}`,
      type: "glossar",
      title: meta.term,
      text: [meta.definition, meta.aliases, body].filter(Boolean).join(" "),
      category: "Glossar",
      url: `/glossar/${meta.slug}`,
    });
  }

  return docs;
}
