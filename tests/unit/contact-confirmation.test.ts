import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CONFIRMATION_SUBJECT,
  buildConfirmationText,
} from "../../src/lib/contact-confirmation";

// Die Eingangsbestaetigung geht an Fremde. Was sie enthalten MUSS, ist damit
// keine Geschmacksfrage: der Name, damit sie nicht wie Massenpost wirkt; die
// Nachricht im Wortlaut, damit der Absender einen Beleg hat; und der Hinweis,
// dass sie automatisch verschickt wurde — sonst ist sie fuer jemanden, der
// das Formular nie abgeschickt hat, nicht einzuordnen.

test("nennt den Absender beim Namen", () => {
  const text = buildConfirmationText("Dr. Meier", "Kurze Anfrage.");
  assert.ok(text.includes("Hallo Dr. Meier,"));
});

test("gibt die Nachricht im Wortlaut zurueck", () => {
  const message = "Wir suchen Unterstuetzung fuer ein Migrationsprojekt.";
  const text = buildConfirmationText("Meier", message);
  assert.ok(text.includes(message));
});

test("weist die Mail als automatisch versendet aus", () => {
  const text = buildConfirmationText("Meier", "Test");
  assert.ok(text.includes("automatisch versendet"));
  assert.ok(text.includes("ignorieren"));
});

test("traegt einen Weg zurueck zu uns", () => {
  // Vergleich auf GLEICHHEIT je Zeile, nicht includes(): eine
  // Teilstring-Pruefung auf eine URL trifft auch dann zu, wenn die Adresse
  // Teil einer fremden ist. CodeQL meldet das als
  // js/incomplete-url-substring-sanitization — und zwar auch dann noch, wenn
  // man nur von String.includes auf Array.includes wechselt (auf PR #258
  // nachgemessen). Erst der ===-Vergleich beendet beides: die Meldung und
  // die schwache Zusicherung dahinter.
  const lines = buildConfirmationText("Meier", "Test").split("\n");
  const countExact = (url: string) => lines.filter((l) => l === url).length;
  assert.equal(countExact("https://neckarshore.ai"), 1);
  assert.equal(countExact("https://calendly.com/rauhut/20min"), 1);
});

test("der Betreff nennt die Seite", () => {
  assert.ok(CONFIRMATION_SUBJECT.includes("neckarshore.ai"));
});
