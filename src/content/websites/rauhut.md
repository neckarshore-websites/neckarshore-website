---
name: "rauhut.com"
headline: "Persönliche Web-Präsenz für German Rauhut — statischer One-Pager, zweisprachig, DSGVO-by-Design"
lead: "Statische persönliche Web-Präsenz für German Rauhut: zweisprachiger One-Pager auf Next.js 16, cookieless, DSGVO-by-Design, live auf Vercel."
liveUrl: "https://rauhut.com"
techStack:
  - "Next.js 16 (App Router, Turbopack)"
  - "React 19"
  - "Tailwind CSS v4"
  - "TypeScript (strict)"
  - "Vercel (Hosting + Web Analytics)"
  - "Playwright (E2E)"
status: "Live"
---

## Ausgangslage

`rauhut.com` ist die persönliche Web-Präsenz des Gründers — die Person, nicht die Firma (`neckarshore.ai` ist das Unternehmen). Gebraucht wurde ein schlanker, schneller One-Pager als Proof of Work: Profil, Kernkompetenzen, Projekte und Kontakt, zweisprachig in Deutsch und Englisch. Anspruch: kein Cookie-Banner, keine Third-Party-Tracker, voll DSGVO-konform — eine Visitenkarte, die in Sekunden lädt und nichts an Dritte abgibt.

## Ansatz

Die Seite entstand KI-beschleunigt im selben Multi-Agent-Workflow, mit dem Neckarshore arbeitet. Architektonisch konsequent statisch: ein vorab gerenderter One-Pager ohne CMS, Dark Mode als Default mit Light-Toggle. Datenschutz ist by Design eingebaut — Schrift (Inter Variable) self-hosted statt über ein CDN, Analytics ausschließlich über die cookielose Vercel Web Analytics, daher kein Banner nötig. Das Impressum (§5 TMG) liegt auf `noindex`.

## Technik & Architektur

Die Architektur im Detail — was hinter den Bausteinen oben steckt:

| Baustein | Detail |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript im Strict-Mode |
| Styling | Tailwind CSS v4 (PostCSS-only, `@theme`-Tokens) |
| Hosting | Vercel (inkl. cookieloser Web Analytics); HSTS automatisch für die verifizierte Domain |
| Internationalisierung | Statisch gelöst: Deutsch als Default unter `/`, Englisch unter `/en` — hreflang-Alternates in Metadata und Sitemap |
| Kontaktformular | Serverseitig über Nodemailer (Cloudflare Turnstile als Spam-Schutz vorgesehen, derzeit dormant) |
| Sicherheit | OWASP-Baseline-Header inkl. einer pragmatischen Content-Security-Policy und ein `www`→Apex-Redirect (308) |
| Tests | Playwright-E2E |
| SEO | Schema.org `Person` als natives JSON-LD direkt im SSR-HTML |

## Laufende Pflege

Vor jeder Veröffentlichung laufen automatische Kontrollen: Der Code wird auf Sauberkeit geprüft, die wichtigsten Funktionen werden durchgetestet (Inhalte, der Wechsel zwischen Deutsch und Englisch, das Umschalten zwischen hellem und dunklem Modus) und Ladezeit, Barrierefreiheit sowie Suchmaschinen-Tauglichkeit werden gemessen — wöchentlich und bei jeder Änderung. Die Veröffentlichung selbst läuft automatisch: Jede freigegebene Änderung geht ohne manuellen Schritt live, jede Vorab-Version bekommt vorher eine eigene Test-Adresse zur Abnahme.

## Status

Live auf Vercel unter `rauhut.com`; der DNS-Cutover von IONOS zu Vercel ist seit 2026-04-17 abgeschlossen (MX bleibt bei IONOS, Mail-Empfang separat geregelt). Online sind der zweisprachige One-Pager (Zusammenfassung, Kernkompetenzen, Projekte, Kontakt), das Impressum und die `/designs`-Galerie. Lighthouse-Baseline laut Repo: Accessibility, Best Practices und SEO bei 100 (Desktop + Mobile), Performance 100 Desktop / 97 Mobile.

## Ausblick

Eine eigentliche Roadmap gibt es nicht — offen ist nur ein kleiner Feinschliff-Backlog, der größtenteils schon abgearbeitet ist. Vorbereitet und noch zu aktivieren: ein Spam-Schutz für das Kontaktformular. Bewusst nicht geplant sind ein Blog, fremde Analyse-Werkzeuge und ein Cookie-Banner.
