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
/* One step under the interior hero scale (104px against its 112px at 1920),
   so the closing block still commands its section without reading as a
   second, home-page-sized hero. */
const HEADLINE_CLASS = "text-[clamp(2.75rem,5.6vw,6.5rem)] leading-none tracking-[-0.045em]";

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
            {/* `accent-on-dark`, not the brand blue: this is 11px on ink,
                where #1B17FF measures 2.42:1. Everything else here is
                canvas-toned, so this is the only mark that needs it. */}
            <span className="tnum text-accent-on-dark">{index}</span>
            <span className="text-canvas/25">/</span>
            <span className="text-canvas">{label}</span>
          </p>
          <p className="meta text-canvas/40">{site.city.toUpperCase()} — WORLDWIDE</p>
        </div>

        {/* The 9/3 split waits for `xl`. From `md` it gave the supporting note
            three columns of a tablet — 149px at 768, holding 198 characters at
            roughly twenty per line — and squeezed the button until its label
            wrapped, 176x74 against desktop's 254x54. Below `xl` the headline
            takes the full width and the note and button sit beneath it, which
            keeps the same order and the same right-hand axis while giving both
            a readable measure. */}
        <div className="mt-16 grid items-end gap-x-gutter gap-y-12 xl:grid-cols-12">
          <RevealLines
            as="h2"
            lines={lines}
            className={`${HEADLINE_CLASS} text-balance font-medium xl:col-span-9`}
          />

          <div className="flex flex-col justify-end gap-8 xl:col-span-3">
            {/* Capped below `xl`, where the note now spans the full width: 198
                characters across 1085px is one long ribbon of a line, which is
                no more readable than the 149px column it replaced. `max-w-md`
                holds it near a 60-character measure. At `xl` the three-column
                cell is already the limit, so the cap comes off. */}
            <Fade as="p" className="max-w-md text-sm leading-relaxed text-canvas/55 xl:max-w-none">
              {note}
            </Fade>

            {/* Right-aligned so the button’s own right edge lands on the
                shared right content axis, not just its column. */}
            <Fade className="flex flex-wrap items-center justify-end gap-x-8 gap-y-4">
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
