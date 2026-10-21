import type { SocialLink } from "@/lib/social";

/**
 * Rich MMP sub-portal card content — the longer card description + the repository link
 * for each Minimum Marketable Product. Keyed by the SAME slug as the matching `PORTFOLIO`
 * mmps item, so the /products/mmps sub-portal can join its card with zero mapping.
 *
 * WHY this lives here and NOT in `portfolio.ts`: `portfolio.ts` is imported by the client
 * `Nav` component, so anything added there ships in the client bundle. This module is
 * imported ONLY by the server-rendered MMP sub-portal, so the long-form copy never reaches
 * the browser as JS. Mirrors the routing-data (portfolio) vs. rich-content (server-only)
 * split that `skill-cards.tsx` already follows.
 *
 * `repoUrl` note: the MMP repos are PRIVATE (commercial products in development), unlike the
 * MIT-licensed Skills. A logged-out visitor following the GitHub link lands on GitHub's
 * sign-in / 404 wall. The link is present by Founder decision (2026-06-21) for visual
 * parity with the skill cards; it resolves cleanly once a repo is made public.
 * EXCEPTION, the native apps (Kaze, MuscleCat): no `repoUrl`. Founder, 2026-10-16 23:45 CEST,
 * question 4 on #309: a button every visitor follows into a 404 is a broken link, and an app
 * has its own public page instead (`appSiteUrl`). kaze.neckarshore.ai itself tests that it never
 * links its private repo. TC-CNT-102 holds it here.
 *
 * Descriptions are grounded in each repo's own description (no invention) + refined for the
 * card surface (≈3 lines). Adding/refining an MMP card = one entry here.
 */

export interface MmpCardData {
  /** ≈3-line card description shown on the /products/mmps sub-portal. */
  description: string;
  /** Repository URL — renders the GitHub button. PRIVATE today; absent for the apps (module note). */
  repoUrl?: string;
  /**
   * Live-app subdomain — renders a "Live ↗" button alongside GitHub on the card. Kept here
   * (server-only) rather than on the client-imported `portfolio.ts`, so the URL never ships in
   * the client bundle (same routing-data vs. rich-content split this module already follows).
   * Only set for MMPs with a functional public app (ClearPath, Snakeoil-Check).
   */
  liveUrl?: string;
  /**
   * Native apps only: the app's own public page (handbook, FAQ, privacy) — NOT the app.
   * Deliberately a separate field from `liveUrl`: `liveUrl` arms the live schema and the
   * "Live ausprobieren" button, and a click there would land on another text page instead
   * of a product. This one renders as "App-Seite ↗" and as a link in llms.txt.
   */
  appSiteUrl?: string;
  /**
   * Native apps only: the app's App Store page. When set, the detail page shows Apple's
   * official badge next to the app-site button instead of the "In Entwicklung" pill.
   */
  appStoreUrl?: string;
  /** Native apps only: the app's social channels, as icon links on the detail page (lib/social.ts). */
  socials?: SocialLink[];
}

