/**
 * The content of the three figures of "Wir testen nicht mehr alles" — ONE source for the page
 * (Teststrategie.tsx) and for the Markdown export (markdown.ts), so a reader's AI gets the same
 * tables the reader sees, not an empty marker.
 *
 * Rebuilt from Lenin's A4 sheets (Teststrategie-Kaze-MuscleCat-A4.html, pages 2, 3 and 6,
 * Stand 27.10.2026). THE WORDING IS LENIN'S. Deliberate deviations, each named in PR #355:
 *   - page 2: the boxes "Nicht-funktional" and "UI-Budget" are left out; register, level rule
 *     and the "Wer den Bereich bestimmt" note stay.
 *   - page 3: only the execution plan (the figure's caption is "Welcher Testlauf wann läuft").
 *     Row 2 loses "Flaky-Regel siehe Seite 4", because the blog has no page 4; the sheet's
 *     source line, which cites the history rule that is left out, goes with it.
 *   - MuscleCat's area 8 (usage counting and consent, TM1) is not on the sheet; Wendy added it
 *     to the plan on 2026-10-27 (planning main, e39c6710), and the Founder said include it on
 *     2026-11-05. Its German wording is Linus' translation.
 *
 * Bold text is stored as segments (`{ b: "…" }`), so the page renders <strong> and the export
 * renders **…** from the same data.
 */

export type Tier = "TM1" | "TM2" | "TM3";
/** Text with bold runs: a plain string, or `{ b }` for a bold one. */
export type Rich = (string | { b: string })[];

export interface Area {
  name: string;
  detail?: string;
  tier: Tier;
}

export const REGISTER = {
  caption: "Risikoregister und Teststufen-Regel für Kaze und MuscleCat",
  registerHeading: "Risikoregister je App",
  levelsHeading: "Teststufen-Regel: jedes Kriterium so tief wie möglich",
  source:
    "Startbelegung aus Wendys Impact-Ranking und dem Bug-Ledger seit 27.08.2026 · Kaze Erststart TM1 nach Wendy, 27.10. · MuscleCat Nutzungszählung und Einwilligung TM1 nach Wendy, 27.10.",
  apps: [
    {
      app: "MuscleCat",
      areas: [
        { name: "Datenintegrität", detail: "Backup, Migration, Katalog, Seeds", tier: "TM1" },
        { name: "Training erfassen", detail: "Sätze, Pausentimer, Trainingsende", tier: "TM1" },
        { name: "Kauf und Berechtigung", detail: "Paywall, Gratismonat", tier: "TM1" },
        { name: "Nutzungszählung und Einwilligung", tier: "TM1" },
        { name: "Verlauf und Statistik", detail: "Verknüpfung per UUID", tier: "TM2" },
        { name: "Pläne, Stammdaten", tier: "TM2" },
        { name: "Navigation, Onboarding, Einstellungen", tier: "TM2" },
        { name: "Texte, Layout, Erscheinungsbild", tier: "TM3" },
      ] as Area[],
    },
    {
      app: "Kaze",
      areas: [
        { name: "Sperre", detail: "Shield startet und endet pünktlich", tier: "TM1" },
        { name: "Notfallcode", detail: "Relay-Mail, Entsperren", tier: "TM1" },
        { name: "Strict-Mode-Asymmetrie", tier: "TM1" },
        { name: "Kauf und Abo", detail: "Paywall, Ask to Buy", tier: "TM1" },
        { name: "Erststart und Setup", detail: "keine Sperre ohne Ausweg", tier: "TM1" },
        { name: "Layout", detail: "große Textgrößen, iPhone SE", tier: "TM2" },
        { name: "Texte, Farben, Splash", tier: "TM3" },
      ] as Area[],
    },
  ],
  note: [
    { b: "Wer den Bereich einer Änderung bestimmt:" },
    " mechanisch aus den geänderten Pfaden, vereinigt mit Wendys Bereichs-Label am Ticket. Nie die Selbstangabe des Autors. Die Risikostufe ergibt sich qualitativ per Matrix aus Schadensausmaß (Wendys Ranking) und Eintrittswahrscheinlichkeit (Bug-Ledger, Änderungshäufigkeit). Jeder Bereich hat eine ",
    { b: "Journey-Stufe" },
    " (1 bis 3 Abläufe) und eine ",
    { b: "Detailstufe" },
    ".",
  ] as Rich,
  /** Top of the pyramid first, as on the sheet. */
  levels: [
    { name: "Benutzerabnahmetest am Gerät", what: "Gefühl, Haptik, echtes Suspendieren, Kauf, Relay-Mail" },
    { name: "UI-Journey (XCUITest)", what: "eine Journey je Bereich, OS-Integration, a11y-Audit" },
    { name: "Snapshot-Test", isNew: true, what: "Layout, Dark Mode, Dynamic Type, kleine Displays" },
    { name: "Komponentenintegrationstest", what: "Daten, Persistenz, Migration, Backup, Upgrade-Test" },
    { name: "Komponententest", what: "Rechnung, Regel, Zustand, Sortierung, Texte" },
  ] as { name: string; what: string; isNew?: boolean }[],
  axisBottom: "unten: Millisekunden, maschinell",
  axisTop: "oben: Minuten bis Stunden, Mensch",
};

