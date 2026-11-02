/**
 * The hidden trap field of the contact form.
 *
 * The old name `website` invites a browser or password manager to fill it, and a
 * filled trap ends in thanks without a mail: a real visitor would lose the message and
 * nobody would know (planning L-1102-HONEYPOT-PRUEFEN). So the name carries no word
 * autofill looks for, and every drop is logged, without any content of the form, so
 * that lost messages can be counted in the Vercel logs.
 */
export const HONEYPOT_FELD = "nicht_ausfuellen";

/** True when the trap is filled. Logs one fixed line, nothing a visitor typed. */
export function honeypotAusgeloest(formData: FormData): boolean {
  const wert = formData.get(HONEYPOT_FELD);
  if (typeof wert !== "string" || wert.trim() === "") return false;
  console.warn("[contact] honeypot drop");
  return true;
}
