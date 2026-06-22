---
name: "oakwoodgolfclub.de"
headline: "WordPress-Ablösung für einen Fernmitgliedschafts-Golfclub — statisch, DSGVO-sauber, auf Vercel live."
lead: "Wir haben den 16 Jahre alten WordPress-Auftritt des Oakwood Golf Club durch eine statische Next.js-Site mit Anmeldung, Verlängerung, FAQ und Blog ersetzt."
liveUrl: "https://oakwoodgolfclub.de"
techStack:
  - "Next.js 16 (App Router)"
  - "Cloudflare Turnstile"
  - "Markdown-Blog (gray-matter + marked)"
  - "Playwright"
  - "React 19"
  - "SMTP (nodemailer)"
  - "Tailwind CSS 4"
  - "TypeScript"
  - "Vercel"
status: "Live; Mitglieder-Portal geplant, noch nicht gebaut"
---

## Ausgangslage

Der Oakwood Golf Club bietet eine Fernmitgliedschaft mit offiziellem Handicap und Mitgliederkarte für Golferinnen und Golfer im DACH-Raum. Der bestehende Auftritt lief 16 Jahre lang auf WordPress und sollte durch eine schnellere, wartungsarme und datenschutzkonforme Lösung ersetzt werden — inklusive der Online-Strecken für Anmeldung, Verlängerung und Karten-Versand.

## Ansatz

Wir haben den Auftritt als überwiegend statische Next.js-Site neu gebaut: schnell ausgeliefert, ohne externe Tracker und mit selbst gehosteten Fonts (kein Google-Fonts-CDN zur Laufzeit, DSGVO-by-Design). Die drei Formulare — Anmeldung, Verlängerung und Kontakt — laufen über Server Actions mit Cloudflare Turnstile als cookieless Spam-Schutz; der Versand erfolgt per SMTP, eine Honeypot-Strecke fängt Bots still ab. Eine strikte Content-Security-Policy samt HSTS, X-Frame-Options und Permissions-Policy ist global gesetzt. Die 16 Jahre WordPress-Inhalte werden über generierte Legacy-Redirects sauber auf die neuen URLs überführt.

## Technik & Architektur

Die Architektur im Detail — was hinter den Bausteinen oben steckt:

| Baustein | Detail |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |
| Blog | Markdown-getrieben (`gray-matter` + `marked`), im Repo versioniert — kein separates CMS als Laufzeit-Abhängigkeit |
| Formulare | Server Actions mit `nodemailer` (SMTP) für den Versand, Eingaben per Zod validiert; Cloudflare Turnstile als cookieloser Spam-Schutz |
| Sicherheit | Sicherheits-Header und Legacy-Redirects deklarativ in `next.config.ts`; Trailing-Slash-Normalisierung über `proxy.ts`, um Redirect-Hops zu sparen |
| Tests | Playwright-E2E |
| Mitgliederkarte | Gedruckter QR-Code auf `/qr.html`, der per Rewrite ohne Redirect-Hop auf die `/qr`-Route auflöst |

## Laufende Pflege

Jede freigegebene Änderung geht automatisch live — ohne manuellen Veröffentlichungsschritt. Davor und danach greifen mehrere automatische Kontrollen: Der Code wird auf Sauberkeit geprüft, die wichtigsten Abläufe werden bei jeder Änderung durchgetestet, einmal täglich läuft zusätzlich ein Test direkt gegen die Live-Seite, und wöchentlich werden Ladezeit, Barrierefreiheit und Suchmaschinen-Tauglichkeit gemessen. Neue oder geänderte Blog-Beiträge werden automatisch bei den Suchmaschinen angemeldet, damit sie innerhalb von Minuten neu erfasst werden. So lassen sich Inhalte — Blog, Bilder, Seiten — ohne technischen Aufwand veröffentlichen.

## Status

Live auf `oakwoodgolfclub.de` (DNS-Cutover IONOS → Vercel abgeschlossen). Heute online sind Startseite, eine SEO-Landingpage zur Fernmitgliedschaft, die Formulare für Anmeldung (`/mitglied-werden`) und Verlängerung (`/mitgliedschaft-verlaengern`), Kontakt, FAQ, Blog (29 Markdown-Posts) sowie die Rechtsseiten (AGB, Impressum, Datenschutz) und die QR-Splash-Seite der Mitgliederkarte. Cloudflare Turnstile ist auf allen drei Formularen aktiv. Ein Online-Payment ist noch nicht angebunden (Stripe ist laut Datenschutzseite ausdrücklich nicht live).

## Ausblick

Geplant, aber noch nicht gebaut, ist ein Mitglieder-Portal mit Login, digitalen Scorecards und Handicap-Verwaltung — der nächste große Schritt, dessen Umfang noch mit dem Betreiber abgestimmt wird. Offen sind außerdem eine Online-Bezahlung und die Frage, wie die 16 Jahre an Blog-Inhalten langfristig gepflegt werden. Termine und Reihenfolge stehen noch nicht fest und werden gemeinsam mit dem Betreiber festgelegt.
