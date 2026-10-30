/**
 * Gate for the lead-magnet PDF (planning #3336). A PDF sits in inboxes for months, so what it
 * promises is checked against the site that has to keep the promise.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const PDF = "public/downloads/90-tage-ki-fahrplan.pdf";
const source = readFileSync("scripts/lead-magnet/fahrplan.html", "utf8");

test("the shipped PDF exists and is one", () => {
  assert.ok(statSync(PDF).size > 100_000, "a real render with fonts is several hundred KB");
  assert.equal(readFileSync(PDF).subarray(0, 5).toString(), "%PDF-");
});

test("the test figure in the source is a floor the published number still clears", () => {
  const match = source.match(/über ([\d.]+) automatisierte Tests/);
  assert.ok(match, "the figure sentence on page 8 is gone");
  const printed = Number(match[1].replaceAll(".", ""));
  const stats = JSON.parse(readFileSync("public/stats.json", "utf8"));
  assert.ok(
    stats.testScope.total >= printed,
    `the PDF says über ${match[1]}, the site says ${stats.testScope.total}: re-render it`,
  );
});

test("the source has exactly eight pages", () => {
  assert.equal(source.match(/<section class="page/g).length, 8);
});

test("only page 8 counts Stufen (Founder 2026-10-30)", () => {
  const phases = source.split('<section class="page').slice(2, 5).join("");
  assert.doesNotMatch(phases, /Stufe/);
});

test("the shipped PDF carries the source's text, not an older render", (t) => {
  let text;
  try {
    text = execFileSync("pdftotext", [PDF, "-"], { encoding: "utf8" });
  } catch {
    t.skip("pdftotext not installed");
    return;
  }
  const flat = text.replace(/\s+/g, " ");
  const figure = source.match(/über [\d.]+ automatisierte Tests/)[0];
  assert.ok(flat.includes(figure), `PDF is stale, it lacks "${figure}": npm run build:fahrplan`);
  assert.ok(flat.includes("Das ist der Durchstich."), "PDF is stale: npm run build:fahrplan");
});
