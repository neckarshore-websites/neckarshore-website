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

Jeder Push nach `main` löst ein automatisches Vercel-Deploy aus, abgesichert durch mehrere CI-Gates in GitHub Actions: `lint.yml` (ESLint strikt, null Warnungen), `e2e.yml` (Playwright-E2E, nur deterministische Tests des eigenen Codes — `@external`-getaggte Drittanbieter-Checks sind ausgeschlossen), `unit.yml` (Node-Unit-Tests des Test-Scope-Aggregators), `lighthouse.yml` (Lighthouse über Desktop + Mobile; A11y/Best Practices/SEO hart @95, Performance advisory) und ein wöchentlicher `link-check.yml`-Cron, der tote externe Links findet und automatisch ein GitHub-Issue öffnet bzw. schließt. Jeder Testlauf wird in `docs/test-log.md` protokolliert (eine Zeile pro Run), Lighthouse-Läufe in `docs/lighthouse-log.md` — diese Logdisziplin macht Drift über die Zeit sichtbar.

## Status

Live unter [neckarshore.ai](https://neckarshore.ai) (HTTP 200 verifiziert). Die Seite umfasst die Landing Page, ein Produkt-Portfolio mit Detailseiten, ein Glossar sowie rechtliche Seiten (Impressum, Datenschutz). Die E2E-Suite läuft grün; die jeweils aktuelle, belastbare Testzahl steht in `docs/test-log.md` (Stand zuletzt rund 190 Tests pro Lauf) — bewusst keine fest verdrahtete Zahl im Fließtext, da sie sonst veraltet. Keine erfundenen Konversions- oder Traffic-Zahlen.

## Ausblick

Im Repo bereits angelegt und auf Aktivierung wartend: Cloudflare Turnstile als Spam-Schutz des Kontaktformulars (dormant, in der CSP bereits freigegeben) sowie eine `www → apex` 308-Weiterleitung, die automatisch greift, sobald DNS für `www.neckarshore.ai` eingerichtet ist (Schutz gegen Duplicate-Host-SEO-Risiko). Ansonsten wächst die Seite iterativ mit dem Portfolio — neue Produkt- und Inhaltsseiten kommen laufend dazu.
