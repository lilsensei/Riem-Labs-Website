import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * The public sitemap, served at /sitemap.xml.
 *
 * Listed by hand rather than discovered from the filesystem: a route being in
 * `app/` does not make it something to index. `/api/inquiry` is a POST
 * endpoint, not a page, and the not-found route is not a destination. Writing
 * the eight real pages out keeps that decision visible instead of implied.
 *
 * Hash links like /services#web-software-development are deliberately absent.
 * A fragment is a position within /services, not a separate document, and
 * listing them would only ask crawlers to index the same page four times.
 */

/** Every page a visitor can land on, in the order the navigation presents them. */
const ROUTES = [
  // Trailing slash on the root only: `https://riemlabs.dev/` is the
  // conventional canonical form for a homepage, and the others compose
  // straight onto the origin.
  "/",
  "/about",
  "/work",
  "/services",
  "/contact",
  "/terms",
  "/privacy",
  "/refund",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  /**
   * One timestamp for the whole sitemap: the moment this build was made.
   *
   * It is the only honest answer available. The pages are statically generated
   * from source, so "when did this page last change" is really "when was this
   * built" — and inventing a plausible-looking date per route would be telling
   * crawlers something nobody knows. Because every page is rebuilt together,
   * they genuinely do share one date.
   */
  const lastModified = new Date();

  return ROUTES.map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
  }));
}
