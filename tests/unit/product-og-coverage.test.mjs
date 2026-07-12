import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { allItems } from "../../src/lib/portfolio.ts";
import { productOgImage } from "../../src/lib/product-og.ts";

// Build-time coverage guard for the per-product OG cards (L-NECK-OG-IMAGES-PER-PRODUCT).
//
// productOgImage(slug) returns `/og/<slug>.jpg` UNCONDITIONALLY — it never checks
// the asset exists. The e2e per-product og:image list (seo.spec.ts PRODUCT_OG_SLUGS)
// is hand-maintained. So a newly-added indexable product would silently ship a 404
// og:image in social previews, and CI would stay green. This test closes that gap by
// deriving the indexable-product set FROM portfolio and asserting each card is on disk.
//
// Indexable product == the set that renders a per-product OG card:
//   internal (!isExternal) · indexable (!noindex) · a real product (SoftwareApplication).
// This intentionally excludes noindex preview skeletons and the external website
// case-studies (schemaType "none").
const indexableProducts = allItems().filter(
  (i) => !i.isExternal && !i.noindex && i.schemaType === "SoftwareApplication",
);

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("there is at least one indexable product to guard", () => {
  assert.ok(
    indexableProducts.length > 0,
    "expected at least one indexable SoftwareApplication product in portfolio",
  );
});

for (const item of indexableProducts) {
  test(`indexable product '${item.slug}' has its per-product OG asset on disk`, () => {
    const { url } = productOgImage(item.slug);
    const assetPath = resolve(repoRoot, "public", url.replace(/^\//, ""));
    assert.ok(
      existsSync(assetPath),
      `Missing per-product OG card: ${assetPath}. Run scripts/generate-og-image.mjs for '${item.slug}', or mark the product noindex if it is a preview skeleton.`,
    );
  });
}
