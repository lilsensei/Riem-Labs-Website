/**
 * GA4.
 *
 * The measurement ID is public by design — it identifies the property to
 * receive hits, not permission to read anything — so it sits here in the
 * client bundle rather than in an environment variable that would only give
 * the appearance of a secret.
 */
export const GA_MEASUREMENT_ID = "G-TS1Q1TF2TD";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Records a successful inquiry, using GA4's own recommended name for it.
 *
 * Sent with no parameters. The form collects a name, an email, a company and
 * the brief itself, and none of that belongs in an analytics property — the
 * measurement worth having is "an inquiry arrived", and that is the whole
 * event. There is no value or currency either: a lead's worth is not known at
 * the moment it lands, and inventing one would make the number look like a
 * measurement rather than a guess.
 *
 * Optional-called: if gtag never loaded — blocked, offline, or an ad blocker —
 * this does nothing. Analytics must never be able to break a submission that
 * the server has already accepted.
 */
export function trackGenerateLead() {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "generate_lead");
}
