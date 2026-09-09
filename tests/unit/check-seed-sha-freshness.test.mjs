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
const row = (repo, sha, aheadBy, shaDaysAgo) => ({
  repo,
  audited_sha: sha,
  aheadBy,
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
