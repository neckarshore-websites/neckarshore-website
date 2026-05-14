import { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — neckarshore.ai",
  description:
    "Datenschutzerklärung von neckarshore.ai — Informationen zur Datenverarbeitung, Cookies und Ihren Rechten gemäß DSGVO.",
  openGraph: {
    title: "Datenschutzerklärung — neckarshore.ai",
    description:
      "Datenschutzerklärung von neckarshore.ai — Informationen zur Datenverarbeitung, Cookies und Ihren Rechten gemäß DSGVO.",
    url: "https://neckarshore.ai/datenschutz",
    siteName: "neckarshore.ai",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "neckarshore.ai — Software Development. Closer to Home.",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Datenschutzerklärung — neckarshore.ai",
    description:
      "Datenschutzerklärung von neckarshore.ai — Informationen zur Datenverarbeitung gemäß DSGVO.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://neckarshore.ai/datenschutz",
  },
};

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

export default function Datenschutz() {
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <main className="mx-auto max-w-[800px] px-4 pt-40 pb-20 md:px-6">
        <h1 className="font-heading text-3xl font-bold text-accent md:text-5xl">Datenschutzerklärung</h1>
        <p className="mt-2 text-sm text-muted dark:text-text-secondary/60">Stand: März 2026</p>

        <div className="mt-10 space-y-8 text-neutral-dark/80 leading-relaxed dark:text-text-secondary">
          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">1. Verantwortlicher</h2>
            <p className="mt-3">
              German Rauhut
              <br />
              IT Consulting &amp; Digital Ventures
              <br />
              Rotebühlstraße 176
              <br />
              70197 Stuttgart
              <br />
              Deutschland
            </p>
            <p className="mt-2">
              E-Mail: info@neckarshore.ai
              <br />
              Telefon: +49 160 385 9135
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">
              2. Übersicht der Verarbeitungen
            </h2>
            <p className="mt-3">
              Diese Datenschutzerklärung informiert Sie über die Verarbeitung personenbezogener Daten auf der
              Website neckarshore.ai.
            </p>
            <h3 className="mt-4 font-heading text-lg font-semibold text-primary dark:text-text-primary">Grundlage</h3>
            <p className="mt-2">
              Wir verarbeiten personenbezogene Daten nur, wenn eine Rechtsgrundlage dies erlaubt:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> — Einwilligung
              </li>
              <li>
                <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> — Vertragserfüllung
              </li>
              <li>
                <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> — Berechtigtes Interesse
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">3. Hosting</h2>
            <p className="mt-3">Diese Website wird gehostet bei:</p>
            <p className="mt-2">
              <strong>Vercel Inc.</strong>
              <br />
              440 N Barranca Ave #4133
              <br />
              Covina, CA 91723, USA
            </p>
            <p className="mt-3">
              Vercel verarbeitet bei jedem Seitenaufruf automatisch: IP-Adresse, Datum und Uhrzeit des
              Zugriffs, aufgerufene Seite, Browsertyp und -version, Betriebssystem, Referrer-URL.
            </p>
            <p className="mt-2">
              Diese Daten werden in Server-Logfiles gespeichert und sind für den Betrieb der Website technisch
              notwendig (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <p className="mt-2">
              Vercel kann Daten in die USA übermitteln. Die Übermittlung erfolgt auf Basis von
              EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).
            </p>
            <p className="mt-2">
              Weitere Informationen:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover"
              >
                https://vercel.com/legal/privacy-policy
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">4. Webanalyse</h2>
            <p className="mt-3">
              Wir nutzen ein eigenes, selbst entwickeltes Tracking-System auf dieser Website. Die Analyse
              erfolgt vollständig auf unserer eigenen Infrastruktur. Es werden{" "}
              <strong>keine Daten an Dritte übermittelt</strong>.
            </p>
            <p className="mt-2">
              Erfasst werden: aufgerufene Seite, Referrer, Gerätetyp, Scrolltiefe, Zeitpunkt. Es werden{" "}
              <strong>keine Cookies</strong> gesetzt und <strong>keine personenbezogenen Daten</strong>{" "}
              gespeichert. IP-Adressen werden nicht erhoben.
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Berechtigtes Interesse an der anonymen Nutzungsanalyse zur Verbesserung
              unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">
              5. Schriftarten (Self-Hosted)
            </h2>
            <p className="mt-3">
              Diese Website nutzt die Schriftarten Space Grotesk und Inter. Die Schriftarten werden{" "}
              <strong>lokal auf dem eigenen Server</strong> gehostet und{" "}
              <strong>nicht von externen Diensten</strong> (wie Google Fonts) geladen. Es findet keine
              Datenübermittlung an Dritte statt.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">
              6. Terminbuchung (Calendly)
            </h2>
            <p className="mt-3">Für die Buchung von Kennenlern-Terminen nutzen wir Calendly:</p>
            <p className="mt-2">
              <strong>Calendly LLC</strong>
              <br />
              3423 Piedmont Rd NE, Suite 420
              <br />
              Atlanta, GA 30305, USA
            </p>
            <p className="mt-3">
              Bei Nutzung des Terminbuchungs-Links werden Sie auf die Website von Calendly weitergeleitet.
              Dort werden die von Ihnen eingegebenen Daten (Name, E-Mail, ggf. Telefonnummer) von Calendly
              verarbeitet.
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) — Sie entscheiden selbst, ob Sie
              den Link nutzen und Daten eingeben.
            </p>
            <p className="mt-2">
              Calendly kann Daten in die USA übermitteln. Die Übermittlung erfolgt auf Basis von
              EU-Standardvertragsklauseln.
            </p>
            <p className="mt-2">
              Weitere Informationen:{" "}
              <a
                href="https://calendly.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover"
              >
                https://calendly.com/privacy
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">
              7. Kontakt per E-Mail
            </h2>
            <p className="mt-3">
              Wenn Sie uns per E-Mail kontaktieren, werden Ihre Angaben (Name, E-Mail-Adresse, Inhalt der
              Nachricht) zur Bearbeitung Ihrer Anfrage verarbeitet und gespeichert.
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Vertragsanbahnung (Art. 6 Abs. 1 lit. b DSGVO) oder berechtigtes Interesse
              (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <p className="mt-2">
              Ihre Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet ist, es sei denn,
              gesetzliche Aufbewahrungspflichten bestehen.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">8. Cookies</h2>
            <p className="mt-3">
              Diese Website verwendet ausschließlich <strong>technisch notwendige Cookies</strong>, die für
              den Betrieb der Website erforderlich sind. Es werden keine Tracking-Cookies oder
              Marketing-Cookies eingesetzt.
            </p>
            <p className="mt-2">
              Ein Cookie-Banner informiert Sie beim ersten Besuch über die Verwendung dieser Cookies.
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">9. Ihre Rechte</h2>
            <p className="mt-3">
              Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
            </p>
            <ol className="mt-3 list-inside list-decimal space-y-2">
              <li>
                <strong>Auskunft</strong> (Art. 15 DSGVO) — Welche Daten wir über Sie gespeichert haben
              </li>
              <li>
                <strong>Berichtigung</strong> (Art. 16 DSGVO) — Korrektur unrichtiger Daten
              </li>
              <li>
                <strong>Löschung</strong> (Art. 17 DSGVO) — Löschung Ihrer Daten (&quot;Recht auf
                Vergessenwerden&quot;)
              </li>
              <li>
                <strong>Einschränkung</strong> (Art. 18 DSGVO) — Einschränkung der Verarbeitung
              </li>
              <li>
                <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — Ihre Daten in maschinenlesbarem
                Format
              </li>
              <li>
                <strong>Widerspruch</strong> (Art. 21 DSGVO) — Widerspruch gegen die Verarbeitung
              </li>
              <li>
                <strong>Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO) — Jederzeit möglich
              </li>
            </ol>
            <p className="mt-3">
              Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: info@neckarshore.ai
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">10. Beschwerderecht</h2>
            <p className="mt-3">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren:
            </p>
            <p className="mt-2">
              <strong>
                Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg
              </strong>
              <br />
              Lautenschlagerstraße 20
              <br />
              70173 Stuttgart
              <br />
              <a
                href="https://www.baden-wuerttemberg.datenschutz.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover"
              >
                https://www.baden-wuerttemberg.datenschutz.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">11. Änderungen</h2>
            <p className="mt-3">
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, insbesondere bei
              Änderungen der Datenverarbeitung oder neuen gesetzlichen Vorgaben. Es gilt die jeweils auf der
              Website veröffentlichte Fassung.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-primary/5 bg-white px-4 py-10 md:px-6 dark:border-text-secondary/10 dark:bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 text-sm text-muted dark:text-text-secondary/60 md:flex-row md:justify-between">
          <Link href="/">
            <Logo size="text-xl" className="opacity-60" />
          </Link>
          <div className="flex gap-6">
            <a href="/impressum" className="transition-colors hover:text-accent">
              Impressum
            </a>
            <span className="font-medium text-primary/60">Datenschutz</span>
          </div>
          <p>&copy; 2026 neckarshore.ai</p>
        </div>
      </footer>
    </>
  );
}
