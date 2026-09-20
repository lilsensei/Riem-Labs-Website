import type { ReactNode } from "react";
import { Fade, RevealLines } from "@/components/RevealText";

type SectionHeaderProps = {
  /** Decimal section index, e.g. "02". */
  index: string;
  /** Section name shown beside the index, e.g. "Selected Work". */
  label: string;
  /** Headline, pre-split into masked lines. */
  lines?: string[];
  description?: string;
  /** Right-aligned metadata or a CTA. */
  aside?: ReactNode;
  className?: string;
};

/**
 * The recurring section frame: hairline rule, decimal index, headline.
 * Every major container on the site opens with one of these.
 */
export default function SectionHeader({
  index,
  label,
  lines,
  description,
  aside,
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={`hairline-t pt-5 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <p className="meta flex items-baseline gap-2">
          <span className="tnum text-accent">{index}</span>
          <span className="text-ink/25">/</span>
          <span className="text-ink">{label}</span>
        </p>
        {aside ? <div className="meta text-ink/50">{aside}</div> : null}
      </div>

      {lines || description ? (
        <div className="mt-12 grid gap-x-gutter gap-y-8 md:grid-cols-12 lg:mt-16">
          {lines ? (
            // A shade narrower than `text-headline`'s default vw coefficient
            // and a wider column (8/9 instead of 7/8) — a couple of this
            // component's longer two- and three-line headlines were sitting
            // close enough to their column's edge for the last word to wrap
            // onto its own line inside its `.reveal-line` span; this gives
            // every instance more headroom rather than patching call sites.
            <RevealLines
              as="h2"
              lines={lines}
              className="text-balance text-[clamp(2rem,3.9vw,4.5rem)] font-medium leading-none tracking-[-0.035em] md:col-span-8 lg:col-span-9"
            />
          ) : null}

          {description ? (
            <Fade
              as="p"
              className="text-lede text-ink/55 md:col-span-4 md:pt-1 lg:col-span-3"
            >
              {description}
            </Fade>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
