/**
 * Contact-form and captcha settings that are NOT secrets — in code, not in Vercel.
 *
 * Ticket: neckarshore-ai/neckarshore-planning#2879 (Founder decision 2026-10-02).
 * Sits next to site-config.ts (site URL, sitemap date) on purpose: this file has a
 * guard that no secret name may appear in it, and that guard is easier to keep
 * honest on a file with one job.
 *
 * WHY THEY LIVE HERE: until 2026-10-02 sender, SMTP host, port, user, recipient,
 * the public Turnstile site key and two on/off switches sat in Vercel as
 * environment variables nobody could read back. On kaze.neckarshore.ai the same
 * setup lost a contact message on 2026-10-01: HTTP 200, arrived nowhere, and the
 * recipient could no longer be looked up. A value you cannot read, you cannot
 * check. Here it is readable, versioned and guarded by tests.
 *
 * WHAT MUST NEVER LIVE HERE: passwords, secret keys, tokens. The two this site
 * has (the SMTP password and the secret Turnstile key) stay in Vercel and are
 * read where they are used. tests/unit/kontakt-config.test.ts goes red as soon as
 * such a variable or field name appears in this file, which is why this comment
 * does not spell their names either.
 *
 * NO FALLBACK TO THE OLD VARIABLE NAMES, on purpose: production reads these
 * values ONLY from here, so the old Vercel variables are inert from this deploy
 * on and can be deleted.
 *
 * ENVIRONMENTS: everything that has an effect only where a secret exists is gated
 * on that secret, not on a second switch. The secrets are set for Production
 * only, so previews and `npm run dev` keep today's behaviour: no captcha widget,
 * no real mail.
 */

export interface KontaktEinstellungen {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  absender: string;
  empfaenger: string;
}

/**
 * Contact form mail — everything on info@neckarshore.ai (Founder 2026-10-02:
 * "Die neckarshore.ai-Webseite sollte auf info@neckarshore.ai laufen", recipient
 * AND sender). Before: sender and recipient were german@rauhut.com (measured
 * from the headers of the 2026-09-18 probe mail).
 *
 * Host/port: Hostinger SSL on 465, measured 2026-10-02 from the headers of a
 * delivered kaze.neckarshore.ai form mail (same domain, same provider:
 * "by smtp.hostinger.com ... ESMTPSA"). The SMTP password in Vercel must be the
 * info@ mailbox's password; the PR body gives the order of the switch.
 */
export const KONTAKT: KontaktEinstellungen = {
  smtpHost: "smtp.hostinger.com",
  smtpPort: 465,
  smtpUser: "info@neckarshore.ai",
  absender: "info@neckarshore.ai",
  empfaenger: "info@neckarshore.ai",
};

/**
 * Public Turnstile site key. Read from the shipped JS bundle of neckarshore.ai on
 * 2026-10-02 (the build had inlined it as a literal). Public by design: every
 * visitor's browser receives it.
 */
export const TURNSTILE_SITEKEY = "0x4AAAAAADjkp7DYwmfqk44x";

/**
 * Captcha on the contact form. Measured live 2026-10-02: the shipped bundle
 * renders the widget unconditionally, i.e. the client switch was on in
 * Production. Whether it takes effect is gated on the secret (see
 * `captchaSitekey` in src/lib/captcha/verify.ts).
 */
export const CAPTCHA_AKTIV = true;

/**
 * The "Obsidian Vault Autopilot is live" strip in the nav. OFF since 2026-10-07 on the
 * Founder's decision: it was planned for 30 days from 2026-06-25, its review date in
 * Nav.tsx (2026-07-25) had passed, and "is live" was no longer news. The markup stays in
 * Nav.tsx so the next announcement needs new words and this switch, not a new component.
 * Only Nav.tsx reads the switch: no page changes its own top padding with it, so the first
 * section of each page sits the strip's height further from the nav than before.
 */
export const OSS_LAUNCH_SICHTBAR = false;
