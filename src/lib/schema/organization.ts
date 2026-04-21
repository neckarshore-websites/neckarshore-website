/**
 * Schema.org JSON-LD graph for neckarshore.ai
 *
 * Structure (per seo-schema audit 2026-04-10):
 * - Organization + ProfessionalService (merged @type) — primary entity
 * - Person (founder, standalone node with own sameAs)
 * - WebSite — for sitelinks search box eligibility
 * - WebPage — root page, references Organization + Person
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
const ORG_ID = `${BASE_URL}/#organization`;
const PERSON_ID = `${BASE_URL}/#founder`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const WEBPAGE_ID = `${BASE_URL}/#webpage`;

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
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: `${BASE_URL}/`,
      name: "neckarshore.ai — Software Development. Closer to Home.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon.svg`,
      },
      inLanguage: "de-DE",
    },
  ],
} as const;

export type OrganizationSchema = typeof organizationSchema;
