import type { ReactNode } from "react";
import { BlogFigure, FigureHeading, NewChip, TierChip } from "../BlogFigure";

/**
 * The three figures of "Wir testen nicht mehr alles" (2026-11), rebuilt as HTML from Lenin's
 * A4 sheets (Teststrategie-Kaze-MuscleCat-A4.html, pages 2, 3 and 6, Stand 27.10.2026) instead
 * of shipping the PNGs: text a reader, a screen reader and a search engine can all read.
 *
 * THE WORDING IS LENIN'S, lifted from the sheet's HTML. Deliberate deviations, each named in the
 * pull request for the Founder's look:
 *   - page 2: the boxes "Nicht-funktional" and "UI-Budget" are left out; register, level rule
 *     and the "Wer den Bereich bestimmt" note stay.
 *   - page 3: only the execution plan (the figure's caption is "Welcher Testlauf wann läuft").
 *     The selection flow, the rules, the learning loop and the residual risks are not here;
 *     the residual risks are in the article text. Row 2 loses "Flaky-Regel siehe Seite 4",
 *     because the blog has no page 4. The source line, which cites the history rule that is
 *     left out, goes with it.
 *   - MuscleCat's area 8 (usage counting and consent, TM1) is not on the sheet; it was added
 *     to the plan on 2026-10-27 and is included here on the Founder's word of 2026-11-05.
 */

type Tier = "TM1" | "TM2" | "TM3";
type Area = { name: string; detail?: string; tier: Tier };

const MUSCLECAT: Area[] = [
  { name: "Datenintegrität", detail: "Backup, Migration, Katalog, Seeds", tier: "TM1" },
  { name: "Training erfassen", detail: "Sätze, Pausentimer, Trainingsende", tier: "TM1" },
  { name: "Kauf und Berechtigung", detail: "Paywall, Gratismonat", tier: "TM1" },
  // Area 8, not on the sheet of 27.10.: added to the plan by Wendy on 2026-10-27 (planning
  // main, commit e39c6710). Founder 2026-11-05: include it. The wording is Linus' translation.
  { name: "Nutzungszählung und Einwilligung", tier: "TM1" },
  { name: "Verlauf und Statistik", detail: "Verknüpfung per UUID", tier: "TM2" },
  { name: "Pläne, Stammdaten", tier: "TM2" },
  { name: "Navigation, Onboarding, Einstellungen", tier: "TM2" },
  { name: "Texte, Layout, Erscheinungsbild", tier: "TM3" },
];

const KAZE: Area[] = [
  { name: "Sperre", detail: "Shield startet und endet pünktlich", tier: "TM1" },
  { name: "Notfallcode", detail: "Relay-Mail, Entsperren", tier: "TM1" },
  { name: "Strict-Mode-Asymmetrie", tier: "TM1" },
  { name: "Kauf und Abo", detail: "Paywall, Ask to Buy", tier: "TM1" },
  { name: "Erststart und Setup", detail: "keine Sperre ohne Ausweg", tier: "TM1" },
  { name: "Layout", detail: "große Textgrößen, iPhone SE", tier: "TM2" },
  { name: "Texte, Farben, Splash", tier: "TM3" },
];

/** Top of the pyramid first, as on the sheet. Widths only apply from md up. */
const LEVELS = [
  {
    name: "Benutzerabnahmetest am Gerät",
    what: "Gefühl, Haptik, echtes Suspendieren, Kauf, Relay-Mail",
    look: "border-2 border-primary bg-white text-primary dark:border-text-primary dark:bg-transparent dark:text-text-primary",
    width: "md:w-[64%]",
  },
  {
    name: "UI-Journey (XCUITest)",
    what: "eine Journey je Bereich, OS-Integration, a11y-Audit",
    look: "bg-primary text-white dark:bg-accent-bright dark:text-deep-space",
    width: "md:w-[73%]",
  },
  {
    name: "Snapshot-Test",
    isNew: true,
    what: "Layout, Dark Mode, Dynamic Type, kleine Displays",
    look: "bg-band-teal text-primary dark:bg-band-teal-dark dark:text-text-primary",
    width: "md:w-[82%]",
  },
  {
    name: "Komponentenintegrationstest",
    what: "Daten, Persistenz, Migration, Backup, Upgrade-Test",
    look: "bg-band-teal/60 text-primary dark:bg-band-teal-dark/70 dark:text-text-primary",
    width: "md:w-[91%]",
  },
  {
    name: "Komponententest",
    what: "Rechnung, Regel, Zustand, Sortierung, Texte",
    look: "bg-band-teal/30 text-primary dark:bg-band-teal-dark/40 dark:text-text-primary",
    width: "md:w-full",
  },
];

