# Analytics Events

Alle Tracking-Events auf neckarshore.ai. DSGVO-konform: kein Cookie, kein Fingerprinting, kein PII.

## Events

| Event | Wann | Daten | Beispiel |
|-------|------|-------|----------|
| `page_view` | Seite geladen | `page`, `referrer`, `device` | `{page: "/", device: "mobile"}` |
| `scroll_depth` | Scroll-Schwelle erreicht | `depth` (25/50/75/100) | `{depth: 50}` |
| `cta_click` | Klick auf CTA-Button | `action` | `{action: "cta_click"}` |
| `nav_click` | Klick auf Nav-Link | `action` | `{action: "nav_services"}` |
| `section_view` | Section zu 40% sichtbar | `section` | `{section: "omnopsis"}` |

## Nav-Links (nav_click)

| Action | Ziel |
|--------|------|
| `nav_services` | #services |
| `nav_why-nearshore` | #why-nearshore |
| `nav_omnopsis` | #omnopsis |
| `nav_founder` | #founder |

## Sections (section_view)

Feuert **einmal pro Session** wenn die Section zu 40% im Viewport ist:

`services`, `why-nearshore`, `omnopsis`, `founder`, `cta`, `faq`

## Daten abfragen

```bash
# Auth: GET requires Authorization: Bearer ${ANALYTICS_READ_TOKEN}
# Token is set in Vercel env-vars (production + preview separately).
# Generate locally: openssl rand -hex 32

# Heute
curl -H "Authorization: Bearer $ANALYTICS_READ_TOKEN" \
  "https://neckarshore.ai/api/track?day=2026-04-05"

# Letzte 7 Tage
curl -H "Authorization: Bearer $ANALYTICS_READ_TOKEN" \
  "https://neckarshore.ai/api/track?days=7"

# Inkl. Playwright-Test-Events
curl -H "Authorization: Bearer $ANALYTICS_READ_TOKEN" \
  "https://neckarshore.ai/api/track?days=1&include_test=true"
```

> **Note:** POST (visitor-ping via `navigator.sendBeacon`) stays public.
> Only GET (analytics read) requires the Bearer token.

**Response:**

```json
{
  "totalEvents": 42,
  "pageViews": 12,
  "days": 1,
  "data": {
    "2026-04-05": [...]
  }
}
```

## Architektur

| Komponente | Datei | Aufgabe |
|------------|-------|---------|
| `TrackerScript` | `src/components/TrackerScript.tsx` | Client-seitig: `sendBeacon()`, Scroll, Clicks, IntersectionObserver |
| API Route | `src/app/api/track/route.ts` | POST: validiert + speichert. GET: liest + filtert. |
| Storage | `src/lib/analytics-store.ts` | Upstash Redis (Prod) / lokale JSON-Datei (Dev) |

## Source Tagging

Jedes Event hat ein `source`-Feld: `"browser"` (echte User) oder `"playwright"` (E2E Tests). Die GET-API filtert Playwright-Events standardmaessig raus.
