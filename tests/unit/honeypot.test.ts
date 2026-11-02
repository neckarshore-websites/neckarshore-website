/**
 * Guards for the trap field (planning L-1102-HONEYPOT-PRUEFEN).
 * Run: npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { HONEYPOT_FELD, honeypotAusgeloest } from "../../src/lib/honeypot";

const hier = dirname(fileURLToPath(import.meta.url));

test("the trap field carries no word autofill looks for", () => {
  assert.doesNotMatch(
    HONEYPOT_FELD,
    /url|web|site|home|name|mail|phone|tel|fon|firm|company|addr|adress|city|zip|plz|user|login/i,
  );
  const form = readFileSync(join(hier, "../../src/components/ContactForm.tsx"), "utf8");
  assert.match(form, /name=\{HONEYPOT_FELD\}/);
  assert.doesNotMatch(form, /[Ww]ebsite \(/);
});

test("a filled trap is dropped and logged, without anything the visitor typed", () => {
  const leer = new FormData();
  leer.set(HONEYPOT_FELD, "   ");
  const gefuellt = new FormData();
  gefuellt.set(HONEYPOT_FELD, "http://geheim.example");
  const zeilen: string[] = [];
  const warn = console.warn;
  console.warn = (zeile: string) => zeilen.push(zeile);
  try {
    assert.equal(honeypotAusgeloest(new FormData()), false);
    assert.equal(honeypotAusgeloest(leer), false);
    assert.equal(zeilen.length, 0);
    assert.equal(honeypotAusgeloest(gefuellt), true);
  } finally {
    console.warn = warn;
  }
  assert.deepEqual(zeilen, ["[contact] honeypot drop"]);
});

test("the action asks the trap through the logged path", () => {
  const aktion = readFileSync(join(hier, "../../src/app/actions/inquiry.ts"), "utf8");
  assert.match(aktion, /if \(honeypotAusgeloest\(formData\)\)/);
  assert.doesNotMatch(aktion, /clean\(formData, "website"\)/);
});
