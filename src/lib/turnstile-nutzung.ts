/**
 * When the Turnstile script may load: on the first use of the form, not on page view
 * (same as rauhut-website#101, Founder decision 2026-11-02, Dr. Sommer's way 1).
 *
 * Whoever only reads the page sends nothing to Cloudflare. Scrolling is no use of the
 * form, so visibility is deliberately not a trigger.
 */
export const NUTZUNGS_EVENTS = ["focusin", "pointerdown", "keydown"] as const;

/** Calls `starte` once, on the first use. Returns the cleanup. */
export function beiErsterNutzung(form: EventTarget, starte: () => void): () => void {
  let erledigt = false;
  const abbauen = () => {
    for (const name of NUTZUNGS_EVENTS) form.removeEventListener(name, einmal);
  };
  function einmal() {
    if (erledigt) return;
    erledigt = true;
    abbauen();
    starte();
  }
  for (const name of NUTZUNGS_EVENTS) form.addEventListener(name, einmal);
  return abbauen;
}

export interface SubmitHalten {
  /** The token as it stands, "" while there is none. */
  token: () => string;
  /** Submits the form again; the second pass goes through. */
  absenden: () => void;
  maxWarteMs?: number;
  schrittMs?: number;
}

/**
 * A fast submit can overtake the script. Holds the submit until the token is there.
 * After `maxWarteMs` it lets go anyway: the server then refuses with its visible
 * message instead of the guest waiting on a button that does nothing.
 *
 * Must listen on the form itself: React runs a form action later, at the root, and
 * skips it when the submit event was already prevented.
 */
export function submitHalten(form: EventTarget, optionen: SubmitHalten): () => void {
  const { token, absenden, maxWarteMs = 8000, schrittMs = 100 } = optionen;
  let wartet: ReturnType<typeof setInterval> | null = null;
  let durchlassen = false;

  const beimAbsenden = (ereignis: Event) => {
    if (durchlassen) {
      durchlassen = false;
      return;
    }
    if (token()) return;
    ereignis.preventDefault();
    if (wartet) return;
    const ende = Date.now() + maxWarteMs;
    wartet = setInterval(() => {
      if (!token() && Date.now() < ende) return;
      if (wartet) clearInterval(wartet);
      wartet = null;
      durchlassen = true;
      absenden();
    }, schrittMs);
  };

  form.addEventListener("submit", beimAbsenden);
  return () => {
    form.removeEventListener("submit", beimAbsenden);
    if (wartet) clearInterval(wartet);
    wartet = null;
  };
}
