import { absoluteUrl } from "./seo";
import { site, socials } from "./site";

/**
 * JSON-LD for the studio.
 *
 * Everything here is either a site constant or derived from one, so the
 * machine-readable copy of the contact details cannot drift from the copy a
 * visitor reads on the contact page. Nothing is asserted that the site does
 * not already state publicly — no ratings, no awards, no headcount, no
 * registration numbers.
 */

/** Stable @id values, so the entities can reference each other by name. */
export const ORGANIZATION_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

/**
 * The homepage's own URL, in the same slash-less form as its canonical and
 * its sitemap entry — see the note in `app/sitemap.ts`.
 */
const HOME_URL = site.url;

/**
 * Real public profiles only.
 *
 * WhatsApp is a wa.me deep link rather than a profile, and the GitHub entry
 * still points at github.com itself, so neither is something `sameAs` could
 * honestly claim identifies the studio.
 */
const SAME_AS = socials
  .filter((s) => s.icon === "instagram" || s.icon === "linkedin")
  .map((s) => s.href);

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: site.name,
  url: HOME_URL,
  description: site.positioning,
  // The logo in `public/`, which is crawlable at its own URL — not the inlined
  // build asset the header renders.
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/riem-labs-logo.png"),
    width: 1200,
    height: 317,
  },
  email: site.email,
  // Digits only, as tel: takes it — the display string's spaces are formatting.
  telephone: site.phone.replace(/\s/g, ""),
  foundingDate: String(site.founded),
  address: {
    "@type": "PostalAddress",
    streetAddress: site.street,
    addressLocality: site.city,
    addressCountry: site.countryCode,
  },
  sameAs: SAME_AS,
};

export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: site.name,
  url: HOME_URL,
  // By reference, not repeated: the Organization is defined once on this page.
  publisher: { "@id": ORGANIZATION_ID },
  inLanguage: "en-GB",
  /**
   * No SearchAction. It tells Google a site has its own search that a query
   * can be handed to, and this one does not — declaring it would describe a
   * feature that does not exist.
   */
};

/**
 * The real hierarchy, which is two deep everywhere: the homepage, then the
 * page. Nothing invents a middle level it does not have.
 */
export function breadcrumbSchema(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: HOME_URL },
      { "@type": "ListItem", position: 2, name, item: absoluteUrl(path) },
    ],
  };
}
