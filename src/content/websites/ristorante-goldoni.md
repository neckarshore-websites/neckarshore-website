---
name: "ristorante-goldoni.de"
headline: "Statischer Next.js-Relaunch für ein italienisches Restaurant in Stuttgart"
lead: "Relaunch der Website des Ristorante Goldoni von WordPress auf ein statisches Next.js-Stack — schnell, DSGVO-by-Design und selbst pflegbar."
liveUrl: "https://ristorante-goldoni.de"
techStack:
  - "Next.js 16 (App Router)"
  - "React 19"
  - "Tailwind CSS v4"
  - "TypeScript"
  - "Self-hosted Fonts"
  - "Vercel"
status: "Live"
---

## Was war die Ausgangslage?

Das Ristorante Goldoni, ein italienisches Restaurant im Stuttgarter Westen, lief zuvor auf einer WordPress-Installation (PHP 8.2). Gebraucht wurde eine moderne, schnelle Web-Präsenz, die die Speisekarte, die wöchentliche Empfehlungskarte, Kontakt- und Feier-Anfragen sowie die Anfahrt sauber abbildet. Anspruch: eine Seite, die ohne laufenden Wartungsaufwand stabil bleibt und sich datenschutzkonform betreiben lässt — keine fremden Tracker, keine Cookie-Banner-Pflicht.

## Wie sind wir vorgegangen?

Wir haben die Seite KI-beschleunigt neu gebaut — als statische Next.js-Anwendung statt CMS-Monolith. Inhalte (Speisekarte, Weinempfehlungen, FAQ, Empfehlungskarte) liegen als strukturierte Daten im Repository und werden zur Build-Zeit gerendert; ein Push deployt automatisch. Restaurant-Stammdaten (Adresse, Telefon, Öffnungszeiten) leben an einer einzigen Stelle (`site.ts`) und propagieren von dort in UI, Metadaten und JSON-LD. DSGVO-by-Design: selbst gehostete Fonts, kein Analytics, keine Drittanbieter-Embeds im Standardpfad.

## Wie ist die Website technisch gebaut?

Die Architektur im Detail — was hinter den Bausteinen oben steckt:

| Baustein | Detail |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript — Stack wie die übrigen Neckarshore-Seiten |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |
| Schriften | Selbst gehostet — kein externer Font-Host, kein Datentransfer in Drittstaaten |
| Formulare | Kontakt- und Feier-Formulare über Server Actions, Versand via Nodemailer; Cloudflare Turnstile schützt DSGVO-konform vor Spam (interaction-only, kein Cross-Site-Tracking) |
| Sicherheit | Strenge Security-Header (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) in `next.config.ts` verdrahtet |
| SEO | Schema.org-JSON-LD (Restaurant, Menu, FAQPage, BreadcrumbList) als natives Server-gerendertes Script |
| Migration | WordPress-Ablösung über 308-Redirects der Alt-URLs abgesichert, inkl. `www`→Apex-Kanonisierung |

## Wie läuft die Pflege im Betrieb?

Jede freigegebene Änderung geht automatisch live. Davor laufen automatische Kontrollen: Der Code wird auf Sauberkeit geprüft, die Kontakt- und Feier-Formulare werden durchgetestet und Ladezeit, Barrierefreiheit sowie Suchmaschinen-Tauglichkeit werden gemessen (wöchentlich und bei Bedarf). Inhaltliche Updates — etwa die wöchentliche Empfehlungskarte — sind mit einer einzigen kleinen Änderung erledigt.

## Was ist heute live?

Live unter `ristorante-goldoni.de` (Next.js auf Vercel). Online sind die Startseite, Speisekarte (`/menu`), Empfehlungskarte (`/empfehlungen`), „Über uns" (`/ueber-uns`), Feier-Anfrage (`/feiern`), Kontakt (`/kontakt`) sowie Impressum und Datenschutz. Lighthouse 95+ ist als CI-Gate gesetzt (Ziel, kein gemessener Bestwert hier ausgewiesen). Ein Post-Launch-SEO-Audit mit GSC-Redirect-Bereinigung wurde durchgeführt; der jüngste Security-Bump hob Next.js auf 16.2.6.

## Was kommt als Nächstes?

Mehrere Erweiterungen sind denkbar, aber noch nicht zugesagt — sie werden in einem eigenen Termin mit dem Kunden entschieden: ein einfaches Redaktionssystem zur Eigenpflege der Inhalte (heute liegen sie direkt im Projekt), eine Online-Reservierung (heute über Telefon und E-Mail) sowie eine eigene Verwaltung für Veranstaltungen. Umfang und Zeitpunkt sind offen und werden gemeinsam mit dem Kunden festgelegt.
