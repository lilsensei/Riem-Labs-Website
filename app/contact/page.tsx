import type { Metadata } from "next";
import AvailabilityLine from "@/components/AvailabilityLine";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import LiveClock from "@/components/LiveClock";
import PageIntro from "@/components/PageIntro";
import RevealSection from "@/components/RevealSection";
import { Fade } from "@/components/RevealText";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { site, socials, WHATSAPP_ENQUIRY, whatsappHref } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact",
  description:
    "Tell Riem Labs what your business is trying to solve, improve or build and start a project conversation.",
});

/** GitHub is a working tool, not a public channel — the footer omits it too. */
const PUBLIC_SOCIALS = socials.filter((s) => s.icon !== "github");

/** Shown as the human-readable number; `tel:` needs it without the spaces. */
const PHONE_HREF = `tel:${site.phone.replace(/\s/g, "")}`;

/** The Nairobi base, as a map link rather than an embed. The studio works
 *  from this address; it does not own or occupy the whole building, which
 *  is why the label is "Nairobi base" rather than "Our offices".
 *
 *  Composed from the site constants rather than written out again, so the
 *  line shown here and the PostalAddress in the Organization schema are the
 *  same address by construction. */
const BASE_ADDRESS = `${site.street}, ${site.city}, ${site.country}`;
const BASE_MAP_URL = "https://maps.app.goo.gl/P8qoGLMW8YAvuoL38";

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema("Contact", "/contact")} />

      {/* No headlineClassName/headlineAside override any more — this now
          uses PageIntro's plain default layout, the exact same single-
          column, full-width text-display treatment About/Work/Services
          use, with the lede flowing directly beneath at the site's normal
          spacing. The canvas and every narrow-column/height-sync fix that
          existed to make a side-by-side layout work are gone with it. The
          dark theme (batch 6 Part 23) has been reverted — light again. */}
      <PageIntro
        index="05"
        label="Contact"
        lines={["Tell us what you’re", "trying to solve."]}
        lede="You do not need a finished brief. Share the business problem, what you want to improve or what you are considering building, and we’ll take the conversation from there."
        showClock={false}
      />

      {/* ── 04.1 / Inquiry ─────────────────────────────────────────── */}
      <RevealSection className="bg-canvas">
        <div className="shell pb-section">
          <div className="grid gap-x-gutter gap-y-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Direct contact metadata */}
            <aside className="lg:col-span-4 lg:col-start-9">
              {/* No border-t here. The rule belongs to the heading below, the
                  way it does in the form — see the comment on that heading. */}
              <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
                {/* The same header the form's numbered sections use, built by
                    hand because theirs comes from the browser.

                    `01 / About you` is a <legend> inside a bordered <fieldset>,
                    so Chrome paints the rule through the middle of the legend's
                    box and simply omits it where the legend sits: the label
                    lands *on* the rule's row and the rule carries on to its
                    right. This block had a plain full-width border-t instead —
                    matching spacing but reading as a different pattern, a line
                    above a label rather than a label interrupting a line.

                    So: the <p> draws the rule as a ::before centred on its own
                    padded box, which is where a fieldset paints its border, and
                    the label wraps in an opaque span tall enough to cover that
                    row — the same interruption, by the same geometry, with no
                    measured-off offsets to drift. `pb-6` moves onto that span
                    so the heading keeps the exact height it had, leaving the
                    56px to the list below unchanged. */}
                <p className="meta relative flex items-baseline before:absolute before:inset-x-0 before:inset-y-0 before:my-auto before:h-px before:bg-hairline before:content-['']">
                  <span className="relative flex items-baseline gap-2 bg-canvas pb-6">
                    <span className="tnum text-accent">05</span>
                    <span className="text-ink/25">/</span>
                    <span>Direct</span>
                  </span>
                </p>

                <dl className="mt-8 space-y-8">
                  <Fade>
                    <dt className="meta text-ink/60">Email</dt>
                    <dd className="mt-2">
                      <a
                        href={`mailto:${site.email}`}
                        className="link-wipe text-lede text-ink"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </Fade>

                  {/* One number now. It is the line WhatsApp opens too, so a
                      second "which of these reaches you" number is gone. */}
                  <Fade>
                    <dt className="meta text-ink/60">Telephone</dt>
                    <dd className="mt-2">
                      <a href={PHONE_HREF} className="link-wipe text-sm text-ink">
                        {site.phone}
                      </a>
                    </dd>
                  </Fade>

                  <Fade>
                    <dt className="meta text-ink/60">Nairobi base</dt>
                    <dd className="mt-2">
                      <a
                        href={BASE_MAP_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="link-wipe text-sm text-ink"
                      >
                        {BASE_ADDRESS}
                        <span className="sr-only"> (opens in Google Maps in a new tab)</span>
                      </a>
                    </dd>
                    <dd className="mt-3">
                      <LiveClock seconds label="Local time" />
                    </dd>
                  </Fade>

                  <Fade>
                    <dt className="meta text-ink/60">Elsewhere</dt>
                    <dd className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      {PUBLIC_SOCIALS.map((s) => (
                        <a
                          key={s.label}
                          href={s.icon === "whatsapp" ? whatsappHref(WHATSAPP_ENQUIRY) : s.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm text-ink/70 transition-colors duration-400 ease-expo hover:text-accent"
                        >
                          {s.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ))}
                    </dd>
                  </Fade>
                </dl>

                <Fade className="mt-12 border border-hairline p-6">
                  <p className="meta flex items-center gap-2 text-ink/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
                    {site.availability}
                  </p>
                  <AvailabilityLine />
                </Fade>
              </div>
            </aside>
          </div>
        </div>
      </RevealSection>
    </>
  );
}
