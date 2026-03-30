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
      <body className="min-h-screen bg-neutral-light text-primary">
        {children}
      </body>
    </html>
  );
}
