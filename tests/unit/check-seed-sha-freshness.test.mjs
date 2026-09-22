/**
 * Unit-Tor für scripts/check-seed-sha-freshness.mjs — den Klassifikator der SAAT-Frische.
 *
 * WAS HIER WIRKLICH GEPRÜFT WIRD, und warum es nicht "rechnet Abstände richtig" ist:
 *
 *   1. DER AUSGENOMMENE DARF NICHT WIE DER UNAUFFÄLLIGE AUSSEHEN. Zwölf der siebzehn Saat-Zeilen
 *      tragen `audited_sha: null` und sind vom Vergleich ausgenommen. Ein stiller Ausschluss wäre
 *      derselbe Defekt eine Ebene höher — genau der, den dieses Tor melden soll. Der Klassifikator
 *      muss sie also FÜHREN, nicht weglassen (#2033 Abnahmepunkt 2).
 *
 *   2. FAIL-CLOSED bei unmessbarer Zeile. Ein SHA, dessen Abstand nicht ermittelt werden konnte
 *      (Repo umbenannt, Token ohne Zugriff, SHA aus der Historie gefallen), ist NICHT "in Ordnung".
 *      Ein Wächter, der bei unlesbarer Eingabe schweigt, ist der Zustand, den er ablösen soll.
 *
 *   3. GRENZE IST STRIKT: exakt auf der Schwelle ist noch frisch. Sonst flattert der Alarm.
 *
 *   4. ZWEI ACHSEN, ODER-VERKNÜPFT. Commits UND Tage. Ein Repo kann in 200 Commits an einem Tag
 *      weiterlaufen (Bot-Stapel) oder in 3 Commits ein halbes Jahr liegen. Eine einzelne Achse
 *      verpasst je einen der beiden Fälle.
 *
 *   5. DIE TAGE-ACHSE GILT NUR BEI ABSTAND > 0 (Korrektur 2026-09-22, #241). Sie misst das Alter
 *      des auditierten COMMITS, nicht das Alter des AUDITS. Bei `aheadBy === 0` IST der Stempel der
 *      Kopf des Repos — die Zahl kann nicht gedriftet sein, weil es keinen Commit gibt, in dem sie
 *      hätte driften können. Vorher lief ein ruhendes Repo mit jedem Tag sicher in den Alarm, ohne
 *      dass sich irgendetwas an ihm geändert hätte. Gemessen an
 *      `neckarshore-ai/test-stats-action`: 0 Commits Abstand, 46 Tage, Schwelle 45 — rot am Tag
 *      seiner Eintragung. Die Zeile wird weiter GEFÜHRT und trägt ihr Alter im Grund, sie ist nur
 *      nicht mehr `stale`.
 *
 *   6. RUHEND HEISST BEIDE RICHTUNGEN 0 (Nachtrag 2026-09-22, #241, Befund Lenin). `ahead_by === 0`
 *      allein ist auch dann wahr, wenn der SHA ein NACHKOMME von main ist (`status: "behind"`) —
 *      ein Commit, der auf main nie gelandet ist, etwa ein PR-Kopf. Gemessen in diesem Repo:
 *      `compare(a91efcc...a25a7f2)` = ahead 0 / behind 6. Ohne `behind_by` wäre so ein Stempel
 *      dauerhaft „ruhend" und nie überfällig, obwohl er auf einen Stand zeigt, den niemand gemergt
 *      hat. Unbekanntes `behindBy` gilt FAIL-CLOSED als nicht ruhend.
 *
 * REGRESSIONSFALL, gemessen und nicht erfunden: `neckarshore-websites/neckarshore-website` trägt
 * `a1561cb` vom 2026-06-29. Am 2026-09-09 sind das 183 Commits und 72 Tage
 * (`gh api .../compare/a1561cb...main --jq .ahead_by`). Das Ticket #2033 nennt in seiner
 * Abnahmezeile 175 — die Zahl ist seit dem Zuschnitt weitergelaufen. Der Test nagelt deshalb die
 * EIGENSCHAFT fest (jede Schwelle unterhalb des Abstands feuert), nicht den Tagesmesswert.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_THRESHOLD_COMMITS,
  DEFAULT_THRESHOLD_DAYS,
  ageDays,
  classifySeedFreshness,
  formatVerdict,
} from "../../scripts/check-seed-sha-freshness.mjs";

const NOW = Date.parse("2026-09-09T12:00:00Z");
const daysAgo = (d) => new Date(NOW - d * 86_400_000).toISOString();

/** Bequemer Zeilenbau — nur die Felder, die der Klassifikator liest. */
const row = (repo, sha, aheadBy, shaDaysAgo, behindBy = 0) => ({
  repo,
  audited_sha: sha,
  aheadBy,
  behindBy,
  shaDateISO: shaDaysAgo === null ? null : daysAgo(shaDaysAgo),
});

