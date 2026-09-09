#!/usr/bin/env node
/**
 * check-seed-sha-freshness.mjs — der Wächter über die EINGABEN des Sammlers (#2033).
 *
 * WARUM ES DAS GIBT: `estate-test-scope-seed.json` trägt pro Zeile ein `audited_sha` und begründet
 * das in seinem eigenen `_sha_comment` mit der Auditierbarkeits-Doktrin des Test-Charters. Nichts
 * auf dem Bestand hat dieses SHA je gegen `origin/main` des jeweiligen Repos verglichen. Der
 * Sammler hat seit dem 2026-08-28 einen Wächter für seine EIGENE Frische
 * (`check-stats-staleness.mjs`, Signal `updatedAt`) — für die Frische seiner EINGABEN hatte er
 * keinen. Gemessen am 2026-09-09: die Zeile `neckarshore-website` steht auf einem Commit vom
 * 2026-06-29, das sind 183 Commits und 72 Tage, und dieselbe Zeile behauptet, auditierbar zu sein.
 *
 * ABGRENZUNG ZU check-stats-staleness.mjs, weil die beiden leicht verwechselt werden:
 *   - jenes misst `updatedAt` der GEHOLTEN Produzenten-stats.json — "hat die CI zuletzt emittiert?"
 *   - dieses misst den Abstand des `audited_sha` zu `origin/main` — "worauf beruft sich die Zahl?"
 * Beide können gleichzeitig grün und rot sein: ein Produzent kann täglich emittieren, während sein
 * Audit-Stempel ein Vierteljahr alt ist. Das ist genau der Fall, der hier gefangen wird.
 *
 * ZWEI ACHSEN, ODER-VERKNÜPFT (Commits ODER Tage). Eine einzelne Achse verpasst je einen realen
 * Fall: ein Bot-Stapel schiebt 200 Commits an einem Tag, ein ruhiges Repo liegt in 3 Commits ein
 * halbes Jahr. Der Wächter meldet, was zuerst reißt, und nennt beide Zahlen.
 *
 * DREI TÖPFE, und ihre Trennung ist die eigentliche Arbeit:
 *   checked   — Zeile hat ein SHA und der Abstand ist ermittelt
 *   excluded  — `audited_sha: null`, vom Vergleich AUSGENOMMEN. Wird ausdrücklich gemeldet:
 *               ein stiller Ausschluss wäre derselbe Defekt eine Ebene höher (#2033 Abnahme 2).
 *   unknown   — SHA vorhanden, Abstand NICHT ermittelbar (Repo umbenannt, Token ohne Zugriff,
 *               SHA aus der Historie gefallen). FAIL-CLOSED: zählt als Befund, nicht als "in
 *               Ordnung". Ein Wächter, der bei unlesbarer Eingabe schweigt, ist der Zustand,
 *               den er ablösen soll.
 *
 * Reiner Kern (`classifySeedFreshness`) ist Liste-rein -> Klassifikation-raus: deterministisch,
 * ohne fs, ohne Uhr. Der CLI-Mantel unten spritzt `now` ein und holt die Abstände. Spiegelt die
 * Trennung aus check-stats-staleness.mjs (fehleranfällige Logik unit-getort, I/O im Aufrufer).
 *
 * CLI:
 *   node scripts/check-seed-sha-freshness.mjs <seed.json> [schwelleCommits] [schwelleTage]
 * Der Pfad ist ein ARGUMENT und zeigt auf die ausgelieferte, eingecheckte Saat im Arbeitsbaum —
 * nicht auf eine im Bau erzeugte Kopie (#2033 Abnahme 4). Es gibt keinen Ableitungsschritt
 * dazwischen, der die Datei unterwegs reparieren könnte.
 *
 * Exit-Code: 0 wenn alles frisch, 1 bei mindestens einem Befund. Anders als der Sammler-Wächter
 * darf dieses Tor rot gehen — es blockiert keine tägliche Veröffentlichung, es ist selbst der Lauf.
 *
 * Test: node --test tests/unit/check-seed-sha-freshness.test.mjs
 */

import fs from "node:fs";

