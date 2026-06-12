"use server";

import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { CAPTCHA_FORM_FIELD, verifyCaptchaToken } from "@/lib/captcha/verify";
import type { ContactFieldValues, ContactState } from "./inquiry-state";

/**
 * Contact Server Action — handles the neckarshore.ai landing-page contact form.
 *
 * Validation happens server-side; client-side `required` is only a UX hint.
 *
 * Anti-spam (defence-in-depth):
 *   1. Hidden `website` honeypot field — bots fill it, humans don't see it.
 *      If filled, we silently return success without sending mail.
 *   2. Cloudflare Turnstile (lib/captcha/verify.ts) — checked after field
 *      validation, before send. Graceful when unconfigured (dormant),
 *      fail-closed in production once activated.
 *
 * Mail transport: SMTP via nodemailer. Env vars (all required in production;
 * missing in production → honest error asking the user to email directly):
 *   SMTP_HOST  SMTP_PORT  SMTP_USER  SMTP_PASS  SMTP_FROM  CONTACT_EMAIL_TO
 *
 * In development (`NODE_ENV !== "production"`) a missing config falls back to
 * a dry-run that logs the would-be mail and returns success — useful for
 * local dev and Vercel previews without a real mailbox.
 *
 * Why types + CONTACT_INITIAL_STATE live in `./inquiry-state.ts` rather than
 * here: a "use server" file can only export async functions in Next.js — a
 * const export crashes module evaluation (manifests as a 404 on submit).
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_MESSAGE_LEN = 4000;
const MAX_FIELD_LEN = 200;

const TRANSPORT_FAILURE_MESSAGE =
  "Die Nachricht konnte gerade nicht übermittelt werden. Bitte schreiben Sie uns direkt an info@neckarshore.ai.";

function clean(formData: FormData, key: string, max = MAX_FIELD_LEN): string {
  return String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);
}

/**
 * Sanitize the free-text message against prompt-injection.
 *
 * Risk model: incoming mails may be piped into an AI assistant. A malicious
 * actor could craft a message designed to hijack it. Defence-in-depth (real
 * hardening lives in the AI consumer, not here): strip LLM control tokens +
 * role prefixes + prompt-separator lines + C0 control chars.
 */
function sanitizeText(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\[\/?(INST|SYS)\]/gi, "")
    .replace(/<<\/?SYS>>/gi, "")
    .replace(/<\|(system|user|assistant|im_start|im_end|endoftext)\|>/gi, "")
    .replace(
      /^(system|assistant|human|ai|gpt|claude|ignore previous instructions?|ignore above|forget (previous|all)|new instructions?)\s*:\s*/gim,
      "",
    )
    .replace(/^[-=]{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
}

/** Read SMTP config from env. Returns null if any required value is missing. */
function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const to = process.env.CONTACT_EMAIL_TO;

  if (!host || !portRaw || !user || !pass || !from || !to) return null;

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0 || port > 65535) return null;

  return { host, port, user, pass, from, to };
}

export async function sendContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // ----- Honeypot ---------------------------------------------------
  if (clean(formData, "website")) {
    // Bot detected — pretend success so they don't retry differently.
    return { status: "success" };
  }

  // ----- Fields -----------------------------------------------------
  const name = clean(formData, "name");
  const email = clean(formData, "email");
  const message = sanitizeText(clean(formData, "message", MAX_MESSAGE_LEN));

  const echoValues: ContactFieldValues = { name, email, message };

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Bitte Namen angeben.";
  if (!email) fieldErrors.email = "Bitte E-Mail angeben.";
  else if (!EMAIL_RE.test(email))
    fieldErrors.email = "Bitte gültige E-Mail-Adresse angeben.";
  if (!message) fieldErrors.message = "Bitte Nachricht angeben.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Bitte Eingaben prüfen.",
      fieldErrors,
      values: echoValues,
    };
  }

  // ----- Cloudflare Turnstile (Spam-Schutz) ------------------------
  // Nach der Feld-Validierung, vor dem Versand: ein gültiges Token wird nur
  // dann "verbraucht", wenn die Anfrage sonst vollständig ist. Graceful wenn
  // unkonfiguriert (Flag aus → ok:true), fail-closed in Production wenn
  // aktiviert + Secret fehlt.
  const captcha = await verifyCaptchaToken(
    formData.get(CAPTCHA_FORM_FIELD) as string | null,
  );
  if (!captcha.ok) {
    return {
      status: "error",
      message:
        "Spam-Schutz konnte nicht bestätigt werden. Bitte warten Sie einen Moment, bis die Prüfung abgeschlossen ist, und senden Sie dann erneut.",
      values: echoValues,
    };
  }

  // ----- Build + send ----------------------------------------------
  const subject = `Kontaktanfrage von ${name}`;
  const textBody = [
    `Name:    ${name}`,
    `E-Mail:  ${email}`,
    "",
    message,
  ].join("\n");

  const config = readSmtpConfig();
  const isProd = process.env.NODE_ENV === "production";

  if (!config) {
    if (isProd) {
      console.error(
        "[neckarshore Contact] SMTP not configured in production — " +
          "set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM/CONTACT_EMAIL_TO",
      );
      return {
        status: "error",
        message: TRANSPORT_FAILURE_MESSAGE,
        values: echoValues,
      };
    }
    // Dev / preview without configured SMTP → log and pretend success.
    console.log(
      `[neckarshore Contact / dry-run no SMTP config]\nSubject: ${subject}\n\n${textBody}`,
    );
    return { status: "success" };
  }

  // Pin to the SMTPTransport.Options overload — the generic last overload
  // otherwise picks TransportOptions, which lacks host/port/secure.
  const transportOptions: SMTPTransport.Options = {
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  };
  const transporter = nodemailer.createTransport(transportOptions);

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: config.to,
      replyTo: email,
      subject,
      text: textBody,
    });
    if (info.rejected.length > 0) {
      console.error("[neckarshore Contact] SMTP rejected recipient(s)", info.rejected);
      return {
        status: "error",
        message: TRANSPORT_FAILURE_MESSAGE,
        values: echoValues,
      };
    }
    return { status: "success" };
  } catch (err) {
    console.error("[neckarshore Contact] SMTP send threw", err);
    return {
      status: "error",
      message: TRANSPORT_FAILURE_MESSAGE,
      values: echoValues,
    };
  }
}
