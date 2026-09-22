import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * robots.txt.
 *
 * The site is small, public and wants to be found, so the default is simply
 * "crawl it". The only disallow is `/api/`, and not for secrecy — the inquiry
 * endpoint only answers POST, so a crawler asking for it gets a 405 and
 * nothing else. It is excluded because it is not a page, and pointing crawlers
 * at it wastes their budget and ours to no purpose.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      /**
       * OpenAI runs two crawlers with different jobs, and they are named
       * separately here so neither is governed by a decision meant for the
       * other.
       *
       * OAI-SearchBot is the one behind search results — it fetches pages so
       * they can be surfaced and linked. That is discovery, which is the whole
       * point of this file, so it is allowed explicitly rather than left to
       * inherit from `*`.
       */
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: "/api/",
      },
      /**
       * GPTBot collects data for model training, which is a different question
       * from being findable and one the studio has not taken a position on.
       * Rather than quietly answer it either way, this states today's actual
       * policy: the same access every other crawler has, no more and no less.
       * Changing it later is a one-line edit — `disallow: "/"` here opts out
       * of training without touching search visibility.
       */
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