export const MMP_CARDS: Record<string, MmpCardData> = {
  clearpath: {
    description:
      "Eine mentale Firewall gegen kognitive Verzerrungen. Du beschreibst eine anstehende Entscheidung — ClearPath spiegelt sie strukturiert zurück, benennt die Denkfallen darin und liefert eine zweite, nüchterne Perspektive, bevor du dich festlegst.",
    repoUrl: "https://github.com/neckarshore-mmps/clearpath",
    liveUrl: "https://clearpath.neckarshore.ai",
  },
  "snakeoil-check": {
    description:
      "Neutraler KI-Reality-Check für Online-Coachings und High-Ticket-Angebote. Zwölf Kriterien, ein ehrliches Urteil: Go, Vorsicht oder Lieber lassen. Prüft das Versprechen gegen nachvollziehbare Substanz statt gegen Marketing — bevor du investierst.",
    repoUrl: "https://github.com/neckarshore-mmps/snakeoil-check",
    liveUrl: "https://snakeoil.neckarshore.ai",
  },
  phonesis: {
    description:
      "Ein Archiv echter menschlicher Stimmen für Familien und Institutionen. Geführte Aufnahme, Consent-first, sicher verwahrt — eine Stimme, die bleibt, für die Menschen, die nach uns kommen.",
    repoUrl: "https://github.com/neckarshore-mmps/phonesis-voicebank",
  },
  // Rewritten 2026-10-15 from kaze.neckarshore.ai (its own public page), replacing the
  // 2026-08-06 placeholder ("scope is being sharpened"). Still no price, no subscription
  // wording and no release date — those stay off this surface until the Founder says so.
  kaze: {
    description:
      "Sperrt die Apps, zu denen du greifst, ohne es zu wollen — für eine Zeit, die du selbst bestimmst. Verlängern geht sofort, verkürzen nur mit einem Notfallcode per E-Mail. Keine Statistik, keine Serien, kein Konto.",
    appSiteUrl: "https://kaze.neckarshore.ai",
    // In the App Store since 2026-10-18 (DE, AT, CH). Plain store URL, no campaign token.
    appStoreUrl: "https://apps.apple.com/de/app/id6803057753",
    // TikTok later: add { platform: "tiktok", href: "https://www.tiktok.com/@<handle>" } here.
    socials: [{ platform: "instagram", href: "https://www.instagram.com/kaze.wind.app/" }],
  },
  // Facts from musclecat.neckarshore.ai (its own public page, 15.10.2026). No price and no
  // money model: the model is still moving (musclecat#276 vs the site's privacy pages).
  musclecat: {
    description:
      "Ein Trainingstagebuch fürs Studio: Sätze mit Gewicht und Wiederholungen eintragen, nach jedem Satz läuft die Pause. Am Ende einer Übung sagst du weniger, gleich oder mehr — und siehst, was du beim nächsten Mal auflegst.",
    appSiteUrl: "https://musclecat.neckarshore.ai",
    // In the App Store since 2026-10-15 (DE, AT, CH). Plain store URL, no campaign token.
    appStoreUrl: "https://apps.apple.com/de/app/id6800642926",
    // TikTok later: add { platform: "tiktok", href: "https://www.tiktok.com/@<handle>" } here.
    socials: [{ platform: "instagram", href: "https://www.instagram.com/musclecat.fitness.app/" }],
  },
  "local-seo-hub": {
    description:
      "AI-first Sichtbarkeits-Plattform für lokale Unternehmen. Rankings, Reviews und Citations fließen in einen einzigen Visibility Score (0–100) — gebaut für kleine Betriebe und die Agenturen, die sie betreuen.",
    repoUrl:
      "https://github.com/neckarshore-mmps/mmp-local-seo-performance-hub",
  },
  "prod-or-pretend": {
    description:
      'Ein konstruktiver Qualitäts-Spiegel für Tech-Hype. Prüft „an-einem-Wochenende-gebaut"-Claims gegen echte Produktionsstandards — Tests, Security, Skalierbarkeit, Doku. Kein Debunker, sondern eine Substanz-von-Luft-Unterscheidung für Entscheider.',
    repoUrl: "https://github.com/neckarshore-mmps/mmp-prod-or-pretend",
  },
  // NOTE: unlike the other MMP repos above, trustscope is PUBLIC (MIT) — the GitHub link
  // resolves for logged-out visitors, no sign-in/404 wall.
  trustscope: {
    description:
      "Ein deterministischer Vier-Säulen-Trust-Report für öffentliche Open-Source-Projekte. Du gibst ein GitHub-Repo an — TrustScope prüft Sicherheit & Lieferkette, Governance und Community auf Basis der OpenSSF Scorecard und legt die Kompromisse offen, statt sie hinter einer einzigen Punktzahl zu verstecken.",
    repoUrl: "https://github.com/neckarshore-mmps/trustscope",
    liveUrl: "https://trustscope.neckarshore.ai",
  },
  // Also PUBLIC (MIT) — same note as trustscope: the GitHub link resolves for logged-out
  // visitors. Grounded in the repo's own README; no claim here that is not in it.
  "md-viewer": {
    description:
      "Markdown sofort lesen, ohne einen Editor zu öffnen. Rechtsklick auf eine .md-Datei im Finder — sie öffnet sich in geteilter Ansicht: links gerendert, rechts der Quelltext mit Syntax-Hervorhebung. Denselben Viewer gibt es als Web-Zwilling, der die Datei vollständig im Browser verarbeitet.",
    repoUrl: "https://github.com/neckarshore-mmps/md-viewer",
    liveUrl: "https://md.neckarshore.ai",
  },
};