/** Schwellen als Zahlen IM REPO, nicht im Kopf (#2033 Zuschnitt). Herleitung:
 *  100 Commits — knapp unter dem gemessenen Ist-Abstand von 183, damit der bestehende Befund
 *  sofort feuert, und weit über dem, was ein normal laufendes Repo zwischen zwei Durchstichen
 *  ansammelt. 45 Tage — anderthalb Monate; ein Audit-Stempel, der ein Quartal überlebt, ist per
 *  Test-Charter kein Beleg mehr. Beide sind über workflow_dispatch überschreibbar; 0 heißt
 *  "alles ist überfällig" und ist der Hebel für die Verfälschungsprobe. */
export const DEFAULT_THRESHOLD_COMMITS = 100;
export const DEFAULT_THRESHOLD_DAYS = 45;

/**
 * ageDays — volle Tage zwischen einem ISO-Zeitstempel und einem Jetzt (ms).
 * Gibt null bei fehlendem/unlesbarem Datum zurück — ein unbekanntes Alter ist selbst ein Signal
 * und wird vom Klassifikator als unmessbar behandelt, nie als still übersprungen.
 */
export function ageDays(iso, nowMs) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((nowMs - t) / 86_400_000);
}

/**
 * classifySeedFreshness — reine Klassifikation über die Saat-Zeilen.
 * @param {{repo:string, audited_sha:string|null, aheadBy:number|null, shaDateISO:string|null}[]} rows
 * @param {number} nowMs  Epochen-Millisekunden, die als "jetzt" gelten
 * @param {{thresholdCommits?:number, thresholdDays?:number}} [opts]
 * @returns {{thresholdCommits:number, thresholdDays:number, checked:Array, excluded:Array,
 *            unknown:Array, stale:Array}}
 *   `stale` ist schlimmster-zuerst sortiert (nach Commit-Abstand; unmessbare Zeilen führen).
 */
export function classifySeedFreshness(rows, nowMs, opts = {}) {
  const thresholdCommits = opts.thresholdCommits ?? DEFAULT_THRESHOLD_COMMITS;
  const thresholdDays = opts.thresholdDays ?? DEFAULT_THRESHOLD_DAYS;

  const checked = [];
  const excluded = [];
  const unknown = [];

  for (const r of rows ?? []) {
    // Ausgenommen: kein Audit-Stempel, also nichts zu vergleichen. Wird GEFÜHRT, nicht verworfen.
    if (!r.audited_sha) {
      excluded.push({ repo: r.repo, reason: "audited_sha: null — kein Durchstich, nichts zu vergleichen" });
      continue;
    }

    const age = ageDays(r.shaDateISO, nowMs);

    // FAIL-CLOSED: SHA da, Messung nicht. Das ist ein Befund, keine Ruhe.
    if (r.aheadBy === null || r.aheadBy === undefined) {
      const u = {
        repo: r.repo,
        sha: r.audited_sha,
        aheadBy: null,
        ageDays: age,
        stale: true,
        reason: r.error ?? "Abstand nicht ermittelbar (Repo umbenannt, kein Zugriff, oder SHA aus der Historie gefallen)",
      };
      unknown.push(u);
      continue;
    }

    // Grenze ist STRIKT: exakt auf der Schwelle ist noch frisch, sonst flattert der Alarm.
    const commitsOver = r.aheadBy > thresholdCommits;
    const daysOver = age !== null && age > thresholdDays;

    const reasons = [];
    if (commitsOver) reasons.push(`${r.aheadBy} Commits > ${thresholdCommits}`);
    if (daysOver) reasons.push(`${age} Tage > ${thresholdDays}`);

    checked.push({
      repo: r.repo,
      sha: r.audited_sha,
      aheadBy: r.aheadBy,
      ageDays: age,
      stale: commitsOver || daysOver,
      reason: reasons.join(" und ") || "frisch",
    });
  }

  // Unmessbare führen: sie sind der schlimmste Zustand, weil über sie gar nichts bekannt ist.
  const stale = [...unknown, ...checked.filter((c) => c.stale).sort((a, b) => b.aheadBy - a.aheadBy)];

  return { thresholdCommits, thresholdDays, checked, excluded, unknown, stale };
}

