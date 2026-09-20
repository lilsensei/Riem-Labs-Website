import type { ReactNode } from "react";
import LiveClock from "@/components/LiveClock";
import RevealSection from "@/components/RevealSection";
import { Fade, RevealBlock, RevealLines } from "@/components/RevealText";

/** `value` is a node, not just a string, so a fact can be a link — the
 *  legal pages' Contact fact is a real mailto. */
type MetaItem = { label: string; value: ReactNode };

type PageIntroProps = {
  index: string;
  label: string;
  lines: string[];
  lede: string;
  meta?: MetaItem[];
  /** The "Based in Nairobi [time] EAT" badge on the right of the corner row. */
  showClock?: boolean;
  /** Overrides the h1's size/width from the site default (`text-display`,
   *  full-bleed) — for the one page whose headline needs to run narrower.
   *  A prop rather than an appended className: two `text-*` size utilities
   *  on the same element don't reliably override one another by string
   *  order, only by where Tailwind happens to emit them in the stylesheet,
   *  so the default has to be left out entirely rather than fought with a
   *  second class. */
  headlineClassName?: string;
};

/** Shared masthead for the interior pages. Corner anchors frame the type. */
export default function PageIntro({
  index,
  label,
  lines,
  lede,
  meta = [],
  showClock = true,
  headlineClassName = "text-display",
}: PageIntroProps) {
  return (
    <RevealSection className="relative">
      <div className="shell pb-16 pt-[calc(var(--header-h)+4rem)] lg:pb-24 lg:pt-[calc(var(--header-h)+7rem)]">
        <RevealBlock onLoad>
          {/* Corner anchors */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 hairline-b pb-5">
            <p className="meta flex items-baseline gap-2">
              <span className="tnum text-accent">{index}</span>
              <span className="text-ink/25">/</span>
              <span>{label}</span>
            </p>
            {showClock ? <LiveClock /> : null}
          </div>

          <RevealLines
            as="h1"
            lines={lines}
            className={`mt-14 font-medium lg:mt-20 ${headlineClassName}`}
          />

          <div className="mt-14 grid gap-x-gutter gap-y-10 md:grid-cols-12 lg:mt-20">
            <Fade as="p" className="text-lede text-ink/60 md:col-span-6 lg:col-span-5">
              {lede}
            </Fade>

            {meta.length > 0 ? (
              <dl className="grid grid-cols-2 gap-x-gutter gap-y-8 md:col-span-6 md:col-start-8 lg:col-span-4 lg:col-start-9">
                {meta.map((item) => (
                  <Fade key={item.label}>
                    <dt className="meta text-ink/35">{item.label}</dt>
                    <dd className="mt-2 text-sm">{item.value}</dd>
                  </Fade>
                ))}
              </dl>
            ) : null}
          </div>
        </RevealBlock>
      </div>
    </RevealSection>
  );
}
