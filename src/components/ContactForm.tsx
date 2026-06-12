"use client";

import { useActionState } from "react";
import { sendContact } from "@/app/actions/inquiry";
import { CONTACT_INITIAL_STATE } from "@/app/actions/inquiry-state";
import { Turnstile } from "@/components/Turnstile";

/**
 * Contact form for the neckarshore.ai landing page (#kontakt section).
 *
 * A write-instead-of-book alternative to the Calendly CTA. Wraps the
 * `sendContact` Server Action via useActionState; spam protection = hidden
 * honeypot + Cloudflare Turnstile (dormant until the env vars are set).
 * Styled with the site's design tokens (navy/teal, dark-mode aware).
 */

const labelClass =
  "mb-1.5 block text-sm font-medium text-primary dark:text-text-primary";
const fieldClass =
  "w-full rounded-lg border border-primary/15 bg-white px-4 py-3 text-base text-primary placeholder:text-muted focus:border-accent focus:outline-none dark:border-text-secondary/20 dark:bg-deep-space dark:text-text-primary";
const errorClass = "mt-1.5 text-sm text-error";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContact,
    CONTACT_INITIAL_STATE,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-accent/30 bg-white p-6 dark:bg-surface">
        <p className="text-base text-primary dark:text-text-primary">
          Danke für Ihre Nachricht — wir melden uns zeitnah zurück.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5 text-left">
      {/* Honeypot — off-screen, bots fill it, humans don't see it. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor="contact-website">Website (bitte leer lassen)</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={state.values?.name}
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          className={fieldClass}
        />
        {state.fieldErrors?.name ? (
          <p className={errorClass}>{state.fieldErrors.name}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          E-Mail
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          className={fieldClass}
        />
        {state.fieldErrors?.email ? (
          <p className={errorClass}>{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Nachricht
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          defaultValue={state.values?.message}
          aria-invalid={state.fieldErrors?.message ? true : undefined}
          className={`${fieldClass} resize-y`}
        />
        {state.fieldErrors?.message ? (
          <p className={errorClass}>{state.fieldErrors.message}</p>
        ) : null}
      </div>

      <Turnstile />

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        data-track="contact_submit"
        className="inline-flex items-center justify-center self-start rounded-lg bg-accent px-8 py-3.5 text-base font-medium text-white transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100"
      >
        {pending ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
