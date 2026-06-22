---
name: "neckarshore.ai"
headline: "Die eigene Marketing-Präsenz — KI-beschleunigt gebaut, DSGVO-by-Design, Made in Germany."
lead: "KI-beschleunigte Softwareentwicklung aus Stuttgart — statisch, schnell, ohne Tracking-Cookies und ohne externe Ressourcen, DSGVO-by-Design."
liveUrl: "https://neckarshore.ai"
techStack:
  - "Next.js 16 (App Router)"
  - "React 19"
  - "TypeScript"
  - "Tailwind CSS v4"
  - "Self-hosted Variable Fonts (next/font/local)"
  - "Cookieless First-Party Analytics (sendBeacon → /api/track, Upstash Redis)"
  - "Vercel Hosting"
status: "Live"
---

## Ausgangslage

neckarshore.ai ist die eigene Marketing-Präsenz von Neckarshore AI — die Landing Page für KI-beschleunigte Nearshore-Softwareentwicklung aus Stuttgart, gerichtet an CTOs und Entscheider im DACH-Mittelstand. Die Seite muss selbst beweisen, was sie verspricht: Made in Germany, DSGVO-by-Design, technisch sauber. Sie ist damit das erste Proof of Work — wer hier landet, soll die Arbeitsweise an der Seite selbst ablesen können.

## Ansatz

Gebaut wurde die Seite KI-beschleunigt und vom Gründer redigiert — dieselbe Arbeitsweise, mit der Neckarshore Kundenprojekte liefert. Datenschutz ist Architekturentscheidung, nicht Checkliste: keine Tracking-Cookies, keine externen Ressourcen, selbst gehostete Schriften statt eingebundener Google Fonts. Der Fokus liegt auf einer statischen, schnellen Auslieferung mit minimaler Drittanbieter-Abhängigkeit.

## Technik & Architektur

Die Architektur im Detail — was hinter den Bausteinen oben steckt:

| Baustein | Detail |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript — statisch-first gerendert |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |
| Schriften | Inter und Space Grotesk als Variable Fonts, subgesetzt und selbst ausgeliefert (`next/font/local`) — kein externer Font-Host, kein Datentransfer in Drittstaaten |
| Analytik | Cookielos und First-Party: `navigator.sendBeacon` an die eigene Route `/api/track`, persistiert in Upstash Redis — kein externer Analytics-Anbieter |
| Sicherheit | OWASP-Baseline-Header plus eine bewusst pragmatische Content-Security-Policy: Die statisch-first-Auslieferung (und damit die Lighthouse-Werte) hat Vorrang vor einer nonce-basierten Strict-CSP, die jede Route aus der statischen Generierung herausnehmen würde |
| SEO | Strukturdaten (JSON-LD) als native, Server-gerenderte `<script>`-Tags — im SSR-HTML für den Crawler sichtbar |

## Laufende Pflege

Die Seite pflegt sich weitgehend selbst. Jede freigegebene Änderung geht automatisch live — einen manuellen Veröffentlichungsschritt gibt es nicht. Davor läuft sie durch automatische Qualitätskontrollen: Der Code wird auf Sauberkeit geprüft, die wichtigsten Abläufe der Seite werden durchgetestet, und Ladezeit, Barrierefreiheit sowie Suchmaschinen-Tauglichkeit werden gemessen. Erst wenn alle Prüfungen bestehen, wird ausgeliefert. Ein wöchentlicher automatischer Check meldet zusätzlich kaputte Links. So bleibt die Seite stabil und aktuell, ohne dass jemand manuell nacharbeiten muss.

## Status

Live unter [neckarshore.ai](https://neckarshore.ai) (HTTP 200 verifiziert). Die Seite umfasst die Landing Page, ein Produkt-Portfolio mit Detailseiten, ein Glossar sowie rechtliche Seiten (Impressum, Datenschutz). Die E2E-Suite läuft grün; die jeweils aktuelle, belastbare Testzahl steht in `docs/test-log.md` (Stand zuletzt rund 190 Tests pro Lauf) — bewusst keine fest verdrahtete Zahl im Fließtext, da sie sonst veraltet. Keine erfundenen Konversions- oder Traffic-Zahlen.

## Ausblick

Einige Bausteine liegen fertig im Hintergrund und warten nur auf ihre Aktivierung — ein Spam-Schutz für das Kontaktformular und eine automatische Weiterleitung von der `www`-Adresse auf die Hauptdomain, sobald die Domain-Einstellungen dafür stehen. Ansonsten wächst die Seite Schritt für Schritt mit dem Angebot: Neue Produkt- und Inhaltsseiten kommen laufend dazu.