function RegisterTable({ app, areas }: { app: string; areas: Area[] }) {
  return (
    <table className="w-full border-collapse text-[15px] leading-snug">
      <thead>
        <tr className="border-b-2 border-primary/80 text-left dark:border-text-secondary/60">
          <th scope="col" className="py-2 pr-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary dark:text-text-primary">
            {app}
          </th>
          <th scope="col" className="w-20 py-2 text-right font-heading text-sm font-semibold uppercase tracking-wider text-primary dark:text-text-primary">
            Stufe
          </th>
        </tr>
      </thead>
      <tbody>
        {areas.map((area) => (
          <tr key={area.name} className="border-b border-primary/10 dark:border-white/10">
            <td className="py-2.5 pr-3 text-neutral-dark/85 max-md:hyphens-auto max-md:[overflow-wrap:anywhere] dark:text-text-secondary">
              <strong className="font-semibold text-primary dark:text-text-primary">{area.name}</strong>
              {area.detail && <> · {area.detail}</>}
            </td>
            <td className="py-2.5 text-right align-top">
              <TierChip tier={area.tier} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RisikoregisterFigure() {
  return (
    <BlogFigure
      id="teststrategie-risikoregister"
      caption="Risikoregister und Teststufen-Regel für Kaze und MuscleCat"
      source="Startbelegung aus Wendys Impact-Ranking und dem Bug-Ledger seit 27.08.2026 · Kaze Erststart TM1 nach Wendy, 27.10. · MuscleCat Nutzungszählung und Einwilligung TM1 nach Wendy, 27.10."
    >
      <FigureHeading>Risikoregister je App</FigureHeading>
      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-6">
        <RegisterTable app="MuscleCat" areas={MUSCLECAT} />
        <RegisterTable app="Kaze" areas={KAZE} />
      </div>
      <p className="mt-6 rounded-xl bg-neutral-light px-4 py-4 text-[15px] leading-relaxed text-neutral-dark/85 dark:bg-white/5 dark:text-text-secondary">
        <strong className="font-semibold text-primary dark:text-text-primary">
          Wer den Bereich einer Änderung bestimmt:
        </strong>{" "}
        mechanisch aus den geänderten Pfaden, vereinigt mit Wendys Bereichs-Label am Ticket. Nie die
        Selbstangabe des Autors. Die Risikostufe ergibt sich qualitativ per Matrix aus Schadensausmaß
        (Wendys Ranking) und Eintrittswahrscheinlichkeit (Bug-Ledger, Änderungshäufigkeit). Jeder
        Bereich hat eine{" "}
        <strong className="font-semibold text-primary dark:text-text-primary">Journey-Stufe</strong> (1
        bis 3 Abläufe) und eine{" "}
        <strong className="font-semibold text-primary dark:text-text-primary">Detailstufe</strong>.
      </p>

      <div className="mt-10">
        <FigureHeading>Teststufen-Regel: jedes Kriterium so tief wie möglich</FigureHeading>
        <ol className="mt-4 flex flex-col items-center gap-2">
          {LEVELS.map((level) => (
            <li
              key={level.name}
              className={`flex w-full flex-col gap-1 rounded-lg px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 ${level.width} ${level.look}`}
            >
              <span className="font-heading text-[15px] font-semibold">
                {level.name}
                {level.isNew && <NewChip />}
              </span>
              <span className="text-sm leading-snug md:text-right">{level.what}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex flex-col gap-1 text-sm text-muted sm:flex-row sm:justify-between dark:text-text-tertiary">
          <span>unten: Millisekunden, maschinell</span>
          <span>oben: Minuten bis Stunden, Mensch</span>
        </p>
      </div>
    </BlogFigure>
  );
}

const RUNS = [
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
];

/**
 * One card per run instead of a five-column table: the sheet's table is 4 text columns wide,
 * which on a 393px phone either overflows or wraps into one-word columns. A card with a
 * definition list reads the same on every width and keeps the column names next to each value.
 */
export function TestlaeufeFigure() {
  return (
    <BlogFigure id="teststrategie-testlaeufe" caption="Welcher Testlauf wann läuft">
      <ol className="flex flex-col gap-3">
        {RUNS.map((run, index) => (
          <li
            key={run.name}
            className="rounded-xl border border-primary/10 px-4 py-4 dark:border-white/10"
          >
            <p className="flex items-baseline gap-3 font-heading text-base font-semibold text-primary dark:text-text-primary">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-white tabular-nums dark:bg-accent-bright dark:text-deep-space">
                {index + 1}
              </span>
              {run.name}
            </p>
            <dl className="mt-3 grid gap-3 text-[15px] leading-snug md:grid-cols-3 md:gap-5">
              {[
                ["Inhalt", run.content],
                ["Auslöser", run.trigger],
                ["Bestanden, wenn", run.passed],
              ].map(([term, value]) => (
                <div key={term}>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary">
                    {term}
                  </dt>
                  <dd className="mt-1 text-neutral-dark/85 dark:text-text-secondary">{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
    </BlogFigure>
  );
}

const RENAMED: { before: string; now: ReactNode }[] = [
  {
    before: "Rule B, Teillauf, partial run",
    now: (
      <>
        <strong>Story-Testlauf</strong> (Hausbegriff): Abnahmetests der Story, selektiver Regressionstest,
        Smoke-Test
      </>
    ),
  },
  {
    before: "Volllauf, Nachtlauf",
    now: (
      <>
        <strong>vollständiger Regressionstest</strong>; „nachts“ oder „vor Upload“ sind Auslöser im
        Testausführungsplan
      </>
    ),
  },
  {
    before: "CI-Lauf, Unit-Lauf",
    now: (
      <>
        <strong>Komponententest</strong>, <strong>Komponentenintegrationstest</strong>
      </>
    ),
  },
  {
    before: "Progressionstest, Geräteabnahme",
    now: (
      <>
        <strong>Benutzerabnahmetest</strong> und <strong>explorativer Test</strong> mit{" "}
        <strong>Test-Charta</strong>
      </>
    ),
  },
  {
    before: "Story-Tests des Builders",
    now: (
      <>
        <strong>Abnahmetests</strong> aus abnahmetestgetriebener Entwicklung
      </>
    ),
  },
  {
    before: "grün",
    now: (
      <>
        <strong>bestanden</strong>; für den Release <strong>Endekriterien erfüllt</strong>
      </>
    ),
  },
  {
    before: "Kritikalitäts-Tier",
    now: (
      <>
        <strong>Risikostufe</strong>; TM1 bis TM3 bleiben als Kürzel
      </>
    ),
  },
  {
    before: "„Test Charter“ (Org-Dokument)",
    now: (
      <>
        <strong>Testrichtlinie</strong> und Teststrategie. Die ISTQB-Test-Charta leitet eine einzelne
        Testsitzung
      </>
    ),
  },
];

const KEPT: { term: string; isNew?: boolean; meaning: string }[] = [
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
];

// German compounds ("Komponentenintegrationstest") are wider than a 393px phone's column:
// hyphenate by the page's lang="de", and break anywhere as the last resort.
const cell = "py-2.5 pr-3 align-top text-[15px] leading-snug max-md:hyphens-auto max-md:[overflow-wrap:anywhere]";
const headCell =
  "py-2 pr-3 text-left font-heading text-sm font-semibold uppercase tracking-wider text-primary dark:text-text-primary";

export function VokabularFigure() {
  return (
    <BlogFigure
      id="teststrategie-vokabular"
      caption="Unser Vokabular nach ISTQB-Glossar v4.8.1"
      source={
        <>
          Quellen: ISTQB-Glossar v4.8.1 und CTFL-Lehrplan v4.0.1 · Apple WWDC21-10296, WWDC22-110361,
          WWDC24-10179, WWDC25-344 · Elbaum, Rothermel, Penix (FSE 2014) · Meta Predictive Test
          Selection · Google TAP · pointfreeco swift-snapshot-testing · Anthropic Claude Code Best
          Practices · eigene Messung an musclecat @1d0c254 und kaze @6edbc94
        </>
      }
    >
      <p className="text-[15px] leading-relaxed text-neutral-dark/85 dark:text-text-secondary">
        Geprüft gegen das offizielle ISTQB-Glossar v4.8.1 (API, 1129 Begriffe). Umbenannt wird nur
        vorwärts: neue Texte, Skripte beim nächsten Anfassen, Tickets ab jetzt. „Progressionstest“
        und „Flaky Test“ stehen nicht im Glossar.
      </p>

      <table className="mt-6 w-full border-collapse [&_strong]:font-semibold [&_strong]:text-primary dark:[&_strong]:text-text-primary">
        <thead>
          <tr className="border-b-2 border-primary/80 dark:border-text-secondary/60">
            <th scope="col" className={`${headCell} w-[38%]`}>
              Bisher im Haus
            </th>
            <th scope="col" className={headCell}>
              Jetzt
            </th>
          </tr>
        </thead>
        <tbody>
          {RENAMED.map((row) => (
            <tr key={row.before} className="border-b border-primary/10 dark:border-white/10">
              <td className={`${cell} text-muted dark:text-text-tertiary`}>{row.before}</td>
              <td className={`${cell} text-neutral-dark/85 dark:text-text-secondary`}>{row.now}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-primary/80 dark:border-text-secondary/60">
            <th scope="col" className={`${headCell} w-[38%]`}>
              Bleibt oder neu
            </th>
            <th scope="col" className={headCell}>
              Bedeutung
            </th>
          </tr>
        </thead>
        <tbody>
          {KEPT.map((row) => (
            <tr key={row.term} className="border-b border-primary/10 dark:border-white/10">
              <td className={cell}>
                <strong className="font-semibold text-primary dark:text-text-primary">{row.term}</strong>
                {row.isNew && <NewChip />}
              </td>
              <td className={`${cell} text-neutral-dark/85 dark:text-text-secondary`}>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-6 rounded-xl bg-neutral-light px-4 py-4 text-[15px] leading-relaxed text-neutral-dark/85 dark:bg-white/5 dark:text-text-secondary">
        <strong className="font-semibold text-primary dark:text-text-primary">
          Hausbegriffe, ausdrücklich kein ISTQB:
        </strong>{" "}
        Story-Testlauf, Journey-Stufe, Detailstufe, Story, Upgrade-Test. Jeder setzt sich aus
        ISTQB-Begriffen zusammen.
      </p>
    </BlogFigure>
  );
}
