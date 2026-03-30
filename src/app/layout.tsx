import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const spaceGrotesk = localFont({
  src: "../fonts/SpaceGrotesk-Variable.woff2",
  variable: "--font-space-grotesk",
  display: "swap",
  weight: "300 700",
});

const inter = localFont({
  src: "../fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "neckarshore.ai — Software Development. Closer to Home.",
  description:
    "KI-beschleunigte Softwareentwicklung aus Stuttgart. Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards — ohne Offshore-Risiko, ohne Big-4-Preise.",
  metadataBase: new URL("https://neckarshore.ai"),
  openGraph: {
    title: "neckarshore.ai — Software Development. Closer to Home.",
    description:
      "KI-beschleunigte Softwareentwicklung aus Stuttgart. DSGVO-by-Design, Made in Germany, AI-Powered.",
    url: "https://neckarshore.ai",
    siteName: "neckarshore.ai",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "neckarshore.ai — Software Development. Closer to Home.",
    description:
      "KI-beschleunigte Softwareentwicklung aus Stuttgart. DSGVO-by-Design, Made in Germany, AI-Powered.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://neckarshore.ai",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://neckarshore.ai/#organization",
      name: "neckarshore.ai",
      legalName: "German Rauhut — IT Consulting & Digital Ventures",
      url: "https://neckarshore.ai",
      logo: "https://neckarshore.ai/icon.svg",
      description:
        "KI-beschleunigte Softwareentwicklung und Documentation Automation aus Stuttgart. Nearshore AI & Software Development — Made in Germany.",
      foundingDate: "2026",
      founder: {
        "@type": "Person",
        name: "German Rauhut",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rotebühlstraße 176",
        addressLocality: "Stuttgart",
        postalCode: "70197",
        addressCountry: "DE",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "info@neckarshore.ai",
        telephone: "+49-160-385-9135",
        contactType: "sales",
        availableLanguage: ["German", "English"],
      },
      sameAs: [],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://neckarshore.ai/#localbusiness",
      name: "neckarshore.ai",
      image: "https://neckarshore.ai/icon.svg",
      url: "https://neckarshore.ai",
      telephone: "+49-160-385-9135",
      email: "info@neckarshore.ai",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rotebühlstraße 176",
        addressLocality: "Stuttgart",
        postalCode: "70197",
        addressRegion: "Baden-Württemberg",
        addressCountry: "DE",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 48.7739,
        longitude: 9.1649,
      },
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 48.7739,
          longitude: 9.1649,
        },
        geoRadius: "500 km",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://neckarshore.ai/#website",
      url: "https://neckarshore.ai",
      name: "neckarshore.ai",
      publisher: { "@id": "https://neckarshore.ai/#organization" },
      inLanguage: "de-DE",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          // Safe: static JSON-LD constant, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-neutral-light text-primary">
        {children}
      </body>
    </html>
  );
}
