<!-- BEGIN:neckarshore-agent-note -->

# Read this before the block below

The block after this note was **not written by us**. `next dev` writes it into this
file on its own, and there is no switch to stop it (measured 2026-09-18 against
`node_modules/next/dist/server/lib/generate-agent-files.js`: no env var, no config key).

**It stays here on purpose.** The generator writes into `CLAUDE.md` instead whenever
this file is missing or has lost the block. `AGENTS.md` is therefore a lightning rod:
it keeps a foreign writer out of the file that actually steers agent behaviour. This
is decision [#2360](https://github.com/neckarshore-ai/neckarshore-planning/issues/2360),
taken by us — it is not us following the block's own advice to commit it. A foreign
tool does not set our commit policy.

`npm run check:agent-files` fails when that block changes, when it disappears from
this file, or when it turns up in `CLAUDE.md`. If a Next.js upgrade rewrites it, read
the diff, decide whether we accept the new text, and update
`scripts/nextjs-agent-rules.expected.md` in the same commit.

<!-- END:neckarshore-agent-note -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
