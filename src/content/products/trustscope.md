---
name: "TrustScope"
headline: "TrustScope — der deterministische Trust-Report für öffentliche Open-Source-Projekte."
definition: "TrustScope prüft ein öffentliches GitHub-Repository und verdichtet das Ergebnis zu einem deterministischen Vier-Säulen-Trust-Report — Sicherheit & Lieferkette, Governance und Community, dazu eine bewusst offen gelassene vierte Säule zur funktionalen Qualität — und versteckt die Kompromisse nie hinter einer einzigen Punktzahl."
metaDescription: "Deterministischer Vier-Säulen-Trust-Report für öffentliche GitHub-Repos: Sicherheit, Governance, Community — ohne einzelne Gesamt-Punktzahl."
liveUrl: "https://trustscope.neckarshore.ai"
applicationCategory: "DeveloperApplication"
---

## Das Problem

Wer ein Open-Source-Tool in die eigene Lieferkette holt, verlässt sich auf fremden Code — und muss abschätzen, wie weit er ihm trauen kann. Ein Stern-Zähler oder eine grüne Badge sagt darüber wenig. Die eigentlich wichtigen Fragen — Ist es sicher gebaut? Steht ein verlässliches Projekt dahinter? Wird es in einem Jahr noch gepflegt? — bleiben unbeantwortet oder verschwinden hinter einer einzigen Zahl.

## Die vier Säulen

TrustScope beantwortet diese Fragen getrennt, weil jede eine andere ist:

1. **Funktionale Qualität** — bewusst *nicht* bewertet. Ob ein Tool gut gebaut ist, ist ein Handwerksurteil; TrustScope täuscht es nicht vor, sondern hält die Säule ehrlich offen.
2. **Sicherheit & Lieferkette** — die vollständige OpenSSF Scorecard: Branch-Protection, signierte Releases, Dependency-Hygiene und mehr.
3. **Trust & Governance** — Lizenz, Security-Policy und der verantwortliche Owner: Kann man dem Projekt hinter dem Code trauen?
4. **Community & Nachhaltigkeit** — Wartung, Beitragende und Aktivität als Lebenszyklus-Phase, nicht als Schulnote.

## Warum keine einzige Punktzahl

Kein aggregierter Gesamt-Score — mit Absicht. Jede Säule beantwortet eine andere Frage; sie zu einer Zahl zu verrechnen, versteckt genau den Kompromiss, den man gerade abwägt.

## Wie funktioniert TrustScope?

1. Du gibst ein öffentliches GitHub-Repository an.
2. TrustScope wertet es deterministisch aus — auf Basis der OpenSSF Scorecard und der öffentlichen GitHub-Daten — und legt die vier Säulen offen.
3. Zu jedem Befund gibt es konkrete, konstruktive Verbesserungsvorschläge. Auf Wunsch reichst du sie mit einem Klick als freundliches Issue beim Projekt ein — als du selbst, mit sichtbarer „via TrustScope"-Kennzeichnung.

## Live ausprobieren

[trustscope.neckarshore.ai](https://trustscope.neckarshore.ai) — kostenlos und ohne Anmeldung. Ein GitHub-Login brauchst du nur, wenn du Vorschläge direkt als Issue einreichen willst.

## Status & Roadmap

Live und quelloffen (MIT) unter [github.com/neckarshore-mmps/trustscope](https://github.com/neckarshore-mmps/trustscope). Das Fundament — die deterministische Report-Engine, die Scorecard-Anbindung und der Issue-Flow — läuft in der Produktion. Geplant sind eine durchsuchbare Report-Galerie und gespeicherte Verläufe.

## Wie dieser Text entstand

KI-beschleunigt entworfen, vom Gründer redigiert — dieselbe Arbeitsweise, die Neckarshore baut.
