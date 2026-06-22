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

Gebaut auf Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 (PostCSS-only, `@theme`-Tokens) und TypeScript im Strict-Mode. Die Internationalisierung ist statisch gelöst: Deutsch als Default unter `/`, Englisch unter `/en`, mit hreflang-Alternates in Metadata und Sitemap. Das Kontaktformular läuft serverseitig über nodemailer (Cloudflare Turnstile als Spam-Schutz vorgesehen, derzeit dormant). Sicherheitsseitig gelten OWASP-Baseline-Header inklusive einer pragmatischen Content-Security-Policy und ein `www`→Apex-Redirect (308); HSTS liefert Vercel automatisch für die verifizierte Domain. Schema.org `Person` wird als natives JSON-LD direkt ins SSR-HTML gerendert.

## Laufende Pflege

Vier GitHub-Actions-Workflows gaten jeden Push und PR auf `main`: `lint.yml` (strikter ESLint-Gate, zero warnings), `e2e.yml` (Playwright-Suite — Homepage-Inhalte, DE/EN-Toggle, Theme-Persistenz, `/designs`-Galerie), `lighthouse.yml` (Desktop- + Mobile-Audit, zusätzlich wöchentlich montags) und `designs-guard.yml` (nicht-blockierende Drift-Warnung für inline `<script>` in geänderten Designs-HTML). Deploy läuft per Vercel-Auto-Deploy: Branch-Pushes erzeugen Preview-Deploys, der Merge nach `main` geht live — kein manueller Release-Schritt.

## Status

Live auf Vercel unter `rauhut.com`; der DNS-Cutover von IONOS zu Vercel ist seit 2026-04-17 abgeschlossen (MX bleibt bei IONOS, Mail-Empfang separat geregelt). Online sind der zweisprachige One-Pager (Zusammenfassung, Kernkompetenzen, Projekte, Kontakt), das Impressum und die `/designs`-Galerie. Lighthouse-Baseline laut Repo: Accessibility, Best Practices und SEO bei 100 (Desktop + Mobile), Performance 100 Desktop / 97 Mobile.

## Ausblick

Eine Produkt-Roadmap im engeren Sinn gibt es nicht — das Repo führt einen kleinen Visual-Polish-Backlog, dessen Akzent-Items größtenteils bereits umgesetzt sind. Offen bleiben die Aktivierung der vorbereiteten Cloudflare-Turnstile-Absicherung des Kontaktformulars (derzeit dormant) und eine geparkte Google-Search-Console-Domain-Property (heute über eine URL-Prefix-Property plus Sitemap gelöst). Explizit out of scope: Blog/CMS, Third-Party-Analytics und ein Cookie-Banner.
