---
name: "Ristorante Goldoni"
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

## Ausgangslage

Das Ristorante Goldoni, ein italienisches Restaurant im Stuttgarter Westen, lief zuvor auf einer WordPress-Installation (PHP 8.2). Gebraucht wurde eine moderne, schnelle Web-Präsenz, die die Speisekarte, die wöchentliche Empfehlungskarte, Kontakt- und Feier-Anfragen sowie die Anfahrt sauber abbildet. Anspruch: eine Seite, die ohne laufenden Wartungsaufwand stabil bleibt und sich datenschutzkonform betreiben lässt — keine fremden Tracker, keine Cookie-Banner-Pflicht.

## Ansatz

Wir haben die Seite KI-beschleunigt neu gebaut — als statische Next.js-Anwendung statt CMS-Monolith. Inhalte (Speisekarte, Weinempfehlungen, FAQ, Empfehlungskarte) liegen als strukturierte Daten im Repository und werden zur Build-Zeit gerendert; ein Push deployt automatisch. Restaurant-Stammdaten (Adresse, Telefon, Öffnungszeiten) leben an einer einzigen Stelle (`site.ts`) und propagieren von dort in UI, Metadaten und JSON-LD. DSGVO-by-Design: selbst gehostete Fonts, kein Analytics, keine Drittanbieter-Embeds im Standardpfad.

## Technik & Architektur

Das Stack entspricht den übrigen Neckarshore-Seiten: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, deployt auf Vercel. Kontakt- und Feier-Formulare laufen über Server Actions mit Versand via Nodemailer; Cloudflare Turnstile schützt die Formulare DSGVO-konform vor Spam (interaction-only, kein Cross-Site-Tracking). Strenge Security-Header (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) sind in `next.config.ts` verdrahtet. Für SEO emittiert die Seite Schema.org-JSON-LD (Restaurant, Menu, FAQPage, BreadcrumbList) als natives Server-gerendertes Script; die Migration von WordPress ist über 308-Redirects der Alt-URLs abgesichert, inklusive www→apex-Kanonisierung.

## Laufende Pflege

Drei GitHub-Actions-Workflows sichern jeden Push und Pull Request auf `main` ab: `lint.yml` (strenger ESLint-Gate, null Warnungen), `e2e.yml` (Playwright-Suite für die Kontakt- und Feier-Formulare) und `lighthouse.yml` (Desktop- und Mobile-Audit, wöchentlich plus on-demand). Deployment läuft automatisch über Vercel beim Push. Inhaltliche Updates — etwa die wöchentliche Empfehlungskarte — sind ein Ein-Datei-Edit im Repository.

## Status

Live unter `ristorante-goldoni.de` (Next.js auf Vercel). Online sind die Startseite, Speisekarte (`/menu`), Empfehlungskarte (`/empfehlungen`), „Über uns" (`/ueber-uns`), Feier-Anfrage (`/feiern`), Kontakt (`/kontakt`) sowie Impressum und Datenschutz. Lighthouse 95+ ist als CI-Gate gesetzt (Ziel, kein gemessener Bestwert hier ausgewiesen). Ein Post-Launch-SEO-Audit mit GSC-Redirect-Bereinigung wurde durchgeführt; der jüngste Security-Bump hob Next.js auf 16.2.6.

## Ausblick

Mehrere Erweiterungen sind offen und in einer dedizierten Session mit dem Kunden zu entscheiden — keine zugesagte Roadmap: ein leichtgewichtiges CMS für die Eigenpflege (Decap oder Sanity, aktuell statisch im Repository), eine Online-Reservierung (heute Telefon und Mail) sowie eine eigene Events-Pipeline (heute statisch). Termine und Umfang sind noch offen und werden mit dem Kunden abgestimmt.
