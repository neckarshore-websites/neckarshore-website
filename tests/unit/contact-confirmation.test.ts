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
  // Zeilenweise und auf Gleichheit geprueft, nicht per includes() auf den
  // Gesamttext: eine Teilstring-Pruefung auf eine URL waere schwaecher (der
  // Treffer duerfte irgendwo stehen, auch als Teil einer fremden Adresse) —
  // und CodeQL meldet sie zu Recht als js/incomplete-url-substring-sanitization.
  const lines = buildConfirmationText("Meier", "Test").split("\n");
  assert.ok(lines.includes("https://neckarshore.ai"));
  assert.ok(lines.includes("https://calendly.com/rauhut/20min"));
});

test("der Betreff nennt die Seite", () => {
  assert.ok(CONFIRMATION_SUBJECT.includes("neckarshore.ai"));
});
