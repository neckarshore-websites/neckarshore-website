/**
 * Eingangsbestaetigung an den Absender des Kontaktformulars.
 *
 * Eigenes Modul, nicht in der Server-Action: eine "use server"-Datei darf in
 * Next.js ausschliesslich async-Funktionen exportieren — ein const-Export
 * bringt die Modulauswertung zum Absturz (sichtbar als 404 beim Absenden).
 * Hier liegt der Text damit ausserdem dort, wo ein Test ihn erreicht.
 */

/** Betreff der Eingangsbestaetigung an den Absender. */
export const CONFIRMATION_SUBJECT = "Ihre Nachricht an neckarshore.ai";

/**
 * Text der Eingangsbestaetigung. Bewusst schlicht und ohne HTML: sie muss in
 * jedem Postfach lesbar ankommen, auch im Firmen-Client mit abgeschaltetem
 * HTML. Die Nachricht wird im Wortlaut zurueckgegeben, damit der Absender
 * einen Beleg hat, was bei uns angekommen ist.
 */
export function buildConfirmationText(name: string, message: string): string {
  return [
    `Hallo ${name},`,
    "",
    "danke fuer Ihre Nachricht — sie ist bei uns angekommen.",
    "",
    "Wir melden uns in der Regel innerhalb eines Werktags. Wenn es schneller",
    "gehen soll, koennen Sie direkt einen Termin waehlen:",
    "https://calendly.com/rauhut/20min",
    "",
    "Ihre Nachricht im Wortlaut:",
    "",
    message,
    "",
    "Viele Gruesse",
    "neckarshore.ai",
    "https://neckarshore.ai",
    "",
    "--",
    "Diese E-Mail wurde automatisch versendet, weil das Kontaktformular auf",
    "neckarshore.ai mit dieser Adresse abgeschickt wurde. Haben Sie das nicht",
    "getan, ignorieren Sie diese Nachricht bitte — ohne Ihre Antwort",
    "verarbeiten wir nichts weiter.",
  ].join("\n");
}

