#!/usr/bin/env bash
# sync-test-scope-reasons.sh — emit public/test-scope-reasons.json: why repositories carry no
# tests in the estate number (neckarshore-website #370, block 3; data form by MASCHIN 2026-11-14).
#
# HAND-SYNCED, like sync-disclosure-config.sh. Only RELEASED names appear as rows (public repos and
# the products in disclosure-config.json named_private); every other private repository is a COUNT,
# never a name. The file lives under public/, so check-private-slug-leak.sh scans it.
#
# Consistency: the page never stores the totals. tests/unit/test-scope-reasons.test.mjs asserts
# Σ(rows + private counts) == stats.json repos − estate-test-scope.json repos on the committed data;
# at render a mismatch hides the sums and shows one line instead (lib/test-scope-reasons.ts).
#
# Determinism: jq -S, so a re-run is a no-op diff. Usage:
#   bash scripts/sync-test-scope-reasons.sh            # writes public/test-scope-reasons.json
#   bash scripts/sync-test-scope-reasons.sh --stdout   # prints it, writes nothing (unit test)
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="public/test-scope-reasons.json"
MODE="${1:-file}"

# Measured 2026-11-16 (Linus) by the group-1 rule against each repository's main tree; to be
# re-measured by Lenin on the day it ships (#370 go-live condition). Wording: Engels.
REASONS='{
  "measured": "2026-11-16",
  "mismatch_line": "Diese Aufschlüsselung wird gerade neu gemessen. Die Testzahlen weiter oben sind davon nicht betroffen.",
  "groups": [
    {
      "key": "no-tests-needed",
      "title": "Braucht keine Tests",
      "rule": "Kein ausführbarer Code im Hauptzweig (keine .ts-, .js-, .py-, .sh- oder .swift-Datei) und kein automatischer Ablauf, der Code startet.",
      "rows": [
        { "name": "Prod or Pretend", "reason": "Enthält nur Beschreibung und Konfiguration, keinen ausführbaren Code." },
        { "name": "neckarshore-plugins", "reason": "Verzeichnis von Erweiterungen: nur Beschreibung und Konfiguration, kein ausführbarer Code." }
      ],
      "private_count": 7,
      "private_sentence": "Dokumentation, Planung und Inhalte ohne ausführbaren Code."
    },
    {
      "key": "tests-not-counted",
      "title": "Tests vorhanden, noch nicht gezählt",
      "rows": [
        { "name": "Kaze", "reason": "Automatische Tests laufen bei jeder Änderung; ihre Zahl wird noch nicht an die Gesamtzahl gemeldet." },
        { "name": "Kaze Website", "reason": "Automatische Tests laufen bei jeder Änderung; ihre Zahl wird noch nicht an die Gesamtzahl gemeldet." },
        { "name": "live-checks", "reason": "Automatische Tests laufen bei jeder Änderung; ihre Zahl wird noch nicht an die Gesamtzahl gemeldet." },
        { "name": "MuscleCat", "reason": "Automatische Tests laufen bei jeder Änderung; ihre Zahl wird noch nicht an die Gesamtzahl gemeldet." },
        { "name": "MuscleCat Website", "reason": "Automatische Tests laufen bei jeder Änderung; ihre Zahl wird noch nicht an die Gesamtzahl gemeldet." },
        { "name": "Paperless Autopilot", "reason": "Automatische Tests laufen bei jeder Änderung; ihre Zahl wird noch nicht an die Gesamtzahl gemeldet." },
        { "name": "Phonesis", "reason": "Automatische Tests laufen bei jeder Änderung; ihre Zahl wird noch nicht an die Gesamtzahl gemeldet." }
      ],
      "private_count": 10,
      "private_sentence": "Tests sind vorhanden, der Zähler ist noch nicht angeschlossen; bei zwei davon laufen sie noch nicht automatisch."
    },
    {
      "key": "no-tests-yet",
      "title": "Noch keine Tests",
      "rows": [],
      "private_count": 6,
      "private_sentence": "Hilfsskripte (Prüf-, Berichts- und Abgleichskripte), kein Produktcode."
    }
  ]
}'

JSON=$(printf '%s' "$REASONS" | jq -S '.')
if [ "$MODE" = "--stdout" ]; then
  printf '%s\n' "$JSON"
else
  printf '%s\n' "$JSON" > "$OUT"
  echo "synced $OUT — $(printf '%s' "$JSON" | jq '[.groups[] | (.rows | length) + .private_count] | add') repositories" >&2
fi
