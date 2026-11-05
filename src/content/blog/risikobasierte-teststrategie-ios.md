---
title: "Wir testen nicht mehr alles. Wir testen, was brechen kann."
seoTitle: "Risikobasierte Teststrategie für iOS-Apps mit KI-Agenten"
description: "Über 99 % unserer Testzeit steckten in UI-Tests. Mit Risikobereichen, Test-first und ISTQB-Vokabular soll der Testlauf je Story auf 15 Minuten sinken."
dek: "Wie wir die Teststrategie für zwei iOS-Apps neu aufgesetzt haben, mit KI-Agenten als Entwicklern und ISTQB als gemeinsamer Sprache."
date: "2026-11-05"
author: "German Rauhut"
cover:
  src: "/blog/risikobasierte-teststrategie-ios/titelbild.webp"
  width: 1920
  height: 1080
  alt: "Titelgrafik: Links der Satz „Wir testen nicht mehr alles. Wir testen, was brechen kann.“ Rechts zwei Testpyramiden. Vorher steht sie auf dem Kopf, mit 99 Prozent der Testzeit in UI-Tests. Das Ziel ist eine Pyramide mit breitem Fundament: jedes Kriterium so tief wie möglich."
  caption: "Vorher: 99 % der Testzeit in UI-Tests. Ziel: jedes Kriterium so tief wie möglich."
  credit: "Grafik: neckarshore.ai, erstellt mit KI-Unterstützung (Claude)"
ogImage: "/blog/risikobasierte-teststrategie-ios/og.jpg"
aiNote: "Dieser Artikel ist mit KI-Unterstützung entstanden und von mir redigiert."
categories:
  - "Testmanagement"
  - "KI-Agenten"
# Weiterführend: the sources of Lenin's sheet 6, each URL checked on 2026-11-05 (HTTP 200 and
# page title; the ACM DOI via Crossref, since dl.acm.org blocks automated fetches). Our own
# page leads, the rest is A→Z by title.
further:
  - title: "Wie wir testen – neckarshore.ai"
    url: "/test-management"
  - title: "Author fast and reliable tests for Xcode Cloud – Apple, WWDC22"
    url: "https://developer.apple.com/videos/play/wwdc2022/110361/"
  - title: "Certified Tester Foundation Level (CTFL) v4.0 – ISTQB"
    url: "https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/"
  - title: "Diagnose unreliable code with test repetitions – Apple, WWDC21"
    url: "https://developer.apple.com/videos/play/wwdc2021/10296/"
  - title: "ISTQB Glossary – ISTQB"
    url: "https://glossary.istqb.org/"
  - title: "Meet Swift Testing – Apple, WWDC24"
    url: "https://developer.apple.com/videos/play/wwdc2024/10179/"
  - title: "Predictive test selection – Engineering at Meta"
    url: "https://engineering.fb.com/2018/11/21/developer-tools/predictive-test-selection/"
  - title: "Record, replay, and review: UI automation with Xcode – Apple, WWDC25"
    url: "https://developer.apple.com/videos/play/wwdc2025/344/"
  - title: "swift-snapshot-testing – Point-Free, GitHub"
    url: "https://github.com/pointfreeco/swift-snapshot-testing"
  - title: "Taming Google-Scale Continuous Testing – Google Research"
    url: "https://research.google/pubs/taming-google-scale-continuous-testing/"
  - title: "Techniques for improving regression testing in continuous integration development environments – Elbaum, Rothermel, Penix, FSE 2014"
    url: "https://doi.org/10.1145/2635868.2635910"
draft: false
---

Bei neckarshore.ai entwickeln wir zwei iOS-Apps: Kaze, eine App für digitale Selbstbeschränkung, und MuscleCat, ein Trainingstagebuch fürs Fitnessstudio. Gebaut werden beide überwiegend von KI-Agenten. Tests sind für uns deshalb kein Nebenthema. Sie sind das Sicherheitsnetz, das zwischen einem Agenten und dem Kunden steht.

Vor ein paar Tagen haben wir gemessen, wie gut dieses Netz arbeitet. Das Ergebnis war unbequem.

## Was wir gemessen haben

Über 99 Prozent unserer Testzeit steckten in UI-Tests. Die rund 1.700 Komponententests beider Apps laufen zusammen in unter einer Minute. Die UI-Tests dagegen brauchen 53 bzw. 85 Minuten für einen vollständigen Lauf, und die Suiten hatten sich in vier Wochen verdoppelt bis vervierfacht.

