import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ImageModal from "@/components/ImageModal";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { BRAND } from "@/lib/brand";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

const DEFINITION =
  "Omnopsis ist unsere KI-first Documentation Engine: Sie zieht automatisch aus Git, Jira und Confluence und generiert Compliance-Doku, technische Doku und rollenbasierte Chatbot-Antworten — fail-closed, also lieber schweigend als falsch.";

export const metadata: Metadata = pageMetadata({
  title: `${BRAND.PRODUCT_NAME} — KI-first Documentation Engine | neckarshore.ai`,
  description: DEFINITION,
  path: "/products/omnopsis",
});

// Commercial product, in development — a valid SoftwareApplication entity without
// a free Offer or a live URL (both would be false claims pre-launch).
const omnopsisSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.PRODUCT_NAME,
  description: DEFINITION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  author: { "@type": "Organization", name: "neckarshore.ai" },
} as const;

export default function OmnopsisPage() {
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd data={omnopsisSchema} id="schema-softwareapplication-omnopsis" />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <nav
          aria-label="Brotkrumen"
          className="mb-8 text-sm text-muted dark:text-text-secondary/60"
        >
          <Link href="/" className="transition-colors hover:text-accent">
            Start
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link href="/products" className="transition-colors hover:text-accent">
            Produkte
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-primary/70 dark:text-text-secondary">{BRAND.PRODUCT_SHORT}</span>
        </nav>

        <article>
          <header className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Unser Flaggschiff
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-accent md:text-5xl">
              {BRAND.PRODUCT_NAME}
            </h1>
          </header>

          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">
            {DEFINITION}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-sm font-medium text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            In Entwicklung · MVP Q2 2026 · Live Q3 2026
          </div>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Das Problem
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Niemand will Dokumentation schreiben — aber alle vermissen sie, wenn sie fehlt.
              Doku veraltet schneller, als sie entsteht, und im Compliance-Fall ist genau die
              Lücke teuer, die niemand gepflegt hat.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Wie es funktioniert
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Omnopsis zieht automatisch aus euren Quellen — Git, Jira, Confluence — und generiert
              daraus Compliance-Doku, technische Doku und rollenbasierte Chatbot-Antworten. Jede
              Aussage wird gegen die Evidenz in euren Systemen geprüft, bevor sie ausgegeben wird.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              BYOLLM &amp; Fail-closed
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              <strong className="font-semibold text-primary dark:text-text-primary">
                Bring Your Own LLM:
              </strong>{" "}
              Ihr entscheidet, welches Modell läuft — Claude, GPT-4, Gemini oder ein lokales
              Open-Source-Modell. Eure Daten verlassen eure Infrastruktur nie, DSGVO-konform by
              default, ohne Vendor-Lock-in.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              <strong className="font-semibold text-primary dark:text-text-primary">
                Fail-closed:
              </strong>{" "}
              Wenn die Evidenz schwach ist, verweigert das System die Antwort — lieber schweigen
              als lügen.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Herkunft &amp; Roadmap
            </h2>
            <p className="mt-3 font-mono text-sm leading-relaxed text-muted dark:text-text-tertiary">
              <ImageModal
                src="/images/omnixis-conceived-whiteboard-2024-12-11.jpg"
                alt={`${BRAND.PRODUCT_SHORT} Whiteboard-Skizze, Sindelfingen, Dezember 2024`}
                className="inline-flex min-h-[24px] items-center cursor-pointer text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:text-accent-hover hover:decoration-accent"
              >
                Conceived
              </ImageModal>{" "}
              December 11, 2024 in Sindelfingen.
              <br />
              <ImageModal
                src="/images/omnixis-born-first-session-2026-03-22.png"
                alt={`Erste ${BRAND.PRODUCT_SHORT} Claude Code Session, März 2026`}
                className="inline-flex min-h-[24px] items-center cursor-pointer text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:text-accent-hover hover:decoration-accent"
              >
                Born
              </ImageModal>{" "}
              March 22, 2026 in Stuttgart.
              <br />
              MVP Q2 2026.
              <br />
              LIVE Q3 2026.
            </p>
          </section>
        </article>

        <p className="mt-10 text-sm italic text-muted dark:text-text-tertiary">
          <span className="font-medium not-italic">Wie dieser Text entstand:</span> KI-beschleunigt
          entworfen, vom Gründer redigiert — dieselbe Arbeitsweise, die Neckarshore baut.
        </p>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-primary/5 pt-8 dark:border-text-secondary/10">
          <Link
            href="/products"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
          >
            ← Alle Produkte
          </Link>
          <a
            href="https://calendly.com/rauhut/20min"
            target="_blank"
            rel="noopener noreferrer"
            data-track="omnopsis_cta"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
          >
            Kennenlerntermin buchen →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