export const RUNS = {
  caption: "Welcher Testlauf wann läuft",
  columns: ["Inhalt", "Auslöser", "Bestanden, wenn"] as const,
  runs: [
    {
      name: "Komponententest-Lauf",
      content: "alle Unit- und Integrationstests, StoreKit, statische Wächter, ab Phase 2 Snapshots",
      trigger: "jeder Push auf einen PR, CI auf der M5",
      passed: "Zahlen aus xcresult, 0 fehlgeschlagen, jedes Bundle hat Tests ausgeführt",
    },
    {
      name: "Story-Testlauf",
      content:
        "Abnahmetests der Story, selektiver Regressionstest (Journeys der betroffenen Bereiche), Smoke-Test",
      trigger: "PR-Head reviewreif; inerte oder TM3-Nachbesserungen nutzen das Ergebnis je Tree weiter",
      passed: "bestanden",
    },
    {
      name: "Vollständiger Regressionstest",
      content: "alle UI-Klassen, Journey- und Detailstufe",
      trigger:
        "vor jedem Upload (Archive-Guard). Volle Pässe alle 2,6 Tage (MuscleCat) bzw. 3,1 Tage (Kaze)",
      passed: "bestanden; rot: rote Klassen den Bereichen der gemergten PRs zuordnen",
    },
    {
      name: "Benutzerabnahmetest",
      content: "nur Gerätekriterien plus explorative Testsitzung mit Test-Charta je TM1-Bereich",
      trigger: "je TestFlight-Build",
      passed: "Founder-Urteil je Ticket",
    },
    {
      name: "Fehlernachtest",
      content: "genau der fehlgeschlagene Test oder Schritt",
      trigger: "nach einem Fix",
      passed: "bestanden",
    },
  ],
};

export const VOCABULARY = {
  caption: "Unser Vokabular nach ISTQB-Glossar v4.8.1",
  lead: "Geprüft gegen das offizielle ISTQB-Glossar v4.8.1 (API, 1129 Begriffe). Umbenannt wird nur vorwärts: neue Texte, Skripte beim nächsten Anfassen, Tickets ab jetzt. „Progressionstest“ und „Flaky Test“ stehen nicht im Glossar.",
  renamedHeader: ["Bisher im Haus", "Jetzt"] as const,
  renamed: [
    {
      before: "Rule B, Teillauf, partial run",
      now: [{ b: "Story-Testlauf" }, " (Hausbegriff): Abnahmetests der Story, selektiver Regressionstest, Smoke-Test"],
    },
    {
      before: "Volllauf, Nachtlauf",
      now: [
        { b: "vollständiger Regressionstest" },
        "; „nachts“ oder „vor Upload“ sind Auslöser im Testausführungsplan",
      ],
    },
    {
      before: "CI-Lauf, Unit-Lauf",
      now: [{ b: "Komponententest" }, ", ", { b: "Komponentenintegrationstest" }],
    },
    {
      before: "Progressionstest, Geräteabnahme",
      now: [{ b: "Benutzerabnahmetest" }, " und ", { b: "explorativer Test" }, " mit ", { b: "Test-Charta" }],
    },
    {
      before: "Story-Tests des Builders",
      now: [{ b: "Abnahmetests" }, " aus abnahmetestgetriebener Entwicklung"],
    },
    {
      before: "grün",
      now: [{ b: "bestanden" }, "; für den Release ", { b: "Endekriterien erfüllt" }],
    },
    {
      before: "Kritikalitäts-Tier",
      now: [{ b: "Risikostufe" }, "; TM1 bis TM3 bleiben als Kürzel"],
    },
    {
      before: "„Test Charter“ (Org-Dokument)",
      now: [
        { b: "Testrichtlinie" },
        " und Teststrategie. Die ISTQB-Test-Charta leitet eine einzelne Testsitzung",
      ],
    },
  ] as { before: string; now: Rich }[],
  keptHeader: ["Bleibt oder neu", "Bedeutung"] as const,
  kept: [
    { term: "Fehlernachtest", meaning: "bleibt: Bestätigung nach einer Fehlerbehebung" },
    { term: "Testablauf", meaning: "bleibt: Testfälle in Ausführungsreihenfolge" },
    {
      term: "Verfälschungsprobe",
      meaning: "bleibt Hausbegriff; Fehlereinpflanzung meint im Glossar etwas anderes",
    },
    { term: "Flaky Test", meaning: "Branchenbegriff, kein ISTQB-Eintrag" },
    {
      term: "Fehlerfindungsanteil",
      isNew: true,
      meaning: "Fehler einer Teststufe im Verhältnis zu allen später gefundenen",
    },
    { term: "Performanztest", isNew: true, meaning: "nicht-funktionaler Test: Startzeit, Speicher" },
    { term: "Abwärtskompatibilität", isNew: true, meaning: "die App läuft auf früheren Plattformversionen" },
    { term: "Upgrade-Test", isNew: true, meaning: "Hausbegriff: Wartungstest plus Installierbarkeit" },
  ] as { term: string; meaning: string; isNew?: boolean }[],
  houseTerms: [
    { b: "Hausbegriffe, ausdrücklich kein ISTQB:" },
    " Story-Testlauf, Journey-Stufe, Detailstufe, Story, Upgrade-Test. Jeder setzt sich aus ISTQB-Begriffen zusammen.",
  ] as Rich,
  source:
    "Quellen: ISTQB-Glossar v4.8.1 und CTFL-Lehrplan v4.0.1 · Apple WWDC21-10296, WWDC22-110361, WWDC24-10179, WWDC25-344 · Elbaum, Rothermel, Penix (FSE 2014) · Meta Predictive Test Selection · Google TAP · pointfreeco swift-snapshot-testing · Anthropic Claude Code Best Practices · eigene Messung an musclecat @1d0c254 und kaze @6edbc94",
};
