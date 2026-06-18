import type { Metadata } from "next";
import localFont from "next/font/local";
import TrackerScript from "@/components/TrackerScript";
import { JsonLd } from "@/components/JsonLd";
import { SearchProvider } from "@/components/search/SearchProvider";
import { organizationSchema } from "@/lib/schema/organization";
import "./globals.css";

const spaceGrotesk = localFont({
  src: "../fonts/SpaceGrotesk-Variable-subset.woff2",
  variable: "--font-space-grotesk",
  display: "swap",
  weight: "400 700",
  preload: false,
});

const inter = localFont({
  src: "../fonts/Inter-Variable-subset.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "400 700",
});

export const metadata: Metadata = {
  title: "neckarshore.ai — Software Development. Closer to Home.",
  description:
    "KI-beschleunigte Softwareentwicklung aus Stuttgart. Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards — ohne Offshore-Risiko, ohne Big-4-Preise.",
  metadataBase: new URL("https://neckarshore.ai"),
  openGraph: {
    title: "neckarshore.ai — Software Development. Closer to Home.",
    description:
      "KI-beschleunigte Softwareentwicklung aus Stuttgart. Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards — Made in Germany.",
    url: "https://neckarshore.ai",
    siteName: "neckarshore.ai",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "neckarshore.ai — Software Development. Closer to Home. KI-beschleunigte Softwareentwicklung aus Stuttgart.",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "neckarshore.ai — Software Development. Closer to Home.",
    description:
      "KI-beschleunigte Softwareentwicklung aus Stuttgart. Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards — Made in Germany.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://neckarshore.ai/",
  },
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
      <body className="min-h-screen bg-neutral-light text-primary dark:bg-deep-space dark:text-text-primary">
        <JsonLd data={organizationSchema} id="schema-org" />
        <SearchProvider>{children}</SearchProvider>
        <TrackerScript />
      </body>
    </html>
  );
}
