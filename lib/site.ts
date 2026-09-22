export const site = {
  name: "Riem Labs",
  shortName: "Riem",
  tagline: "Design & web systems studio",
  description:
    "Riem Labs is an independent design studio building digital products, interfaces, and web systems — shaped from first idea to working form.",
  /**
   * The canonical origin, and the single source for it.
   *
   * Everything that has to agree on where the site lives reads this: the
   * metadataBase behind canonical and Open Graph URLs, the sitemap's absolute
   * entries, and the sitemap reference in robots.txt. No trailing slash, so
   * `${site.url}/about` composes cleanly.
   */
  url: "https://riemlabs.dev",
  /** The one published inbox — enquiries, legal pages and billing alike. */
  email: "info@riemlabs.dev",
  /** The one published number: calls, and the same line WhatsApp opens. */
  phone: "+254 182 460 565",
  city: "Nairobi",
  country: "Kenya",
  timeZone: "Africa/Nairobi",
  timeZoneLabel: "EAT",
  founded: 2026,
  /** The one availability line the whole site reads from — header badge,
   *  footer status and the contact aside alike. Deliberately undated: the
   *  previous "Q3 2026" wording expired on a fixed calendar date and had
   *  drifted into three different hand-written variants across the site. */
  availability: "Available for select projects",
} as const;

/**
 * The current calendar quarter, in the studio's own timezone.
 *
 * Nairobi, not the visitor's clock: the availability line is a statement about
 * when *we* are free, so a visitor in Auckland on 1 January should still see
 * the quarter Riem is actually in. Derived from the date every time it is
 * asked for — there is no stored value to go stale and nothing scheduled to
 * update it, so it rolls over on its own at each quarter boundary.
 */
export function currentQuarter(now: Date = new Date()) {
  // en-CA gives YYYY-MM-DD, which slices without parsing ambiguity.
  const [year, month] = new Intl.DateTimeFormat("en-CA", {
    timeZone: site.timeZone,
    year: "numeric",
    month: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);

  return `Q${Math.floor((month - 1) / 3) + 1} ${year}`;
}

export type NavItem = {
  label: string;
  href: string;
  index: string;
  /** Bracketed hover cue shown beside the label in the drawer. */
  cue: string;
};

export const navigation: NavItem[] = [
  { label: "Index", href: "/", index: "01", cue: "Home" },
  { label: "About Us", href: "/about", index: "02", cue: "Studio" },
  { label: "Work", href: "/work", index: "03", cue: "Proof" },
  { label: "Services", href: "/services", index: "04", cue: "Method" },
  { label: "Contact", href: "/contact", index: "05", cue: "Action" },
];

export const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
];

/** The business line, in wa.me's digits-only form — the same number as
 *  `site.phone`, which is the only number the site now publishes. */
const WHATSAPP_NUMBER = "254182460565";

export const WHATSAPP_ENQUIRY = "Hello Riem Labs, I’d like to discuss a project.";

/** wa.me link, optionally opening the chat with `message` already typed. */
export function whatsappHref(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** `icon` keys the inline mark the footer draws for each. */
export const socials = [
  { label: "WhatsApp", href: whatsappHref(), icon: "whatsapp" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/riemlabs?stkn=a3l4bnRhMHR6cmQ5",
    icon: "instagram",
  },
  /** The public Company Page, not a personal profile or an admin view. */
  { label: "LinkedIn", href: "https://www.linkedin.com/company/riem-labs/", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com", icon: "github" },
] as const;
