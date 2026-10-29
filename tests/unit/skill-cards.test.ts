import { test } from "node:test";
import assert from "node:assert/strict";
import { SKILL_CARDS } from "../../src/lib/skill-cards";
import { PORTFOLIO } from "../../src/lib/portfolio";

// A GitHub button on a private repo is a 404 for every visitor. Measured 2026-10-29: the
// Social Scrapers card linked the private, archived obsidian-social-scrapers-common repo.
test("a skill card with private code carries no GitHub button", () => {
  for (const [slug, card] of Object.entries(SKILL_CARDS)) {
    if (card.visibility === "private") {
      assert.equal(card.repoUrl, undefined, `${slug}: private code, but repoUrl is set`);
    }
  }
});

// The skills overview table joins PORTFOLIO items with SKILL_CARDS by slug; a skill without
// a card would render a row with the bare tagline and no card to jump to.
test("every skills portfolio item has a skill card", () => {
  const skills = PORTFOLIO.find((c) => c.id === "skills");
  assert.ok(skills, "skills category exists");
  for (const item of skills.items) {
    assert.ok(SKILL_CARDS[item.slug], `${item.slug}: no entry in SKILL_CARDS`);
  }
});
