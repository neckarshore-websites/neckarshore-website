import { test } from "node:test";
import assert from "node:assert/strict";
import { productOgImage } from "../../src/lib/product-og.ts";
import { pageMetadata } from "../../src/lib/seo.ts";

test("productOgImage returns per-slug card meta with the product name in alt", () => {
  const img = productOgImage("clearpath");
  assert.equal(img.url, "/og/clearpath.jpg");
  assert.equal(img.width, 1200);
  assert.equal(img.height, 630);
  assert.match(img.alt, /ClearPath/);
});

test("pageMetadata uses the per-product image when passed", () => {
  const meta = pageMetadata({
    title: "t",
    description: "d",
    path: "/products/clearpath",
    image: productOgImage("clearpath"),
  });
  assert.equal(meta.openGraph.images[0].url, "/og/clearpath.jpg");
  assert.equal(meta.twitter.images[0], "/og/clearpath.jpg");
});

test("pageMetadata falls back to the shared OG image when no image is passed", () => {
  const meta = pageMetadata({ title: "t", description: "d", path: "/impressum" });
  assert.match(meta.openGraph.images[0].url, /og-image/);
  assert.match(meta.twitter.images[0], /og-image/);
});
