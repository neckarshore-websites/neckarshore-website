/**
 * Guards for the delayed Turnstile script (same as rauhut-website#101, version B).
 * Run: npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { beiErsterNutzung, NUTZUNGS_EVENTS, submitHalten } from "../../src/lib/turnstile-nutzung";

const hier = dirname(fileURLToPath(import.meta.url));

test("nothing starts before the form is used, and scrolling is no use", () => {
  const form = new EventTarget();
  let starts = 0;
  beiErsterNutzung(form, () => starts++);
  for (const name of ["scroll", "mouseover", "visibilitychange"]) form.dispatchEvent(new Event(name));
  assert.equal(starts, 0);
  assert.deepEqual([...NUTZUNGS_EVENTS], ["focusin", "pointerdown", "keydown"]);
});

test("each kind of use starts it, once only", () => {
  for (const name of NUTZUNGS_EVENTS) {
    const form = new EventTarget();
    let starts = 0;
    beiErsterNutzung(form, () => starts++);
    form.dispatchEvent(new Event(name));
    for (const weiter of NUTZUNGS_EVENTS) form.dispatchEvent(new Event(weiter));
    assert.equal(starts, 1, name);
  }
});

test("the component loads the script only through the first use", () => {
  const quelle = readFileSync(join(hier, "../../src/components/Turnstile.tsx"), "utf8");
  const effekt = quelle.slice(quelle.indexOf("export function Turnstile"));
  assert.match(effekt, /beiErsterNutzung\(/);
  const vorStarte = effekt.slice(0, effekt.indexOf("const starte"));
  assert.doesNotMatch(vorStarte, /loadTurnstileScript\(/, "script loads on mount");
  const starte = effekt.slice(effekt.indexOf("const starte"), effekt.indexOf("beiErsterNutzung("));
  assert.match(starte, /loadTurnstileScript\(\)/);
  const danach = effekt.slice(effekt.indexOf("beiErsterNutzung("));
  assert.doesNotMatch(danach, /loadTurnstileScript\(/, "script loads outside the first use");
});

function submitEreignis() {
  return new Event("submit", { cancelable: true });
}

test("a submit with a token goes through untouched", () => {
  const form = new EventTarget();
  const aus = submitHalten(form, { token: () => "x", absenden: () => assert.fail("no resubmit") });
  const e = submitEreignis();
  form.dispatchEvent(e);
  assert.equal(e.defaultPrevented, false);
  aus();
});

test("a submit without a token waits, then resubmits once the token is there", async () => {
  const form = new EventTarget();
  let token = "";
  let erneut = 0;
  let zweiter: Event | null = null;
  const aus = submitHalten(form, {
    token: () => token,
    absenden: () => {
      erneut++;
      zweiter = submitEreignis();
      form.dispatchEvent(zweiter);
    },
    schrittMs: 5,
  });
  const erster = submitEreignis();
  form.dispatchEvent(erster);
  assert.equal(erster.defaultPrevented, true);
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(erneut, 0, "must wait while there is no token");
  token = "x";
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(erneut, 1);
  assert.equal((zweiter as unknown as Event).defaultPrevented, false);
  aus();
});

test("without a token it lets go after the limit, so the server can answer", async () => {
  const form = new EventTarget();
  let zweiter: Event | null = null;
  const aus = submitHalten(form, {
    token: () => "",
    absenden: () => {
      zweiter = submitEreignis();
      form.dispatchEvent(zweiter);
    },
    maxWarteMs: 10,
    schrittMs: 5,
  });
  try {
    form.dispatchEvent(submitEreignis());
    await new Promise((r) => setTimeout(r, 30));
    assert.ok(zweiter, "resubmitted");
    assert.equal((zweiter as unknown as Event).defaultPrevented, false);
  } finally {
    aus();
  }
});
