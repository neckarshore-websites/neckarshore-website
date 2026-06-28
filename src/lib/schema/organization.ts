/**
 * Schema.org JSON-LD graph for neckarshore.ai
 *
 * Structure (per seo-schema audit 2026-04-10; WebPage split out 2026-06-28):
 * - Organization + ProfessionalService (merged @type) — primary entity
 * - Person (founder, standalone node with own sameAs)
 * - WebSite — for sitelinks search box eligibility
 *
 * The WebPage node is NO LONGER here — it is emitted PER-ROUTE via <PageSchema>
 * (lib/schema/webpage.ts) so each page carries its own canonical WebPage @id instead of
 * the homepage-pinned one this @graph used to ship on every route.
 *
 * All nodes use @id references for entity graph consolidation.
 * This is the single source of truth for brand identity signals to Google.
 *
 * Verified values (2026-04-10):
 * - legalName, address, phone: src/app/impressum/page.tsx
 * - LinkedIn Company: https://www.linkedin.com/company/neckarshore/
 * - GitHub Org: https://github.com/neckarshore-ai
 * - LinkedIn Personal: https://www.linkedin.com/in/german-rauhut/
 * - GitHub Personal: https://github.com/GmanFooFoo
 * - foundingDate: 2025 (Gewerbeanmeldung 2025-11-01, idea seeded early 2025)
 */

const BASE_URL = "https://neckarshore.ai";
// ORG_ID + WEBSITE_ID are exported as the cross-block brand-identity anchors: every
// per-route WebPage (lib/schema/webpage.ts) references them via `about`/`isPartOf`.
// These two are the ONE accepted cross-`<script>`-block reference class (AD per
// L-NECK-ENTITY-WEBPAGE-ID 3d) — the route-invariant Organization/Person/WebSite stay here.
export const ORG_ID = `${BASE_URL}/#organization`;
const PERSON_ID = `${BASE_URL}/#founder`;
export const WEBSITE_ID = `${BASE_URL}/#website`;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": ORG_ID,
      name: "neckarshore.ai",
      alternateName: "Neckarshore AI",
      legalName: "German Rauhut — IT Consulting & Digital Ventures",
      url: `${BASE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon.svg`,
        contentUrl: `${BASE_URL}/icon.svg`,
      },
      image: `${BASE_URL}/icon.svg`,
      description:
        "KI-beschleunigte Softwareentwicklung und Documentation Automation aus Stuttgart. Nearshore AI & Software Development — Made in Germany.",
      slogan: "Software Development. Closer to Home.",
      foundingDate: "2025",
      founder: { "@id": PERSON_ID },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rotebühlstraße 176",
        addressLocality: "Stuttgart",
        postalCode: "70197",
        addressRegion: "Baden-Württemberg",
        addressCountry: "DE",
      },
      areaServed: [
        { "@type": "Country", name: "Germany" },
        { "@type": "Country", name: "Austria" },
        { "@type": "Country", name: "Switzerland" },
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "info@neckarshore.ai",
          telephone: "+49-160-385-9135",
          availableLanguage: ["German", "English"],
          areaServed: ["DE", "AT", "CH"],
        },
      ],
      knowsLanguage: ["de", "en"],
      priceRange: "$$",
      sameAs: [
        "https://www.linkedin.com/company/neckarshore/",
        "https://github.com/neckarshore-ai",
        "https://www.google.com/maps?cid=7274492185454983746",
      ],
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "German Rauhut",
      givenName: "German",
      familyName: "Rauhut",
      jobTitle: "Founder",
      worksFor: { "@id": ORG_ID },
      url: `${BASE_URL}/`,
      sameAs: [
        "https://www.linkedin.com/in/german-rauhut/",
        "https://github.com/GmanFooFoo",
      ],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${BASE_URL}/`,
      name: "neckarshore.ai",
      description:
        "KI-beschleunigte Softwareentwicklung aus Stuttgart. DSGVO-by-Design, Made in Germany.",
      publisher: { "@id": ORG_ID },
      inLanguage: "de-DE",
    },
    // NOTE: the WebPage node moved OUT of this route-invariant @graph (it was homepage-pinned
    // and shipped on every route). It is now emitted per-route via <PageSchema> →
    // lib/schema/webpage.ts, so each page asserts its own canonical WebPage @id.
  ],
} as const;

export type OrganizationSchema = typeof organizationSchema;
