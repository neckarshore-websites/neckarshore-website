import { OSS_LAUNCH_SICHTBAR } from "@/lib/kontakt-config";
import { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import { PageSchema } from "@/components/PageSchema";

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

const showOssLaunch = OSS_LAUNCH_SICHTBAR;

export default function Datenschutz() {
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <PageSchema path="/datenschutz" name="Datenschutzerklärung — neckarshore.ai" />
      <main className="mx-auto max-w-[800px] px-4 pt-40 pb-20 md:px-6">
        <h1 className="font-heading text-3xl font-bold text-accent md:text-5xl">Datenschutzerklärung</h1>
        <p className="mt-2 text-sm text-muted dark:text-text-tertiary">Stand: Juli 2026</p>

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
              Vercel hat seinen Sitz in den USA und kann Daten dorthin übermitteln. Vercel ist unter dem
              EU-US Data Privacy Framework zertifiziert (Art. 45 DSGVO); der Vertrag mit Vercel enthält
              zusätzlich die EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).
            </p>
            <p className="mt-2">
              Für die Webanalyse (siehe § 4) leitet Vercel aus der Client-IP-Adresse
              geografische Metadaten (Land, Region) ab und stellt sie als
              Request-Header bereit. Die IP-Adresse selbst verbleibt dabei in der
              Infrastruktur von Vercel und wird von uns nicht gespeichert.
            </p>
            <p className="mt-2">
              Weitere Informationen:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover dark:text-accent-bright"
              >
                https://vercel.com/legal/privacy-policy
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">4. Webanalyse</h2>
            <p className="mt-3">
              Wir betreiben auf dieser Website ein eigenes, cookiefreies Webanalyse-System. Erfasst
              werden: aufgerufene Seite, die Website, von der Sie kommen (Referrer, nur der Hostname),
              Gerätetyp (grob: mobil/Desktop), Scrolltiefe, sichtbar gewordene Seitenabschnitte,
              angeklickte Navigationselemente und Schaltflächen, Kampagnenparameter aus der
              aufgerufenen Adresse (utm_source, utm_medium, utm_campaign, utm_term, utm_content, ref),
              Land und Region, Zeitpunkt des Aufrufs sowie Core-Web-Vitals-Messwerte.
            </p>
            <p className="mt-2">
              Um Besuche innerhalb eines Tages voneinander zu unterscheiden und Sitzungen zu bilden
              (Dauer, Zahl der aufgerufenen Seiten), bilden wir serverseitig einen pseudonymen
              Tagesschlüssel: IP-Adresse, User-Agent-String, Kalendertag und ein zufälliger Tageswert
              werden mit SHA-256 verknüpft; gespeichert werden 16 Hexzeichen des Ergebnisses. Der
              Schlüssel ist ein pseudonymisiertes, personenbezogenes Datum. Solange der Tageswert
              existiert, ließe er sich für eine bekannte IP-Adresse und einen bekannten Browser
              nachrechnen; der Tageswert wird spätestens 25 Stunden nach seiner Erzeugung gelöscht. Der
              Schlüssel wechselt täglich; über mehrere Tage hinweg lässt sich ein Besuch damit nicht
              wiedererkennen. Die IP-Adresse selbst speichern wir nicht; sie fließt nur in diese
              Berechnung ein.
            </p>
            <p className="mt-2">
              Land und Region entnehmen wir Angaben, die Vercel als Infrastrukturanbieter aus der
              IP-Adresse ableitet und uns mit der Anfrage übergibt (Header:{" "}
              <code>x-vercel-ip-country</code>, <code>x-vercel-ip-country-region</code>).
            </p>
            <p className="mt-2">
              <strong>Empfänger und Speicherort:</strong> Die Analysedaten werden in einer Datenbank
              der Upstash, Inc. (USA) gespeichert; der Speicher steht in den USA. Upstash stützt die
              Übermittlung auf das EU-US Data Privacy Framework und, wo dieses nicht greift, auf die
              EU-Standardvertragsklauseln.
            </p>
            <p className="mt-2">
              <strong>Speicherdauer:</strong> Die Daten eines Tages werden 90 Tage nach dem ersten
              Eintrag dieses Tages automatisch gelöscht.
            </p>
            <p className="mt-2">
              Es werden <strong>keine Cookies</strong> gesetzt und kein Speicherzugriff auf Ihr
              Endgerät vorgenommen.
            </p>
            <p className="mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
              einer Reichweitenmessung zur Verbesserung unseres Angebots).
            </p>
            <p className="mt-2">
              <strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung jederzeit widersprechen
              (info@neckarshore.ai). Sobald der Tageswert gelöscht ist, können wir die Einträge eines
              einzelnen Besuchs nicht mehr heraussuchen (Art. 11 DSGVO); sie werden mit Ablauf der 90
              Tage gelöscht.
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
                className="text-accent hover:text-accent-hover dark:text-accent-bright"
              >
                https://calendly.com/privacy
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">
              7. Spam-Schutz für Formulare (Cloudflare Turnstile)
            </h2>
            <p className="mt-3">
              Zum Schutz unseres Kontaktformulars vor automatisiertem Missbrauch
              (Spam, Bots) setzen wir »Turnstile« ein, einen cookiefreien
              Bot-Erkennungsdienst der Cloudflare Inc.:
            </p>
            <p className="mt-2">
              <strong>Cloudflare, Inc.</strong>
              <br />
              101 Townsend Street
              <br />
              San Francisco, CA 94107, USA
            </p>
            <p className="mt-3">
              Beim Aufruf eines Formulars lädt Ihr Browser ein Script von
              Cloudflare (<code>challenges.cloudflare.com</code>) und übermittelt
              technische Merkmale zur Unterscheidung von Mensch und Bot (u. a.
              IP-Adresse, Browser- und Geräteinformationen sowie
              Interaktionssignale). Turnstile arbeitet »interaction-only«: Es
              setzt <strong>keine Cookies</strong> und verwendet die Daten nicht
              zum seitenübergreifenden Tracking.
            </p>
            <p className="mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an der Abwehr von Spam und missbräuchlichen
              Formularübermittlungen).
            </p>
            <p className="mt-2">
              Cloudflare kann Daten in die USA übermitteln. Cloudflare, Inc.
              ist unter dem EU-US Data Privacy Framework zertifiziert; die
              Übermittlung erfolgt daher auf Grundlage des
              Angemessenheitsbeschlusses der EU-Kommission (Art. 45 DSGVO).
              Ergänzend bestehen EU-Standardvertragsklauseln (Art. 46 Abs. 2
              lit. c DSGVO).
            </p>
            <p className="mt-2">
              Weitere Informationen:{" "}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover dark:text-accent-bright"
              >
                https://www.cloudflare.com/privacypolicy/
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">
              8. Kontakt per E-Mail
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
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">
              9. Speicherung im Browser
            </h2>
            <p className="mt-3">
              Diese Website setzt <strong>keine Cookies</strong> (weder technisch
              notwendige noch Tracking- oder Marketing-Cookies). Es erscheint kein
              Cookie-Banner, weil kein Speicherzugriff auf Ihr Endgerät erfolgt, der
              einer Einwilligung nach § 25 TDDDG bedürfte.
            </p>
            <p className="mt-2">
              Für die von Ihnen aktiv gewählte Designvariante (hell/dunkel) speichert
              die Website Ihre Auswahl im lokalen Speicher Ihres Browsers
              (»localStorage«). Diese Auswahl verbleibt ausschließlich auf Ihrem
              Gerät und wird nicht an uns oder Dritte übermittelt. Sie können diese
              Information jederzeit über die Browser-Einstellungen löschen.
            </p>
            <p className="mt-2">
              <strong>Rechtsgrundlage:</strong> § 25 Abs. 2 Nr. 2 TDDDG (technisch
              unbedingt erforderlich für die vom Nutzer ausdrücklich gewünschte
              Funktion — Darkmode-Persistenz).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">10. Ihre Rechte</h2>
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
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">11. Beschwerderecht</h2>
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
                className="text-accent hover:text-accent-hover dark:text-accent-bright"
              >
                https://www.baden-wuerttemberg.datenschutz.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-primary dark:text-text-primary">12. Änderungen</h2>
            <p className="mt-3">
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, insbesondere bei
              Änderungen der Datenverarbeitung oder neuen gesetzlichen Vorgaben. Es gilt die jeweils auf der
              Website veröffentlichte Fassung.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-primary/5 bg-white px-4 py-10 md:px-6 dark:border-text-secondary/10 dark:bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 text-sm text-muted dark:text-text-tertiary md:flex-row md:justify-between">
          <Link href="/">
            <Logo size="text-xl" />
          </Link>
          <div className="flex gap-6">
            <a href="/impressum" className="transition-colors hover:text-accent">
              Impressum
            </a>
            <span className="font-medium text-muted dark:text-text-tertiary">Datenschutz</span>
          </div>
          <p>&copy; 2026 neckarshore.ai</p>
        </div>
      </footer>
    </>
  );
}
