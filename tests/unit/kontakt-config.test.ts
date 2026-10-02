/**
 * Guards for src/lib/kontakt-config.ts — the readable contact/captcha settings (#2879).
 *
 * Four questions, each with a failure behind it:
 * 1. Is a secret sitting in the file that is readable on purpose? (Then it is no secret.)
 * 2. Does any code still read the old, non-secret variable names? (Then the
 *    unreadable Vercel values would keep winning silently — the 2026-10-01 Kaze loss.)
 * 3. Does the captcha widget appear only where its secret exists? (Previews and dev
 *    have no secret; a widget there only produces a failing submit.)
 * 4. Does production still fail closed when the captcha secret is missing, while a
 *    preview does not? (NODE_ENV is "production" on previews too, so it cannot decide.)
 *
 * WHAT THIS CANNOT DO: prove the production values are right. Only a live submit
 * through the form, arriving in info@, does that — see the PR body.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { CAPTCHA_AKTIV, KONTAKT, TURNSTILE_SITEKEY } from "../../src/lib/kontakt-config";
import { captchaSitekey, verifyCaptchaToken } from "../../src/lib/captcha/verify";

const QUELLE = readFileSync(new URL("../../src/lib/kontakt-config.ts", import.meta.url), "utf8");

/* 1. No secret in the readable file ------------------------------------------ */

test("kontakt-config.ts names no secret variable or field", () => {
  const variable = QUELLE.match(/\b[A-Z0-9_]*(PASS|SECRET|TOKEN|PASSWORD|PASSWORT)[A-Z0-9_]*\b/g);
  assert.equal(variable, null, `secret variable name in kontakt-config.ts: ${variable}`);

  const feld = QUELLE.match(/\b\w*(pass|passwort|password|secret|geheim|token)\w*\s*:/gi);
  assert.equal(feld, null, `secret field in kontakt-config.ts: ${feld}`);
});

test("the contact block carries no secret field", () => {
  for (const schluessel of Object.keys(KONTAKT)) {
    assert.doesNotMatch(schluessel, /pass|secret|geheim|token/i);
  }
});

test("production values are complete and on the company domain", () => {
  const adresse = /^[a-z0-9._-]+@neckarshore\.ai$/;
  assert.match(KONTAKT.smtpUser, adresse);
  assert.match(KONTAKT.absender, adresse);
  assert.match(KONTAKT.empfaenger, adresse);
  assert.ok(KONTAKT.smtpPort > 0 && KONTAKT.smtpPort < 65536);
  assert.match(TURNSTILE_SITEKEY, /^0x4[A-Za-z0-9_-]+$/, "not a production site key");
});

/* 2. Nobody reads the old names anymore -------------------------------------- */

function quellen(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const pfad = join(dir, name);
    if (statSync(pfad).isDirectory()) return quellen(pfad);
    return /\.(ts|tsx|mjs|js)$/.test(name) ? [pfad] : [];
  });
}

test("no source file reads the old non-secret variables", () => {
  const ALT = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_FROM",
    "CONTACT_EMAIL_TO",
    "NEXT_PUBLIC_TURNSTILE_SITEKEY",
    "CAPTCHA_ENABLED",
    "NEXT_PUBLIC_CAPTCHA_ENABLED",
    "OSS_LAUNCH_VISIBLE",
  ];
  const src = new URL("../../src", import.meta.url).pathname;
  for (const datei of quellen(src)) {
    const text = readFileSync(datei, "utf8");
    for (const name of ALT) {
      assert.ok(!text.includes(`process.env.${name}`), `${datei} still reads ${name}`);
    }
  }
});

/* 3. Widget only where the secret is ----------------------------------------- */

test("captcha widget appears only where its secret exists", () => {
  assert.equal(CAPTCHA_AKTIV, true);
  assert.equal(captchaSitekey({}), null, "preview/dev without secret must not render the widget");
  assert.equal(captchaSitekey({ TURNSTILE_SECRET_KEY: "" }), null);
  assert.equal(captchaSitekey({ TURNSTILE_SECRET_KEY: "x" }), TURNSTILE_SITEKEY);
});

/* 4. Fail-closed in production, graceful in preview -------------------------- */

async function mitUmgebung<T>(werte: Record<string, string | undefined>, fn: () => Promise<T>) {
  const vorher: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(werte)) {
    vorher[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return await fn();
  } finally {
    for (const [k, v] of Object.entries(vorher)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("missing captcha secret rejects in production", async () => {
  const ergebnis = await mitUmgebung(
    { VERCEL_ENV: "production", TURNSTILE_SECRET_KEY: undefined },
    () => verifyCaptchaToken("irgendwas"),
  );
  assert.equal(ergebnis.ok, false);
});

test("missing captcha secret is skipped in a preview, even though NODE_ENV is production there", async () => {
  const ergebnis = await mitUmgebung(
    { VERCEL_ENV: "preview", NODE_ENV: "production", TURNSTILE_SECRET_KEY: undefined },
    () => verifyCaptchaToken(null),
  );
  assert.deepEqual(ergebnis, { ok: true, skipped: true });
});