test("ausgenommene Zeilen (audited_sha: null) werden GEFÜHRT, nicht weggelassen", () => {
  const v = classifySeedFreshness(
    [
      row("neckarshore-websites/goldoni-website", null, null, null),
      row("neckarshore-mmps/clearpath", null, null, null),
      row("neckarshore-skills/ai-phrase-check", "35044d1", 3, 2),
    ],
    NOW,
  );
  assert.equal(v.excluded.length, 2, "beide null-SHA-Zeilen müssen als ausgenommen erscheinen");
  assert.deepEqual(
    v.excluded.map((r) => r.repo).sort(),
    ["neckarshore-mmps/clearpath", "neckarshore-websites/goldoni-website"],
  );
  assert.equal(v.checked.length, 1, "nur die Zeile MIT SHA wird verglichen");
  assert.equal(v.stale.length, 0);
});

test("der Regressionsfall: eine Schwelle unterhalb des Abstands feuert IMMER", () => {
  const abstand = 183;
  const alter = 72;
  const r = row("neckarshore-websites/neckarshore-website", "a1561cb", abstand, alter);
  for (const schwelle of [1, 50, 100, abstand - 1]) {
    const v = classifySeedFreshness([r], NOW, { thresholdCommits: schwelle, thresholdDays: 9999 });
    assert.equal(v.stale.length, 1, `Schwelle ${schwelle} < ${abstand} muss feuern`);
  }
});

test("GRENZE IST STRIKT: exakt auf der Schwelle ist noch frisch, eins darüber nicht", () => {
  const auf = classifySeedFreshness([row("o/r", "abc", 100, 1)], NOW, {
    thresholdCommits: 100,
    thresholdDays: 9999,
  });
  assert.equal(auf.stale.length, 0, "exakt auf der Schwelle darf nicht feuern");

  const drueber = classifySeedFreshness([row("o/r", "abc", 101, 1)], NOW, {
    thresholdCommits: 100,
    thresholdDays: 9999,
  });
  assert.equal(drueber.stale.length, 1, "eins über der Schwelle muss feuern");
});

test("zwei Achsen, ODER-verknüpft — jede allein reicht zum Auslösen", () => {
  const opts = { thresholdCommits: 100, thresholdDays: 45 };

  const vieleCommits = classifySeedFreshness([row("o/r", "abc", 500, 1)], NOW, opts);
  assert.equal(vieleCommits.stale.length, 1, "Commit-Achse allein muss reichen");

  const langeHer = classifySeedFreshness([row("o/r", "abc", 2, 200)], NOW, opts);
  assert.equal(langeHer.stale.length, 1, "Tages-Achse allein muss reichen");

  const beidesFrisch = classifySeedFreshness([row("o/r", "abc", 2, 3)], NOW, opts);
  assert.equal(beidesFrisch.stale.length, 0, "beide unter der Schwelle = frisch");
});

test("TAGE-ACHSE GILT NUR BEI ABSTAND > 0: ein ruhendes Repo ist nicht stale (#241)", () => {
  // aheadBy === 0 heisst: der auditierte SHA IST der Kopf. Es gibt keinen Commit, in dem die
  // Zahl haette driften koennen — also ist Alter allein kein Befund.
  const ruhend = classifySeedFreshness([row("o/ruhend", "893875d", 0, 200)], NOW, {
    thresholdCommits: 100,
    thresholdDays: 45,
  });
  assert.equal(ruhend.stale.length, 0, "ruhendes Repo darf nicht stale sein");
  assert.equal(ruhend.checked.length, 1, "es wird trotzdem GEFUEHRT, nicht ausgenommen");
  assert.match(
    ruhend.checked[0].reason,
    /kein Commit Abstand zu main/,
    "das Alter muss im Grund sichtbar bleiben, sonst verschweigt das Tor es",
  );

  // Gegenprobe: ein einziger Commit Abstand macht dieselbe Zeile wieder stale.
  const bewegt = classifySeedFreshness([row("o/bewegt", "893875d", 1, 200)], NOW, {
    thresholdCommits: 100,
    thresholdDays: 45,
  });
  assert.equal(bewegt.stale.length, 1, "ein Commit Abstand genuegt, die Tage-Achse greift wieder");
  assert.match(bewegt.stale[0].reason, /200 Tage > 45/);
});