/**
 * formatVerdict — eine Zeile pro Befund plus die AUSDRÜCKLICHE Ausschluss-Zeile.
 * Der Ausschluss steht immer im Text, auch wenn alles frisch ist: die Zahl der ungeprüften Zeilen
 * ist die ehrlichste Angabe über die Reichweite dieses Tors.
 */
export function formatVerdict(v) {
  const zeilen = [];

  if (v.stale.length === 0) {
    zeilen.push(
      `Alle ${v.checked.length} Saat-Zeilen mit Audit-Stempel sind frisch ` +
        `(Schwelle: ${v.thresholdCommits} Commits / ${v.thresholdDays} Tage).`,
    );
  } else {
    zeilen.push(
      `${v.stale.length} von ${v.checked.length + v.unknown.length} Saat-Zeilen mit Audit-Stempel ` +
        `sind überfällig (Schwelle: ${v.thresholdCommits} Commits / ${v.thresholdDays} Tage):`,
    );
    for (const s of v.stale) {
      const abstand = s.aheadBy === null ? "unmessbar" : `${s.aheadBy} Commits`;
      const alter = s.ageDays === null ? "Alter unbekannt" : `${s.ageDays} Tage`;
      zeilen.push(`  - ${s.repo} @${s.sha} — ${abstand}, ${alter} — ${s.reason}`);
    }
  }

  // Nie weglassen. Ein stiller Ausschluss wäre derselbe Defekt eine Ebene höher.
  zeilen.push(
    `${v.excluded.length} Zeilen sind vom Vergleich AUSGENOMMEN (audited_sha: null) und damit ` +
      `von diesem Tor NICHT abgedeckt:`,
  );
  for (const e of v.excluded) zeilen.push(`  - ${e.repo} — ${e.reason}`);

  return zeilen.join("\n");
}

/* ------------------------------- CLI-Mantel ------------------------------- */

/** Holt Abstand + Commit-Datum für ein SHA. Trennt "nicht erreichbar" sauber von "0 Commits". */
async function measure(repo, sha, token) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "seed-sha-watchdog" };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/compare/${sha}...HEAD`, { headers });
    if (!res.ok) return { aheadBy: null, shaDateISO: null, error: `GitHub-API ${res.status}` };
    const j = await res.json();
    // `ahead_by` aus Sicht des Vergleichs-Kopfes = wie viele Commits main dem SHA voraus ist.
    return {
      aheadBy: typeof j.ahead_by === "number" ? j.ahead_by : null,
      shaDateISO: j.base_commit?.commit?.committer?.date ?? null,
      error: null,
    };
  } catch (e) {
    return { aheadBy: null, shaDateISO: null, error: `Abruf fehlgeschlagen: ${e.message}` };
  }
}

async function main() {
  const [seedPath, cArg, dArg] = process.argv.slice(2);
  if (!seedPath) {
    console.error("usage: check-seed-sha-freshness.mjs <seed.json> [schwelleCommits] [schwelleTage]");
    process.exit(2);
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const token = process.env.STATS_PAT || process.env.GH_TOKEN || "";

  const rows = [];
  for (const r of seed.repos ?? []) {
    if (!r.audited_sha) {
      rows.push({ repo: r.repo, audited_sha: null, aheadBy: null, shaDateISO: null });
      continue;
    }
    const m = await measure(r.repo, r.audited_sha, token);
    rows.push({ repo: r.repo, audited_sha: r.audited_sha, ...m });
  }

  const v = classifySeedFreshness(rows, Date.now(), {
    thresholdCommits: cArg === undefined || cArg === "" ? undefined : Number(cArg),
    thresholdDays: dArg === undefined || dArg === "" ? undefined : Number(dArg),
  });

  const text = formatVerdict(v);
  console.log(text);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Saat-SHA-Frische\n\n\`\`\`\n${text}\n\`\`\`\n`);
  }
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `stale=${v.stale.length > 0}\nstale_count=${v.stale.length}\nexcluded_count=${v.excluded.length}\n`,
    );
  }

  process.exit(v.stale.length > 0 ? 1 : 0);
}

// Nur ausführen, wenn direkt aufgerufen — der Test importiert die reinen Funktionen.
if (process.argv[1] && process.argv[1].endsWith("check-seed-sha-freshness.mjs")) {
  await main();
}
