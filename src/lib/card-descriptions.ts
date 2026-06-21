import { MMP_CARDS } from "./mmp-cards";
import { SKILL_CARDS } from "./skill-cards";

/**
 * Single source for the ≈3-line card description of any portfolio item — used identically
 * on the /products portal teaser AND the per-category sub-portals (Founder decision
 * 2026-06-21: "identische Kachelbeschriftungen auf Produktseite und Unterseite sind ok").
 *
 * Reuses the rich descriptions that already exist for MMPs (mmp-cards) and Skills
 * (skill-cards), and adds the Websites + Flagship copy here. Server-only (pulls from the
 * server-only card modules); callers are Server Components (portal + sub-portals) that pass
 * the resolved STRING to <ProductCard> — no client-bundle leak.
 *
 * Falls back to the item's short `tagline` (in ProductCard) when no long description exists.
 */

// Websites tier — external client/own projects. Honest ≈3-line framing per site.
const WEBSITE_DESCRIPTIONS: Record<string, string> = {
  neckarshore:
    "Diese Seite selbst — die Web-Präsenz von neckarshore.ai. KI-beschleunigt gebaut, statisch ausgeliefert, ohne Tracking-Cookies und mit Lighthouse-Bestwerten. Das Schaufenster und zugleich der Proof of Concept unserer eigenen Arbeitsweise.",
  "ristorante-goldoni":
    "Web-Präsenz für ein italienisches Restaurant — Speise- und Weinkarte, Empfehlungen und FAQ, alles per Cmd+K durchsuchbar. Dieselbe Bauweise wie unsere Produkte: schnell, sauber, DSGVO-by-Design, ohne Cookie-Banner-Ballast.",
  "oakwood-golf-club":
    "Web-Präsenz für einen Golfclub — von der Mitglieder-Information über einen redaktionellen Blog bis zur Cmd+K-Suche, ein Mitglieder-Portal ist in Arbeit. KI-beschleunigt gebaut, DSGVO-by-Design.",
  rauhut:
    "Persönliche Web-Präsenz — schlank, schnell und ohne Tracking. Ein kleines, sauber gebautes Schaufenster, nach denselben Maßstäben wie alles andere hier.",
};

// Flagship tier — the bespoke Omnopsis page carries the full story; this is the card teaser.
const FLAGSHIP_DESCRIPTIONS: Record<string, string> = {
  omnopsis:
    "Omnopsis Documentor+X ist unsere KI-first Documentation Engine für Engineering-Teams: Dokumentation, die sich aus dem Code heraus aktuell hält. Fail-closed, BYOLLM und DSGVO-by-Design — gebaut für den anspruchsvollen Mittelstand.",
};

export function cardDescription(slug: string): string | undefined {
  return (
    MMP_CARDS[slug]?.description ??
    SKILL_CARDS[slug]?.description ??
    WEBSITE_DESCRIPTIONS[slug] ??
    FLAGSHIP_DESCRIPTIONS[slug]
  );
}
