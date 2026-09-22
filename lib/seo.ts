import type { Metadata } from "next";
import { site } from "./site";

/**
 * Search and social metadata, in one place.
 *
 * Next merges metadata shallowly: a page that declares `openGraph` replaces
 * the layout's whole `openGraph` object rather than adding to it, so siteName,
 * locale and type would quietly vanish from any page that set its own og:url.
 * Building the object here means every page gets the complete set, and the
 * canonical URL, the og:url and the breadcrumb all read the same path.
 */

/** A site path — as the sitemap writes it — resolved against the canonical origin. */
export function absoluteUrl(path: string) {
  return `${site.url}${path}`;
}

/**
 * The social card, named explicitly rather than left to be inherited.
 *
 * `app/opengraph-image.tsx` only attaches itself to the route it sits in, so
 * every page but the homepage came out with no og:image at all. Pointing at
 * the generated routes by path fixes that in one place, and they still resolve
 * to absolute URLs through `metadataBase`.
 */
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${site.name} — ${site.offering}`,
};
const TWITTER_IMAGE = { ...OG_IMAGE, url: "/twitter-image" };

type PageSeo = {
  /** Path from the origin, written exactly as `app/sitemap.ts` lists it. */
  path: string;
  /**
   * The title without the studio's name. The layout's `%s — Riem Labs`
   * template appends it, so "Services" becomes "Services — Riem Labs".
   */
  title: string;
  description: string;
  /**
   * For a title that already names the studio — the homepage's, which opens
   * with it — so the template does not append it a second time.
   */
  absoluteTitle?: boolean;
};

export function pageMetadata({ path, title, description, absoluteTitle }: PageSeo): Metadata {
  // og:title carries no template, so the suffix the <title> gets from the
  // layout has to be written in here for the two to say the same thing.
  const fullTitle = absoluteTitle ? title : `${title} — ${site.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    /**
     * The self-referencing canonical, written out in full.
     *
     * Absolute rather than relative because Next normalises a relative "/"
     * to an origin with no trailing slash, which would have had the homepage
     * canonical and the sitemap's own entry for it written two different
     * ways. Composed from the same origin constant either way, so it can only
     * ever name the canonical host — and because it is fixed per page,
     * /services#data-science-analytics canonicalises to /services on its own,
     * with nothing to configure.
     */
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_GB",
      url: absoluteUrl(path),
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      // The card is large because there is a 1200×630 image to fill it;
      // `summary` would crop the wordmark into a thumbnail.
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [TWITTER_IMAGE],
    },
  };
}
