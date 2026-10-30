import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { PageSchema } from "@/components/PageSchema";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbListSchema } from "@/lib/schema/breadcrumb";

/**
 * /ki-fahrplan — the landing page for the lead magnet (planning #3336).
 *
 * THE DOWNLOAD IS OPEN, NO FORM. Founder 2026-10-30 (question tool): the form is Bob's #3337 and
 * blocked, so the PDF goes out directly and the form follows later. This page therefore collects
 * nothing, which is why it needs no addition to /datenschutz. When the form arrives, the vault
 * note's six landing-page conditions apply, and the privacy section must land first.
 *
 * ORDER: /ki-beratung must carry the direct credit (PR #344) before this goes live, because page
 * 8 of the PDF promises it. Every sentence here is lifted from the accepted PDF text; the button
 * labels and the "Was drinsteht" lead are the only new words.
 */

const PAGE_TITLE = "Ihr 90-Tage-KI-Fahrplan — vom Selbstcheck zur ersten Einheit";
/** Kept at or under 155 characters — TC-SEO-037 guards the whole site on this. */
const PAGE_DESCRIPTION =
  "Sechs Fragen, drei Phasen, ein gerechnetes Beispiel: In 90 Tagen von einem gewählten " +
  "Prozess zu einer ersten gebauten und abgenommenen Einheit. Als PDF.";
const PDF = "/downloads/90-tage-ki-fahrplan.pdf";
const CALENDLY = "https://calendly.com/german-rauhut/30min";

export const metadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/ki-fahrplan",
});

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Start", href: "/" },
  { name: "KI-Fahrplan" },
]);

/** The PDF's own headings, in order. */
const CONTENTS = [
  { head: "Der Selbstcheck", body: "Sechs Fragen, Ja oder Nein: Wo steht Ihr Unternehmen heute?" },
  { head: "Tag 1–30", body: "Einen Prozess wählen und messbar machen." },
  { head: "Tag 31–60", body: "Die erste Einheit bauen." },
  { head: "Tag 61–90", body: "Abnehmen, übergeben, die nächste Einheit schneiden." },
  { head: "Die Beispiel-Einheit", body: "Auftragsdaten aus der E-Mail ins ERP, durchgerechnet." },
  { head: "Freigabe", body: "Pflicht, Vertrauen, Nachweis." },
  { head: "Erfolgskriterien", body: "Und wie Sie jedes in einer Stunde messen." },
];

export default function KiFahrplanPage() {
  return (
    <>
      <Nav />
      <PageSchema path="/ki-fahrplan" name={PAGE_TITLE} />
      <JsonLd data={breadcrumbSchema} id="schema-breadcrumb-ki-fahrplan" />

      <main className="mx-auto max-w-[960px] px-4 pt-40 pb-20 md:px-6">
        <header className="max-w-[680px]">
          <p className="font-heading text-sm font-semibold uppercase tracking-wider text-accent dark:text-accent-bright">
            Selbstcheck und Fahrplan
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary dark:text-text-primary md:text-5xl">
            Ihr 90-Tage-KI-Fahrplan: vom Selbstcheck zur ersten gebauten Einheit
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Viele Unternehmen wissen, dass sie mit KI anfangen sollten. Was fehlt, ist selten
            der Wille — es fehlt ein Startpunkt, ein Abnehmer und eine Zahl, an der man Erfolg
            erkennt.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Dieser Fahrplan führt Sie in 90 Tagen von einem gewählten Prozess zu einer ersten
            Einheit, die gebaut, gemessen und abgenommen ist — nicht zu einer Folie, die sagt,
            was man tun könnte.
          </p>
          <a
            href={PDF}
            download
            data-track="fahrplan_download_hero"
            className="mt-7 inline-flex items-center rounded-lg bg-accent px-6 py-3 font-heading font-semibold text-white transition-colors hover:bg-accent/90 dark:bg-accent-bright dark:text-primary dark:hover:bg-accent-bright/90"
          >
            PDF herunterladen (8 Seiten)
          </a>
        </header>

        <section aria-labelledby="contents-heading" className="mt-16">
          <h2
            id="contents-heading"
            className="font-heading text-2xl font-bold text-primary dark:text-text-primary md:text-3xl"
          >
            Was drinsteht
          </h2>
          <ol className="mt-6 max-w-[680px] divide-y divide-primary/10 dark:divide-white/10">
            {CONTENTS.map((item) => (
              <li key={item.head} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
                <span className="font-heading font-semibold text-primary dark:text-text-primary">
                  {item.head}
                </span>
                <span className="text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  {item.body}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="cta-heading"
          className="mt-16 rounded-2xl border border-accent/20 bg-accent/[0.04] px-6 py-9 md:px-8 dark:border-accent-bright/25 dark:bg-accent-bright/[0.06]"
        >
          <h2
            id="cta-heading"
            className="font-heading text-2xl font-bold text-primary dark:text-text-primary md:text-3xl"
          >
            Der nächste Schritt
          </h2>
          <p className="mt-4 max-w-[640px] text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Sie schildern den einen Prozess — oder die fünf Kandidaten. Wir sagen Ihnen, ob eine
            Analyse sich lohnt. Wenn nicht, sagen wir das.{" "}
            <Link
              href="/ki-beratung"
              data-track="fahrplan_ki_beratung"
              className="font-semibold text-accent underline underline-offset-2 dark:text-accent-bright"
            >
              Zur KI-Beratung
            </Link>
          </p>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            data-track="fahrplan_cta_erstgespraech"
            className="mt-6 inline-flex items-center rounded-lg bg-accent px-6 py-3 font-heading font-semibold text-white transition-colors hover:bg-accent/90 dark:bg-accent-bright dark:text-primary dark:hover:bg-accent-bright/90"
          >
            Erstgespräch vereinbaren
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
