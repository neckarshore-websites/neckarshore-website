import { createRequire } from "node:module";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-plugin-react (bundled by eslint-config-next) auto-detects the React version
// through an ESLint 9 API that ESLint 10 removed, which crashes the whole run before
// any file is linted. Declaring the version skips that detection path. Derived from
// package.json rather than written out, so a React bump cannot silently make this stale.
const reactVersion = createRequire(import.meta.url)("./package.json").dependencies.react;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Must come AFTER the presets: later config objects win on `settings`.
  { settings: { react: { version: reactVersion } } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
