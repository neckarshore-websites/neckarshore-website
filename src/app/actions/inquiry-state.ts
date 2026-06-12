/**
 * Shared types and constants for the contact server action.
 *
 * Imported by both the client component (ContactForm) and the server action
 * (`inquiry.ts`). It must NOT carry a `"use server"` directive — Next.js
 * rejects "use server" files that export anything other than async functions,
 * and we need to export the initial-state object + the types from one place
 * to keep the form/action contract in sync.
 */

/**
 * The user-facing form fields whose values we echo back into the form when
 * the action returns with status "error". Without this, a missing required
 * field would clear the whole form on submit.
 */
export type ContactFieldValues = {
  name?: string;
  email?: string;
  message?: string;
};

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /**
   * Echoed-back form values. Only populated on "error" responses; "success"
   * wipes the form (panel replaces it) and "idle" has no values yet. The form
   * reads these via `defaultValue=...` so users don't lose input on validation.
   */
  values?: ContactFieldValues;
};

export const CONTACT_INITIAL_STATE: ContactState = { status: "idle" };
