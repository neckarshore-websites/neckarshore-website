# Lighthouse CI

Automatisierte Performance- und Qualitaets-Checks fuer neckarshore.ai.

## Thresholds

| Kategorie | Threshold | Warum |
|-----------|-----------|-------|
| Performance | 85 | Next.js Framework-Overhead (~58KB Router/Hydration) kostet ~12 Punkte. Nicht optimierbar ohne Client-Interaktivitaet zu opfern. |
| Accessibility | 95 | WCAG AA ist Pflicht. |
| Best Practices | 95 | Security Headers, HTTPS, keine deprecated APIs. |
| SEO | 95 | Meta Tags, Structured Data, Crawlability. |

## Lokal ausfuehren

```bash
# Full run: baut, startet Server, prueft Desktop + Mobile, stoppt Server
npm run lighthouse

# Quick: setzt laufenden Server auf :3000 voraus (z.B. nach npm run start)
npm run lighthouse:quick
```

**Output:** Terminal-Scores + JSON-Reports in `.lighthouse/` (gitignored).

**Exit-Code:** `0` wenn alle Scores >= Threshold, `1` wenn nicht.

## GitHub Action

**Trigger:** Jeder Push auf `main` und jeder PR gegen `main`.

**Was passiert:**
1. `npm ci` + `npm run build`
2. Server starten auf `localhost:3000`
3. `npm run lighthouse:quick` (Desktop + Mobile)
4. Lighthouse JSON-Reports als Artifact hochladen (14 Tage)

**Ergebnisse pruefen:**
1. GitHub Repository oeffnen
2. Tab **Actions** klicken
3. Run **"Lighthouse Audit"** auswaehlen
4. Scores stehen im Log unter dem Step **"Run Lighthouse audit"**
5. JSON-Reports unter **Artifacts** am Ende der Run-Seite (Download)

**URL:** `https://github.com/neckarshore-ai/neckarshore-website/actions/workflows/lighthouse.yml`

## Wann schlaegt es fehl?

Der Run wird rot wenn **eine** Kategorie unter dem Threshold liegt — egal ob Desktop oder Mobile. Typische Ursachen:

| Symptom | Ursache | Fix |
|---------|---------|-----|
| Accessibility < 95 | Kontrast-Problem, fehlende alt-Texte, Touch Targets < 24px | Lighthouse Report pruefen, betroffene Elemente fixen |
| Performance < 85 | Grosses Bild ohne `loading="lazy"`, ungenutztes JS | `next/image` nutzen, `dynamic()` fuer Client Components |
| SEO < 95 | Fehlende Meta Description, kaputte Structured Data | `metadata` in `page.tsx` pruefen |

## Retry-Logik

Lighthouse hat einen bekannten Bug (`NO_LCP` / `LanternError`) bei Desktop-Audits auf localhost. Das Script versucht jeden Audit bis zu **3x** bevor es aufgibt. Das betrifft nur lokale Runs und CI — auf echten URLs tritt der Bug nicht auf.

## Dateien

| Datei | Zweck |
|-------|-------|
| `scripts/lighthouse.mjs` | Audit-Script (Build, Server, Desktop+Mobile, Thresholds) |
| `.github/workflows/lighthouse.yml` | GitHub Action Definition |
| `.lighthouse/` | Lokale Reports (gitignored) |
