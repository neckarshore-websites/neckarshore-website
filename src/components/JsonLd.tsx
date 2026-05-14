/**
 * JsonLd — renders Schema.org JSON-LD as a static inline <script> tag.
 *
 * Usage:
 *   import { JsonLd } from "@/components/JsonLd";
 *   import { organizationSchema } from "@/lib/schema/organization";
 *   <JsonLd data={organizationSchema} id="schema-org" />
 *
 * Why a plain <script> and NOT next/script:
 *   In the App Router, `next/script` with inline JSON-LD serializes the content
 *   into the RSC hydration payload as an escaped JS string literal, not as a
 *   real <script type="application/ld+json"> tag in the static HTML. Non-JS
 *   crawlers (and many SEO tools) then fail to parse the schema. Using a plain
 *   <script> with inline content guarantees the tag ships in SSR HTML.
 *
 * XSS safety: `data` is a typed constant sourced exclusively from lib/schema/*,
 * compiled into the bundle at build time. It is NEVER user input and NEVER
 * touches runtime request data. We also escape `<` → `\u003c` as belt-and-
 * suspenders to prevent any theoretical `</script>` breakout. The identical
 * pattern is used for the FAQ JSON-LD in src/app/page.tsx.
 */

interface JsonLdProps {
  data: unknown;
  id?: string;
}

function safeStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data, id = "schema-org" }: JsonLdProps) {
  // Build-time constant, not user input — see component docblock for XSS rationale.
  const __html = safeStringify(data);
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html }}
    />
  );
}
