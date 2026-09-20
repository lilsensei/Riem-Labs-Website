import BracketLink from "@/components/BracketLink";
import RevealSection from "@/components/RevealSection";
import { Fade, RevealLines } from "@/components/RevealText";
import { site } from "@/lib/site";

type CTABannerProps = {
  /** Anchor id, so the menu's scroll-spy can see this section. */
  id?: string;
  index?: string;
  label?: string;
  lines: string[];
  note: string;
  cta?: string;
};

/* A touch smaller than the site's general `text-display` scale, and the
   headline column a little wider (9/12 instead of 8/12) — together these
   give every explicit `.reveal-line` here enough room to render as one
   visual line at this section's typical line lengths, instead of the last
   word occasionally wrapping onto its own line inside the span. */
const HEADLINE_CLASS = "text-[clamp(2.75rem,6.2vw,8.25rem)] leading-none tracking-[-0.045em]";

/** Inverted closing block used at the foot of every page above the footer. */
export default function CTABanner({
  id,
  index = "05",
  label = "Contact",
  lines,
  note,
  cta = "Start a project",
}: CTABannerProps) {
  return (
    <RevealSection id={id} className="bg-ink text-canvas">
      <div className="shell py-section">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-canvas/15 pt-5">
          <p className="meta flex items-baseline gap-2">
            <span className="tnum text-accent">{index}</span>
            <span className="text-canvas/25">/</span>
            <span className="text-canvas">{label}</span>
          </p>
          <p className="meta text-canvas/40">{site.city.toUpperCase()} — WORLDWIDE</p>
        </div>

        <div className="mt-16 grid items-end gap-x-gutter gap-y-12 md:grid-cols-12">
          <RevealLines
            as="h2"
            lines={lines}
            className={`${HEADLINE_CLASS} text-balance font-medium md:col-span-9`}
          />

          <div className="flex flex-col justify-end gap-8 md:col-span-3">
            <Fade as="p" className="text-sm leading-relaxed text-canvas/55">
              {note}
            </Fade>

            <Fade className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <BracketLink href="/contact" variant="boxed" size="lg" tone="dark">
                {cta}
              </BracketLink>
            </Fade>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
