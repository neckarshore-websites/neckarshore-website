# Security Policy

Neckarshore AI positions itself on trust, data protection ("Made in
Germany"), and enterprise-grade quality. This public repository holds the
source of our marketing website, [neckarshore.ai](https://neckarshore.ai) —
we hold its security to the same bar we set for our products.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Live production (`main`) | Yes |
| Any previous commit / preview deploy | No |

The website is continuously deployed from `main`. Only what is live in
production receives security fixes — there are no maintained release branches.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security problems.** Public
disclosure before a fix is shipped puts users at risk.

Use a private channel instead — either is fine:

1. **GitHub private vulnerability reporting (preferred):**
   [Report a vulnerability](https://github.com/neckarshore-websites/neckarshore-website/security/advisories/new)
   — opens a private security advisory only maintainers can see.
2. **Email:** [info@neckarshore.ai](mailto:info@neckarshore.ai) — the same
   contact channel published in our [Impressum](https://neckarshore.ai/impressum).

Please include:

1. **What you found** — a description of the vulnerability.
2. **How to reproduce** — concrete steps, request/response, or a proof of
   concept.
3. **Impact** — what an attacker could achieve.

**Response time:** best-effort. We aim to acknowledge within 5 working days
and to keep you updated as we investigate and fix. We will credit reporters
who wish to be named once a fix is live.

## Data Handling

The site is built to collect as little as possible (DSGVO / GDPR by design):

- **No cookies, no third-party analytics.** Traffic measurement uses a custom,
  cookieless endpoint (`POST /api/track`) that records aggregate,
  non-identifying signals only.
- **Fonts are self-hosted** (via `next/font`) — no request leaves the visitor's
  browser to a font CDN.
- **Contact form:** submissions are validated server-side (Zod), spam-filtered
  (honeypot + Cloudflare Turnstile, cookieless), and delivered over SMTP. The
  message body is sanitized before send; no submission is persisted in this
  repository or its infrastructure beyond the delivered email.

Full details are in the site's [Datenschutzerklärung](https://neckarshore.ai/datenschutz).

## Scope

**In scope:** the website source in this repository and its own API routes
(`/api/*`), server actions, and build/deploy configuration.

**Out of scope:** third-party services the site links to or embeds (Calendly,
Cloudflare Turnstile, the SMTP provider, Vercel platform infrastructure).
Report issues in those to the respective vendor. Vulnerabilities in *how we
integrate* a third party (e.g. a misconfigured header, a leaked token) are in
scope.
