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
  /**
   * The root is the bare origin, with no trailing slash.
   *
   * That is the form Next's metadata resolver emits for the homepage's
   * canonical — under the default `trailingSlash: false` it normalises one
   * away and there is no per-page override — so listing it here as
   * `https://riemlabs.dev/` would have the sitemap and the canonical writing
   * the same URL two ways. They are the same URL either way (RFC 3986: an
   * empty path is equivalent to "/"), but an audit reading both should not
   * have to know that.
   */
  "",
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
