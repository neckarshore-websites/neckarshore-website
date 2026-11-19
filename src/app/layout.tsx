import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import TrackerScript from "@/components/TrackerScript";
import UmamiTracker from "@/components/UmamiTracker";
import { JsonLd } from "@/components/JsonLd";
import { SearchProvider } from "@/components/search/SearchProvider";
import { ThemeColorSync } from "@/components/ThemeColorSync";
import { organizationSchema } from "@/lib/schema/organization";
import { UMAMI_HOST, UMAMI_WEBSITE_ID } from "@/lib/umami";
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
    "KI-beschleunigte Softwareentwicklung aus Stuttgart. Gleiche Zeitzone, gleiche Sprache, DSGVO-Standard — ohne Offshore-Risiko, ohne Big-4-Preise.",
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

// Browser chrome tint: the page ground, --color-neutral-light / --color-deep-space
// in globals.css. The media tags cover the "system" setting; ThemeColorSync
// follows an explicit choice in the ThemeToggle. tests/e2e/theme-color.spec.ts
// holds the tag against the painted background.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1F5F9" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
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
        {/* Umami's before-send hook must exist before the tracker's first
            request, so it loads beforeInteractive, ahead of the tracker. */}
        {UMAMI_WEBSITE_ID ? (
          <Script src="/umami-before-send.js" strategy="beforeInteractive" />
        ) : null}
      </head>
      <body className="min-h-screen bg-neutral-light text-primary dark:bg-deep-space dark:text-text-primary">
        <JsonLd data={organizationSchema} id="schema-org" />
        <SearchProvider>{children}</SearchProvider>
        <TrackerScript />
        {/* Umami visitor counting (planning #4006 row 6): cookieless, on our
            own box, beside the own tracker above. Rendered on Vercel
            production only (src/lib/umami.ts). Query strings, screen size,
            GPC and DNT are handled by the hook loaded in <head>; DNT and the
            #fragment also natively. UmamiTracker loads the tracker only when
            that hook is present, so a failed hook request counts nothing. */}
        {UMAMI_WEBSITE_ID ? (
          <UmamiTracker host={UMAMI_HOST} websiteId={UMAMI_WEBSITE_ID} />
        ) : null}
        <ThemeColorSync />
      </body>
    </html>
  );
}
