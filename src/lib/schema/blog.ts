/**
 * Blog JSON-LD: a `Blog` for /blog and a `BlogPosting` per article.
 *
 * Both are composed into the route's single `@graph` by <PageSchema> as its primary entity,
 * so the WebPage's `mainEntity` and the entity's own `@id` come from the same `entityId()`
 * call (see lib/schema/webpage.ts). Author and publisher are references to the route-invariant
 * Person and Organization nodes of the layout block — the one accepted cross-block class.
 */
import type { BlogPost } from "@/lib/content/blog";
import { ORG_ID, PERSON_ID } from "@/lib/schema/organization";
import { entityId } from "@/lib/schema/webpage";

const BASE_URL = "https://neckarshore.ai";

export const BLOG_PATH = "/blog";

export function postPath(slug: string): string {
  return `${BLOG_PATH}/${slug}`;
}

export function blogPostingSchema(post: BlogPost) {
  const path = postPath(post.slug);
  return {
    "@type": "BlogPosting",
    "@id": entityId(path, "article"),
    headline: post.title,
    alternativeHeadline: post.seoTitle,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "de-DE",
    url: `${BASE_URL}${path}`,
    image: `${BASE_URL}${post.cover.src}`,
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": entityId(BLOG_PATH, "collection") },
    mainEntityOfPage: { "@id": entityId(path, "webpage") },
  };
}

export function blogSchema(posts: BlogPost[]) {
  return {
    "@type": "Blog",
    "@id": entityId(BLOG_PATH, "collection"),
    name: "Blog von neckarshore.ai",
    url: `${BASE_URL}${BLOG_PATH}`,
    inLanguage: "de-DE",
    publisher: { "@id": ORG_ID },
    blogPost: posts.map((post) => ({ "@id": entityId(postPath(post.slug), "article") })),
  };
}