Jede neue Story brachte neue UI-Tests mit. Aus jedem davon wurde ein dauerhafter Regressionstest, und jeder Pull Request bezahlte die ganze Suite. Unser sogenannter Teillauf, der eigentlich nur die betroffenen Tests ausführen sollte, dauerte bei einer kleinen Änderung 77 Minuten. Für einen Refactor von 0,3 Prozent des Codes wählte er 55 von 56 UI-Klassen aus.

Der Grund war die Körnung. Die Auswahl ordnete Dateien den Tests zu. Zusammen regrediert aber selten eine Datei, sondern ein fachlicher Bereich. Dateien wie das Theme oder die Hauptansicht berühren jeden Bildschirm, also lief am Ende fast immer alles.

Eine zweite Zahl hat uns noch mehr beschäftigt. Von 39 Fehlern, die in MuscleCat durchgerutscht waren, fand kein einziger ein UI-Test. 19 davon fand der Founder selbst, am Gerät. Fairerweise zeigt diese Zahl nur, was durchgerutscht ist; was ein Test im Pull Request abgefangen hat, wird nie ein Ticket. Die Richtung war trotzdem klar.

## Was wir geändert haben

Erstens: Risikobereiche statt Dateien. Jede App hat jetzt ein Register mit rund acht fachlichen Bereichen, etwa Datenintegrität, Training erfassen, Kauf oder Sperre. Jeder Bereich trägt eine Risikostufe und zwei Gruppen von Tests: wenige kritische Abläufe und den Rest im Detail. Ändert sich das Dashboard, laufen die Abläufe des Dashboards. Die Stammdatenerfassung bleibt draußen.

Zweitens: jedes Kriterium so tief wie möglich. Rechnungen, Regeln, Sortierungen und Texte prüfen wir im Komponententest, in Millisekunden. Für Layout, Dark Mode und große Schriftgrößen führen wir Snapshot-Tests ein. UI-Tests bleiben für echte Abläufe und für das, was nur das Betriebssystem zeigen kann.

Drittens: Test zuerst. Für jedes Abnahmekriterium entsteht der Test vor dem Code, und er muss auf dem alten Code rot sein. Ein Build-Fehler zählt dabei nicht, denn ein Test, der nicht kompiliert, sagt nichts über Verhalten.

Viertens: Der Mensch erkundet. Am Gerät prüft der Founder nur noch, was wirklich ein Gerät braucht: Haptik, echtes Verhalten im Hintergrund, Käufe. Den Rest seiner Zeit nutzt er für explorative Tests mit einem klaren Auftrag, denn dort findet er die meisten Fehler.

<!-- figur: teststrategie-risikoregister -->

## Der Upload ist das Tor

Die wichtigste Entscheidung war eine Risikoentscheidung. Eine Regression darf auf den Hauptzweig gelangen, solange sie vor dem nächsten Upload gefunden wird. Den vollständigen Regressionstest gibt es weiterhin, nur läuft er dort, wo ein Fehler den Kunden erreichen würde. Der Testlauf pro Story schrumpft dafür von über einer Stunde auf unser Ziel von 15 Minuten.

Die Restrisiken haben wir ausdrücklich aufgeschrieben, statt sie wegzulassen. Bis die Snapshot-Tests stehen, prüfen wir Layout-Änderungen erst vor dem Upload. Die Messung ist gleich mit eingebaut: Jeder Fehler, den eine spätere Stufe findet, bekommt die Stufe zugeordnet, die ihn hätte finden müssen.

<!-- figur: teststrategie-testlaeufe -->

## Eine gemeinsame Sprache

Bei uns arbeiten Menschen und mehrere KI-Agenten an denselben Tickets. Hausbegriffe wie „Rule B“ oder „Progressionstest“ mussten jedes Mal erklärt werden. Deshalb haben wir unser Vokabular gegen das offizielle ISTQB-Glossar geprüft und angeglichen. Aus „Rule B“ wird der Story-Testlauf, aus der Geräteabnahme ein Benutzerabnahmetest mit Test-Charta. „Progressionstest“ steht im Glossar übrigens gar nicht.

<!-- figur: teststrategie-vokabular -->

## Was wir mitnehmen

Die Zahl der Tests sagt wenig über die Qualität einer Teststrategie. Unsere Pyramide sah nach Anzahl gesund aus und stand nach Laufzeit auf dem Kopf. Erst die Messung hat das gezeigt.

Wie handhabt ihr Regressionstests bei mobilen Apps? Läuft bei euch jeder Pull Request gegen die ganze Suite, oder wählt ihr aus?
