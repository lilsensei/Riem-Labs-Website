export const site = {
  name: "Riem Labs",
  shortName: "Riem",
  tagline: "Design & web systems studio",
  description:
    "Riem Labs is an independent design studio building digital products, interfaces, and web systems — shaped from first idea to working form.",
  /** The one published inbox — enquiries, legal pages and billing alike. */
  email: "info@riemlabs.dev",
  /** The one published number: calls, and the same line WhatsApp opens. */
  phone: "+254 794 989 397",
  city: "Nairobi",
  country: "Kenya",
  timeZone: "Africa/Nairobi",
  timeZoneLabel: "EAT",
  founded: 2026,
  availability: "Available for hire — Q3 2026",
} as const;

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
const WHATSAPP_NUMBER = "254794989397";

export const WHATSAPP_ENQUIRY = "Hello Riem Labs, I’d like to discuss a project.";

/** wa.me link, optionally opening the chat with `message` already typed. */
export function whatsappHref(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** `icon` keys the inline mark the footer draws for each. */
export const socials = [
  { label: "WhatsApp", href: whatsappHref(), icon: "whatsapp" },
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com", icon: "github" },
] as const;
