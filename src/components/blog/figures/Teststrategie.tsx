import { BlogFigure, FigureHeading, NewChip, TierChip } from "../BlogFigure";
import { REGISTER, RUNS, VOCABULARY, type Area, type Rich } from "./teststrategie-data";

/**
 * The three figures of "Wir testen nicht mehr alles", rendered from teststrategie-data.ts —
 * the same data the Markdown export reads (markdown.ts). Wording, provenance and the named
 * deviations from Lenin's sheets live in that data file.
 */

const strong = "font-semibold text-primary dark:text-text-primary";

function RichText({ value }: { value: Rich }) {
  return (
    <>
      {value.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : (
          <strong key={i} className={strong}>
            {part.b}
          </strong>
        ),
      )}
    </>
  );
}

/** Pyramid look, top first. Widths only from md up; on a phone every level is full width. */
const LEVEL_LOOK = [
  {
    look: "border-2 border-primary bg-white text-primary dark:border-text-primary dark:bg-transparent dark:text-text-primary",
    width: "md:w-[64%]",
  },
  { look: "bg-primary text-white dark:bg-accent-bright dark:text-deep-space", width: "md:w-[73%]" },
  { look: "bg-band-teal text-primary dark:bg-band-teal-dark dark:text-text-primary", width: "md:w-[82%]" },
  { look: "bg-band-teal/60 text-primary dark:bg-band-teal-dark/70 dark:text-text-primary", width: "md:w-[91%]" },
  { look: "bg-band-teal/30 text-primary dark:bg-band-teal-dark/40 dark:text-text-primary", width: "md:w-full" },
];

// German compounds ("Komponentenintegrationstest") are wider than a 393px phone's column:
// hyphenate by the page's lang="de", and break anywhere as the last resort. Phones only — on a
// desktop the same rule broke "Auslö-ser" where it fitted.
const wrapOnPhone = "max-md:hyphens-auto max-md:[overflow-wrap:anywhere]";
// Alignment is NOT part of the shared class: two text-align utilities on one element would be
// decided by stylesheet order, not by intent.
const headBase =
  "py-2 font-heading text-sm font-semibold uppercase tracking-wider text-primary dark:text-text-primary";
const headCell = `${headBase} pr-3 text-left`;
const cell = `py-2.5 pr-3 align-top text-[15px] leading-snug ${wrapOnPhone}`;
const rowLine = "border-b border-primary/10 dark:border-white/10";
const headLine = "border-b-2 border-primary/80 dark:border-text-secondary/60";
const noteBox =
  "mt-6 rounded-xl bg-neutral-light px-4 py-4 text-[15px] leading-relaxed text-neutral-dark/85 dark:bg-white/5 dark:text-text-secondary";

function RegisterTable({ app, areas }: { app: string; areas: Area[] }) {
  return (
    <table className="w-full border-collapse text-[15px] leading-snug">
      <thead>
        <tr className={headLine}>
          <th scope="col" className={headCell}>
            {app}
          </th>
          <th scope="col" className={`${headBase} w-20 text-right`}>
            Stufe
          </th>
        </tr>
      </thead>
      <tbody>
        {areas.map((area) => (
          <tr key={area.name} className={rowLine}>
            <td className={`py-2.5 pr-3 text-neutral-dark/85 dark:text-text-secondary ${wrapOnPhone}`}>
              <strong className={strong}>{area.name}</strong>
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
    <BlogFigure id="teststrategie-risikoregister" caption={REGISTER.caption} source={REGISTER.source}>
      <FigureHeading>{REGISTER.registerHeading}</FigureHeading>
      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-6">
        {REGISTER.apps.map((a) => (
          <RegisterTable key={a.app} app={a.app} areas={a.areas} />
        ))}
      </div>
      <p className={noteBox}>
        <RichText value={REGISTER.note} />
      </p>

      <div className="mt-10">
        <FigureHeading>{REGISTER.levelsHeading}</FigureHeading>
        <ol className="mt-4 flex flex-col items-center gap-2">
          {REGISTER.levels.map((level, i) => (
            <li
              key={level.name}
              className={`flex w-full flex-col gap-1 rounded-lg px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 ${LEVEL_LOOK[i].width} ${LEVEL_LOOK[i].look}`}
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
          <span>{REGISTER.axisBottom}</span>
          <span>{REGISTER.axisTop}</span>
        </p>
      </div>
    </BlogFigure>
  );
}

/**
 * One card per run instead of the sheet's five-column table, which on a 393px phone either
 * overflows or wraps into one-word columns. The definition list keeps each column's name next
 * to its value on every width.
 */
export function TestlaeufeFigure() {
  return (
    <BlogFigure id="teststrategie-testlaeufe" caption={RUNS.caption}>
      <ol className="flex flex-col gap-3">
        {RUNS.runs.map((run, index) => (
          <li key={run.name} className="rounded-xl border border-primary/10 px-4 py-4 dark:border-white/10">
            <p className="flex items-baseline gap-3 font-heading text-base font-semibold text-primary dark:text-text-primary">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-white tabular-nums dark:bg-accent-bright dark:text-deep-space">
                {index + 1}
              </span>
              {run.name}
            </p>
            <dl className="mt-3 grid gap-3 text-[15px] leading-snug md:grid-cols-3 md:gap-5">
              {[run.content, run.trigger, run.passed].map((value, i) => (
                <div key={RUNS.columns[i]}>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-muted dark:text-text-tertiary">
                    {RUNS.columns[i]}
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

export function VokabularFigure() {
  return (
    <BlogFigure id="teststrategie-vokabular" caption={VOCABULARY.caption} source={VOCABULARY.source}>
      <p className="text-[15px] leading-relaxed text-neutral-dark/85 dark:text-text-secondary">{VOCABULARY.lead}</p>

      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr className={headLine}>
            <th scope="col" className={`${headCell} w-[38%]`}>
              {VOCABULARY.renamedHeader[0]}
            </th>
            <th scope="col" className={headCell}>
              {VOCABULARY.renamedHeader[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {VOCABULARY.renamed.map((row) => (
            <tr key={row.before} className={rowLine}>
              <td className={`${cell} text-muted dark:text-text-tertiary`}>{row.before}</td>
              <td className={`${cell} text-neutral-dark/85 dark:text-text-secondary`}>
                <RichText value={row.now} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className={headLine}>
            <th scope="col" className={`${headCell} w-[38%]`}>
              {VOCABULARY.keptHeader[0]}
            </th>
            <th scope="col" className={headCell}>
              {VOCABULARY.keptHeader[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {VOCABULARY.kept.map((row) => (
            <tr key={row.term} className={rowLine}>
              <td className={cell}>
                <strong className={strong}>{row.term}</strong>
                {row.isNew && <NewChip />}
              </td>
              <td className={`${cell} text-neutral-dark/85 dark:text-text-secondary`}>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={noteBox}>
        <RichText value={VOCABULARY.houseTerms} />
      </p>
    </BlogFigure>
  );
}