test("RUHEND HEISST BEIDE RICHTUNGEN 0: ein Nachkomme von main ist NICHT ruhend (#241, Nachtrag)", () => {
  const opts = { thresholdCommits: 100, thresholdDays: 45 };

  // Stempel auf main, kein Abstand: ruhend, also nicht stale.
  const aufMain = classifySeedFreshness([row("o/r", "abc", 0, 200, 0)], NOW, opts);
  assert.equal(aufMain.stale.length, 0);

  // Stempel auf einem PR-Kopf: ahead 0, aber 6 Commits, die main nicht hat. Die Tage-Achse
  // greift wieder, und der Grund benennt den Zustand.
  const nebenMain = classifySeedFreshness([row("o/r", "abc", 0, 200, 6)], NOW, opts);
  assert.equal(nebenMain.stale.length, 1, "ein Stand abseits von main darf nicht als ruhend gelten");
  assert.match(nebenMain.stale[0].reason, /nicht auf main liegen/);

  // FAIL-CLOSED: behindBy unbekannt -> nicht ruhend, Tage-Achse greift wie vorher.
  const unbekannt = classifySeedFreshness(
    [{ repo: "o/r", audited_sha: "abc", aheadBy: 0, shaDateISO: daysAgo(200) }],
    NOW,
    opts,
  );
  assert.equal(unbekannt.stale.length, 1, "unbekanntes behindBy darf keine Ausnahme erzeugen");
});

test("ein Stempel abseits von main ist ueberfaellig OHNE Schwelle (#241, Nachtrag)", () => {
  // Der eigentliche Fall: JUNG und abseits von main. Beide Schwellen weit offen, damit nur die
  // eine Eigenschaft uebrigbleibt. Die Verfaelschungsprobe dieses Nachtrags hat genau hier
  // zuerst GRUEN gemeldet — ein frischer Zweigkopf lief durch, weil nur ein Grund gesetzt war
  // und kein Befund. Ein solcher Stempel kann seine Auditierbarkeits-Behauptung nie belegen:
  // der genannte Stand liegt nicht auf main und kann dort nie ankommen.
  const v = classifySeedFreshness([row("o/r", "abc", 0, 0, 1)], NOW, {
    thresholdCommits: 9999,
    thresholdDays: 9999,
  });
  assert.equal(v.stale.length, 1, "abseits von main ist selbst der Befund, nicht erst mit Alter");
  assert.match(v.stale[0].reason, /nicht auf main liegen/);

  // Gegenprobe in derselben Lage: auf main, jung, weite Schwellen -> frisch.
  const sauber = classifySeedFreshness([row("o/r", "abc", 0, 0, 0)], NOW, {
    thresholdCommits: 9999,
    thresholdDays: 9999,
  });
  assert.equal(sauber.stale.length, 0);
});

