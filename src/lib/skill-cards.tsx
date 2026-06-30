import {
  Layers,
  Mail,
  SpellCheck,
  Terminal,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/**
 * Rich OSS-tool card content — the detailed "skill card" surface (icon + badge +
 * description + capability list + license + GitHub link). Keyed by the SAME slug as
 * the matching `PORTFOLIO` skills item, so a detail page (/products/<slug>) can join
 * its card with zero mapping.
 *
 * WHY this lives here and NOT in `portfolio.ts`: `portfolio.ts` is imported by the
 * client `Nav` component, so anything added there ships in the client bundle. This
 * module is imported ONLY by server components (the skills sub-portal + future detail
 * pages), so the long-form copy never reaches the browser as JS. Mirrors the
 * routing-data (portfolio) vs. rich-content (server-only) split the portfolio.ts
 * header already prescribes.
 *
 * Adding/refining a card = one entry here. The card is rendered by <SkillCard>.
 */

export interface SkillCapability {
  /** Short monospace label rendered as a code chip (e.g. a sub-skill or a capability). */
  code: string;
  /** One-line description shown next to the chip. */
  text: string;
}

export interface SkillCardData {
  /** Lucide icon component shown top-left. */
  icon: LucideIcon;
  /** Optional pill next to the icon (e.g. "Beta"). */
  badge?: string;
  /** Card heading text. */
  title: string;
  /** One short clause (≈4–8 words) for the on-page overview table — what it solves. */
  summary: string;
  /** Lead paragraph under the heading. */
  description: string;
  /** Capability / sub-skill rows (chip + text). */
  capabilities: SkillCapability[];
  /** Optional italic footer note above the license row (e.g. "… weitere in Entwicklung"). */
  moreNote?: string;
  /** License label, footer-left (e.g. "MIT License"). Omit for non-OSS cards. */
  license?: string;
  /** GitHub repository URL — a GitHub button (footer-right) renders only when set. */
  repoUrl?: string;
  /** Analytics key for the GitHub button (only used when repoUrl is set). */
  track?: string;
  /**
   * Footer pill for cards that are NOT a downloadable OSS tool (e.g. "Referenz-Beispiel").
   * Stands in for the license/GitHub footer when there is no public repo.
   */
  footerBadge?: string;
  /**
   * Code visibility — drives the "Code" column on the skills overview table.
   * "public" = open-source repo on GitHub; "private" = bespoke / no public repo.
   */
  visibility: "public" | "private";
}

export const SKILL_CARDS: Record<string, SkillCardData> = {
  // 1 — reproduced 1:1 from the former landing-page OSS section.
  "obsidian-vault-autopilot": {
    icon: Terminal,
    badge: "Beta",
    title: "Obsidian Vault Autopilot",
    summary: "Sortiert, benennt und reichert Obsidian-Notizen automatisch an.",
    description:
      "AI-Vault-Automation für Obsidian × Claude Code. Sortiert die Inbox, benennt Notes um, füllt Frontmatter — vier Skills halten deinen Second Brain im Hintergrund auf Linie.",
    capabilities: [
      {
        code: "property-enrich",
        text: "Füllt fehlende Frontmatter automatisch — title, dates, source, priority. Fundament für alle anderen Skills.",
      },
      {
        code: "inbox-sort",
        text: "Verschiebt neue Notes aus dem Inbox-Root in den passenden Subfolder. Kein manuelles Filing mehr.",
      },
      {
        code: "note-rename",
        text: "Vergibt sinnvolle Filenames und fixt parallel sämtliche Wikilinks im Vault. Unauffällig im Hintergrund.",
      },
      {
        code: "property-describe",
        text: "Erzeugt knappe `description`-Frontmatter aus dem Inhalt. Beta — usable today, Polish-Loop läuft.",
      },
    ],
    moreNote: "… weitere in Entwicklung",
    license: "MIT License",
    repoUrl: "https://github.com/neckarshore-skills/obsidian-vault-autopilot",
    track: "oss_vault_autopilot",
    visibility: "public",
  },

  // 2 — reproduced 1:1 from the former landing-page OSS section.
  "social-scrapers": {
    icon: Layers,
    badge: "In Entwicklung",
    title: "Obsidian Social Scrapers",
    summary: "Instagram-, LinkedIn- und X-Profile als neutrale Vault-Briefings.",
    description:
      "Shared Core für drei Scraper-Plugins. Profile + Posts von Instagram, LinkedIn und X direkt in deinen Vault. Apify-Wrappers, AI-Polishing und Markdown-Rendering — Lego-Blocks, keine Duplikation.",
    capabilities: [
      {
        code: "shared core",
        text: "Python-Lego für die drei Scraper-Plugins. Apify-Wrapper, AI-Polish, Markdown-Rendering.",
      },
      {
        code: "linkedin-scraper",
        text: "Profile + Posts mit Engagement-Daten und neutralisiertem Briefing-Text statt Engagement-Bait.",
      },
      {
        code: "x-scraper",
        text: "Profile + Tweets, Threads und Quote-Tweets via offizielle X API v2 — ToS-konform, kein Web-Scrape.",
      },
      {
        code: "instagram-scraper",
        text: "Profile + Posts inklusive Reels-Transkription via lokalem Whisper.cpp — kein Cloud-Audio.",
      },
    ],
    moreNote: "… weitere in Entwicklung",
    repoUrl: "https://github.com/neckarshore-skills/obsidian-social-scrapers-common",
    track: "oss_social_scrapers",
    visibility: "private",
  },

  // 3 — NEW (first content draft, refine in the detail pass).
  "imap-mailbox-cleanup": {
    icon: Mail,
    badge: "Beta",
    title: "IMAP Mailbox Cleanup",
    summary: "Regelbasierte IMAP-Postfach-Triage, dry-run by default.",
    description:
      "Hybrid aus CLI und Claude-Skill für die Triage großer IMAP-Postfächer. Räumt nach klaren Regeln auf — dry-run als Default, jede Aktion audit-logged. Läuft gegen dein eigenes Postfach (IONOS getestet), ohne Cloud-Zwischenstopp.",
    capabilities: [
      {
        code: "dry-run",
        text: "Zeigt erst, was passieren würde — nichts wird ohne explizite Bestätigung verschoben oder gelöscht.",
      },
      {
        code: "rule-triage",
        text: "Sortiert, archiviert und löscht nach konfigurierbaren Regeln: Absender, Alter, Betreff, Ordner.",
      },
      {
        code: "audit-log",
        text: "Protokolliert jede Aktion nachvollziehbar — volle Transparenz, reproduzierbar.",
      },
      {
        code: "imap-native",
        text: "Spricht direkt per IMAP mit dem Server (IONOS getestet). Deine Mails verlassen das Postfach nicht.",
      },
    ],
    license: "MIT License",
    repoUrl: "https://github.com/neckarshore-skills/imap-mailbox-cleanup",
    track: "oss_imap_cleanup",
    visibility: "public",
  },

  // 4 — NEW (first content draft, refine in the detail pass).
  "ai-phrase-check": {
    icon: SpellCheck,
    badge: "Beta",
    title: "AI Phrase Check",
    summary: "Erkennt KI-typische Floskeln in DE/EN-Text, lokal.",
    description:
      "Erkennt KI-typische Floskeln in deutschem und englischem Text — die verräterischen Phrasen, an denen sich generierte Sprache erkennen lässt. Läuft als Claude-Skill lokal, kein Text verlässt deine Maschine.",
    capabilities: [
      {
        code: "phrase-detect",
        text: "Markiert KI-typische Floskeln im Text — 27 kuratierte Phrasen im MVP, erweiterbar.",
      },
      {
        code: "bilingual",
        text: "Funktioniert für deutschen und englischen Text gleichermaßen.",
      },
      {
        code: "local-only",
        text: "Läuft als Claude-Skill lokal — kein Text geht an einen Server.",
      },
      {
        code: "curated-list",
        text: "Phrasen-Liste als einfache, kuratierte Daten — neue Floskeln ohne Code-Änderung ergänzbar.",
      },
    ],
    license: "MIT License",
    repoUrl: "https://github.com/neckarshore-skills/ai-phrase-check",
    track: "oss_phrase_check",
    visibility: "public",
  },

  // 5 — NEW. A bespoke client skill from a PRIVATE barter deal → no public repo,
  // client name genericized ("Restaurant-Menüpflege"). Shown as a reference example,
  // not a downloadable OSS tool. If it later lands in a neckarshore-skills repo, set
  // repoUrl + license, flip visibility → "public" and drop footerBadge.
  "restaurant-menu-update": {
    icon: UtensilsCrossed,
    title: "Restaurant-Menüpflege",
    summary: "Menü-Update als geprüfter, reproduzierbarer Workflow.",
    description:
      "Verwandelt das wiederkehrende Menü-Update eines Restaurants in einen geprüften, reproduzierbaren Vorgang. Der Inhaber liefert die neue Karte als PDF, Foto oder Text — der Skill macht daraus publikationsreife Website-Inhalte, prüft jeden Allergen-Code gegen die Referenz, baut und lintet die Seite und öffnet einen fertigen Pull Request mit Vorschau-Deploy zur Abnahme.",
    capabilities: [
      {
        code: "quellen-parsing",
        text: "Liest die Karte aus PDF, Foto oder Freitext ein und zerlegt sie in einzelne Gerichte und Weine.",
      },
      {
        code: "allergen-check",
        text: "Gleicht jeden Allergen- und Zusatzstoff-Code (LMIV / ZZulV) gegen die zentrale Referenz ab — unbekannte Codes werden gemeldet, nie geraten.",
      },
      {
        code: "umlaut-fix",
        text: "Korrigiert ASCII-Schreibweisen aus alten Word-Vorlagen zu echten Umlauten und ß (Kaese → Käse); italienische Gerichtnamen bleiben im Original.",
      },
      {
        code: "pr-preview",
        text: "Build, Lint und Konsistenz-Check laufen automatisch; öffnet einen Pull Request mit Test-Plan und Vercel-Vorschau zur Freigabe.",
      },
    ],
    footerBadge: "Referenz-Beispiel",
    visibility: "private",
  },
};
