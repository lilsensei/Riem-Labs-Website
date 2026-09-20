import type { Metadata } from "next";
import AvailabilityLine from "@/components/AvailabilityLine";
import ContactForm from "@/components/ContactForm";
import LiveClock from "@/components/LiveClock";
import PageIntro from "@/components/PageIntro";
import RevealSection from "@/components/RevealSection";
import { Fade } from "@/components/RevealText";
import { site, socials, WHATSAPP_ENQUIRY, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell Riem Labs what you're trying to solve. You do not need a finished brief to start the conversation.",
};

/** The Direct block's real inbox — deliberately not site.email, which is
 *  the legal pages' address. See the block below for why. */
const CONTACT_EMAIL = "info@riemlabs.dev";
/** GitHub is a working tool, not a public channel — the footer omits it too. */
const PUBLIC_SOCIALS = socials.filter((s) => s.icon !== "github");

/** Shown as the human-readable number; `tel:` needs it without the spaces. */
const PHONE_HREF = `tel:${site.phone.replace(/\s/g, "")}`;

/** The Nairobi base, as a map link rather than an embed. The studio works
 *  from this address; it does not own or occupy the whole building, which
 *  is why the label is "Nairobi base" rather than "Our offices". */
const BASE_ADDRESS = "Rehema House, Nairobi, Kenya";
const BASE_MAP_URL = "https://maps.app.goo.gl/P8qoGLMW8YAvuoL38";

export default function ContactPage() {
  return (
    <>
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
              <div className="border-t border-hairline pt-8 lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
                <p className="meta flex items-baseline gap-2">
                  <span className="tnum text-accent">06</span>
                  <span className="text-ink/25">/</span>
                  <span>Direct</span>
                </p>

                <dl className="mt-10 space-y-8">
                  {/* Deliberately not site.email — that's the legal-pages
                      address (hello@riemlabs.com), while this block shows
                      the studio's actual inbox. Once the hero metadata block
                      (Part 1) and the "Or email…" line under Send Brief
                      (Part 6) are both gone, this is the only email on the
                      page, so the two addresses never appear side by side
                      to read as inconsistent. */}
                  <Fade>
                    <dt className="meta text-ink/60">Email</dt>
                    <dd className="mt-2">
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="link-wipe text-lede text-ink"
                      >
                        {CONTACT_EMAIL}
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
                    Available for select projects
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
