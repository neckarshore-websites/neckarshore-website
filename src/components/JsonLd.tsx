/**
 * JsonLd — renders Schema.org JSON-LD into the document via Next.js Script.
 *
 * Usage:
 *   import { JsonLd } from "@/components/JsonLd";
 *   import { organizationSchema } from "@/lib/schema/organization";
 *   <JsonLd data={organizationSchema} id="schema-org" />
 *
 * Safety: `data` is a typed constant sourced from lib/schema/*, never user input.
 * We escape `<` to prevent any theoretical `</script>` breakout if the schema
 * ever contained untrusted content (belt-and-suspenders).
 */

import Script from "next/script";

interface JsonLdProps {
  data: unknown;
  id?: string;
}

function safeStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data, id = "schema-org" }: JsonLdProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="beforeInteractive"
    >
      {safeStringify(data)}
    </Script>
  );
}
