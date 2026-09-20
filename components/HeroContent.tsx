import BracketLink from "@/components/BracketLink";
import LiveClock from "@/components/LiveClock";
import { navigation } from "@/lib/site";

export const HERO_HEADLINE =
  "Built around how your business works, and where it is going.";

export const HERO_INTRO =
  "Riem Labs designs and builds websites, digital products and business systems around real operational needs, from what customers see to what keeps the business moving.";

/**
 * Hero content, rendered twice.
 *
 * `base` is the real, interactive layer. `reveal` is a visually identical copy
 * living inside the clipped accent layer — it must never be focusable or
 * announced, so its heading degrades to a <p> and its CTA to a static span.
 * Both variants share every layout class, which is what keeps the two layers
 * in pixel register as the band sweeps across.
 */
export default function HeroContent({ variant }: { variant: "base" | "reveal" }) {
  const isReveal = variant === "reveal";

  const Heading = isReveal ? "p" : "h1";
  const headingTone = isReveal ? "text-mist" : "text-graphite";
  const introTone = isReveal ? "text-mist/75" : "text-stone";
  const metaTone = isReveal ? "text-mist/70" : "text-stone";

  return (
    <div className="flex h-full min-h-[100svh] flex-col px-gutter pb-8 pt-[var(--header-h)]">
      {/* Centred in the space above the footer row, then biased down 8vh so it
          reads as lower-middle. translate-y is a pure paint offset, so it
          can't shift the footer row or the centring maths.

          Nothing scroll-driven touches this. The copy holds its position for
          the whole hero and only ever changes colour, as the band sweeps
          across it — and because both layers are laid out identically, the
          black half and the white half stay in step by construction. */}
      <div className="flex flex-1 flex-col justify-center">
        {/* No downward bias. The flex centring above already places this
            between the bar and the footer row; an extra 8vh on top of it was
            pushing the block far enough down that the gap above the eyebrow ran
            to roughly three times the reference's, while the gap below the
            headline came out tighter than the reference's. Centred is centred. */}
        <div>
          {/* Section marker. The home page is 01 in the menu's numbering, so
              the hero carries it the same way every other section carries its
              own — and it sits with the statement rather than pinned to the top
              of the hero, where it was stranded above a few hundred pixels of
              nothing. */}
          <p
            className="hero-rise meta mb-8 flex items-baseline gap-2 sm:mb-10"
            style={{ animationDelay: "0.02s" }}
          >
            <span className={`tnum ${isReveal ? "text-mist" : "text-accent"}`}>
              {navigation[0].index}
            </span>
            <span aria-hidden="true" className={isReveal ? "text-mist/40" : "text-ink/25"}>
              /
            </span>
            <span className={isReveal ? "text-mist" : "text-graphite"}>
              {navigation[0].label}
            </span>
          </p>

          <Heading
            className={`hero-rise hero-headline text-balance ${headingTone}`}
            style={{ animationDelay: "0.08s", maxWidth: "var(--hero-headline-max-width)" }}
          >
            {HERO_HEADLINE}
          </Heading>

          <p
            className={`hero-rise hero-description mt-6 max-w-intro ${introTone}`}
            style={{ animationDelay: "0.2s" }}
          >
            {HERO_INTRO}
          </p>
        </div>
      </div>

      {/* Bottom anchors: clock left, scroll cue centred, CTA right. */}
      {/* Two anchors on a phone, three from `sm` up. At narrow widths a third
          column squeezed all three into each other — the clock, the cue and the
          CTA overlapped as one unreadable line. The scroll cue is the one that
          carries no information, so it is the one that goes. */}
      <div
        className="hero-rise mt-10 grid grid-cols-2 items-end gap-4 sm:mt-0 sm:grid-cols-3"
        style={{ animationDelay: "0.34s" }}
      >
        {/* items-start, not items-center: the clock wraps to two lines on a
            phone, and a marker centred against both sat in the gutter between
            them. The 3px lifts it onto the optical centre of the first line,
            which is where it also sits when the clock is a single line. */}
        <div className="flex items-start gap-2">
          <span
            className={`mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full animate-pulse-dot ${
              isReveal ? "bg-mist" : "bg-accent"
            }`}
          />
          {/* Both layers render the same clock, from one shared ticker. The
              mirror used to be a bare "Based in Nairobi" label with no time and
              no timezone, so wherever the accent field covered this corner it
              painted over the live figure and left it cropped. */}
          <LiveClock seconds tone={variant} />
        </div>

        <p
          className={`meta col-start-2 hidden items-center justify-center gap-2 sm:flex ${metaTone}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full animate-pulse-dot ${
              isReveal ? "bg-mist" : "bg-accent"
            }`}
          />
          Scroll to begin
        </p>

        {/* One component renders both copies, so the mirror cannot drift out
            of register with the real control. `data-hero-cta` is the hook the
            stylesheet uses to replay the base's hover splay on the mirror. */}
        <div
          className="col-start-2 justify-self-end sm:col-start-3"
          data-hero-cta={variant}
        >
          <BracketLink
            href="/contact"
            size="lg"
            magnetic
            asStatic={isReveal}
            tone={isReveal ? "reveal" : "light"}
          >
            Let&apos;s talk
          </BracketLink>
        </div>
      </div>
    </div>
  );
}
