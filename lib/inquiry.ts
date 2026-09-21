/**
 * The contact inquiry, server side.
 *
 * Everything here is framework-agnostic and imports neither Next nor the mail
 * provider, so
 * the route handler stays a thin shell: parse, validate, act. When inquiries
 * start being stored as well as emailed, the insert goes between `validate`
 * and the send in the route — nothing in this file has to change to allow it.
 */

/** Exactly the fields the form posts. Optional ones may be absent or blank. */
export type InquiryInput = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
  scope?: unknown;
  timeline?: unknown;
  /** Honeypot. A real visitor never sees this, so anything in it is a bot. */
  website?: unknown;
};

/** A validated inquiry: every string trimmed, every field the shape it claims. */
export type Inquiry = {
  name: string;
  email: string;
  company: string;
  message: string;
  scope: string[];
  timeline: string;
  /** Server clock, never the client's. */
  submittedAt: string;
  source: string;
};

/**
 * Field ceilings.
 *
 * Generous enough that no genuine brief is ever truncated, small enough that
 * the whole record stays well inside any mail body and any future column.
 * Over-length input is rejected rather than silently cut, so nobody's brief
 * arrives with the end missing.
 */
export const LIMITS = {
  name: 120,
  email: 254, // the practical maximum length of an address
  company: 160,
  message: 5000,
  timeline: 80,
  scopeItem: 80,
  scopeCount: 12,
} as const;

/** Hard ceiling on the raw request body, before it is even parsed. */
export const MAX_BODY_BYTES = 16 * 1024;

/**
 * Deliberately permissive, and the same shape the client uses: one @, a dot in
 * the domain, no spaces. Anything stricter starts rejecting real addresses, and
 * the only real proof an address works is mail arriving at it.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const asString = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const asStringArray = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean) : [];

export type ValidationResult =
  | { ok: true; inquiry: Inquiry }
  | { ok: false; message: string };

/**
 * Independent of the client's own checks, which a direct POST simply skips.
 * Returns the first problem rather than a field map: the browser form has
 * already guided anyone using it, so this is for malformed or hostile
 * requests, where one clear reason is enough.
 */
export function validateInquiry(input: InquiryInput): ValidationResult {
  const name = asString(input.name);
  const email = asString(input.email);
  const company = asString(input.company);
  const message = asString(input.message);
  const timeline = asString(input.timeline);
  const scope = asStringArray(input.scope);

  if (!name) return { ok: false, message: "A name is required." };
  if (name.length > LIMITS.name) return { ok: false, message: "That name is too long." };

  if (!email) return { ok: false, message: "An email address is required." };
  if (email.length > LIMITS.email || !EMAIL.test(email))
    return { ok: false, message: "That email address is not valid." };

  if (company.length > LIMITS.company) return { ok: false, message: "That company name is too long." };

  if (scope.length === 0) return { ok: false, message: "At least one scope is required." };
  if (scope.length > LIMITS.scopeCount) return { ok: false, message: "Too many scope values." };
  if (scope.some((s) => s.length > LIMITS.scopeItem))
    return { ok: false, message: "A scope value is too long." };

  if (!message) return { ok: false, message: "A brief is required." };
  if (message.length > LIMITS.message) return { ok: false, message: "That brief is too long." };

  if (timeline.length > LIMITS.timeline) return { ok: false, message: "That timeline value is too long." };

  return {
    ok: true,
    inquiry: {
      name,
      email,
      company,
      message,
      scope,
      timeline,
      submittedAt: new Date().toISOString(),
      source: "riemlabs.dev/contact",
    },
  };
}

/** A bot filled the field nobody can see. */
export const isHoneypotTripped = (input: InquiryInput) => asString(input.website).length > 0;

/**
 * Escape before interpolating into the HTML mail body.
 *
 * The brief is visitor-supplied text going into a document someone at Riem
 * will open in a mail client — exactly the place an unescaped `<` should never
 * reach. The plain-text part needs none of this, which is half the reason it
 * is worth sending.
 */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FIELD_ORDER: Array<[string, (i: Inquiry) => string]> = [
  ["Name", (i) => i.name],
  ["Email", (i) => i.email],
  ["Company / Project", (i) => i.company || "—"],
  ["Scope", (i) => i.scope.join(", ")],
  ["Timeline", (i) => i.timeline || "—"],
  ["Submitted", (i) => i.submittedAt],
  ["Source", (i) => i.source],
];

export function inquirySubject(inquiry: Inquiry) {
  return inquiry.company
    ? `New Riem Labs inquiry — ${inquiry.name} / ${inquiry.company}`
    : `New Riem Labs inquiry — ${inquiry.name}`;
}

/** Plain text first: it is the one part guaranteed to render anywhere. */
export function inquiryText(inquiry: Inquiry) {
  const rows = FIELD_ORDER.map(([label, get]) => `${label}: ${get(inquiry)}`).join("\n");
  return `${rows}\n\nReply to: ${inquiry.email}\n\nBrief:\n${inquiry.message}\n`;
}

/**
 * Deliberately plain — a readable record, not a designed email.
 *
 * Carries a mailto link to the visitor because the Hostinger Mail API has no
 * Reply-To field: its send payload is to/cc/bcc/subject/text/html/attachments
 * and nothing else, and `inReplyTo` is message threading rather than the
 * header. The mailbox sends to itself, so hitting Reply would answer us. One
 * click on this opens a reply addressed to the visitor instead.
 */
export function inquiryHtml(inquiry: Inquiry) {
  const rows = FIELD_ORDER.map(
    ([label, get]) =>
      `<tr><td style="padding:4px 16px 4px 0;color:#666;white-space:nowrap;vertical-align:top">${escapeHtml(
        label,
      )}</td><td style="padding:4px 0;color:#111">${escapeHtml(get(inquiry))}</td></tr>`,
  ).join("");

  return [
    `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;line-height:1.6;color:#111">`,
    `<p style="margin:0 0 16px;font-weight:600">New inquiry from the Riem Labs contact form</p>`,
    `<table style="border-collapse:collapse;margin:0 0 20px">${rows}</table>`,
    `<p style="margin:0 0 20px"><a href="mailto:${encodeURI(inquiry.email)}" style="color:#1B17FF">Reply to ${escapeHtml(
      inquiry.name,
    )}</a></p>`,
    `<p style="margin:0 0 6px;color:#666">Brief</p>`,
    // white-space:pre-wrap so the visitor's own paragraphs survive
    `<div style="white-space:pre-wrap;padding:12px 14px;background:#f5f5f2;border-left:2px solid #1B17FF">${escapeHtml(
      inquiry.message,
    )}</div>`,
    `</div>`,
  ].join("");
}