test("DIVERGED ist auch abseits von main — behind_by > 0 allein entscheidet (#241, Nachtrag)", () => {
  const opts = { thresholdCommits: 9999, thresholdDays: 9999 };

  // Der vierte Zustand: der Stempel traegt einen Commit, den main nicht hat, UND main ist ihm
  // voraus. Genau die Lage, in die ein "behind"-Stempel von selbst hineinwaechst, sobald main
  // einen eigenen Commit bekommt. Eine Fassung mit `aheadBy === 0 &&` hat ihn verfehlt, der
  // Schutz waere also mit der Zeit zerfallen statt zu halten. Gemessen an 73142f0, dem
  // squash-gemergten Kopf von PR #267: ahead 2 / behind 1 / "diverged".
  const diverged = classifySeedFreshness([row("o/r", "abc", 3, 0, 1)], NOW, opts);
  assert.equal(diverged.stale.length, 1, "diverged ist abseits von main, unabhaengig von aheadBy");
  assert.match(diverged.stale[0].reason, /nicht auf main liegen/);

  // Vollstaendigkeit der vier Zustaende, damit keiner unbemerkt durchfaellt:
  const identisch = classifySeedFreshness([row("o/r", "abc", 0, 0, 0)], NOW, opts);
  assert.equal(identisch.stale.length, 0, "identical: frisch");
  const nurVoraus = classifySeedFreshness([row("o/r", "abc", 7, 0, 0)], NOW, opts);
  assert.equal(nurVoraus.stale.length, 0, "ahead unter der Schwelle: frisch, das ist Drift-Sache");
  const zurueck = classifySeedFreshness([row("o/r", "abc", 0, 0, 2)], NOW, opts);
  assert.equal(zurueck.stale.length, 1, "behind: abseits von main");
});

test("die Commits-Achse bleibt von der Korrektur unberuehrt", () => {
  // Ein ruhendes Repo KANN die Commits-Achse nicht ueberschreiten (0 > N ist nie wahr), aber die
  // Achse darf durch die Korrektur auch nicht stumpf geworden sein.
  const v = classifySeedFreshness([row("o/r", "abc", 500, 1)], NOW, {
    thresholdCommits: 100,
    thresholdDays: 9999,
  });
  assert.equal(v.stale.length, 1);
  assert.match(v.stale[0].reason, /500 Commits > 100/);
});

test("FAIL-CLOSED: ein SHA ohne ermittelbaren Abstand ist stale, nicht still", () => {
  const v = classifySeedFreshness([row("o/verschwunden", "deadbee", null, null)], NOW);
  assert.equal(v.unknown.length, 1, "die Zeile muss als unmessbar geführt werden");
  assert.equal(v.stale.length, 1, "und sie MUSS in stale landen — Schweigen wäre der Defekt");
  assert.equal(v.excluded.length, 0, "unmessbar ist NICHT dasselbe wie ausgenommen");
});

test("unmessbar und ausgenommen sind getrennte Töpfe", () => {
  const v = classifySeedFreshness(
    [row("o/ohne-sha", null, null, null), row("o/kaputt", "abc", null, null)],
    NOW,
  );
  assert.equal(v.excluded.length, 1);
  assert.equal(v.unknown.length, 1);
  assert.notEqual(v.excluded[0].repo, v.unknown[0].repo);
});

test("stale ist schlimmster-zuerst sortiert", () => {
  const v = classifySeedFreshness(
    [row("o/mittel", "a", 300, 1), row("o/schlimm", "b", 900, 1), row("o/knapp", "c", 101, 1)],
    NOW,
    { thresholdCommits: 100, thresholdDays: 9999 },
  );
  assert.deepEqual(v.stale.map((r) => r.repo), ["o/schlimm", "o/mittel", "o/knapp"]);
});

test("ageDays: fehlender/kaputter Zeitstempel ergibt null, nicht NaN oder 0", () => {
  assert.equal(ageDays(null, NOW), null);
  assert.equal(ageDays("kein-datum", NOW), null);
  assert.equal(ageDays(daysAgo(5), NOW), 5);
});

test("die Vorgabewerte sind Zahlen im Repo, nicht im Kopf", () => {
  assert.equal(typeof DEFAULT_THRESHOLD_COMMITS, "number");
  assert.equal(typeof DEFAULT_THRESHOLD_DAYS, "number");
  assert.ok(DEFAULT_THRESHOLD_COMMITS > 0 && DEFAULT_THRESHOLD_DAYS > 0);
});

test("formatVerdict nennt die ausgenommenen Zeilen ausdrücklich", () => {
  const v = classifySeedFreshness(
    [row("o/ohne", null, null, null), row("o/alt", "abc", 500, 1)],
    NOW,
    { thresholdCommits: 100, thresholdDays: 9999 },
  );
  const text = formatVerdict(v);
  assert.match(text, /ausgenommen/i, "der Verdikt-Text muss den Ausschluss benennen");
  assert.match(text, /o\/alt/, "und den Befund");
});
