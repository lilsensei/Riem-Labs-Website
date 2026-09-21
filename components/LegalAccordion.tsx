"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { EASE, ScrollTrigger, gsap } from "@/lib/gsap";

export type LegalSection = {
  index: string;
  title: string;
  /** Always visible, open or closed. Plain text by design: this renders
   *  inside the disclosure button, where a nested link would be invalid
   *  markup and would fight the button for the click. */
  brief: string;
  /** Revealed on expand — one entry per paragraph. Nodes, not just strings,
   *  so the closing Contact row can carry a real mailto link. */
  body: ReactNode[];
};

/**
 * One legal clause as a disclosure row.
 *
 * The collapsed row carries the whole summary — number, title, brief — so the
 * page reads as a complete document without anyone opening anything. Only the
 * long-form clause sits behind the toggle.
 *
 * Rows open independently rather than one-at-a-time as the Services accordion
 * does: these are reference documents people read across, comparing two
 * clauses, and closing the last one they opened would fight that.
 */
function LegalRow({ section }: { section: LegalSection }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  useGSAP(
    () => {
      const el = panelRef.current;
      if (!el) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.to(el, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
        duration: reduced ? 0 : 0.7,
        ease: EASE,
        // The page just got taller or shorter — scroll triggers must re-measure.
        onComplete: () => ScrollTrigger.refresh(),
      });
    },
    { dependencies: [open] },
  );

  return (
    <div className="border-b border-hairline">
      {/* The heading wraps the control, so the row is still a document
          landmark for a screen reader's heading list, not just a button. */}
      <h2>
        <button
          type="button"
          id={buttonId}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group grid w-full grid-cols-12 items-baseline gap-x-gutter gap-y-3 py-8 text-left transition-colors duration-400 ease-expo hover:text-accent lg:py-10"
        >
          <span className="micro tnum col-span-2 text-accent md:col-span-1 md:col-start-1">
            {section.index}
          </span>

          <span
            className={`col-span-8 text-title font-medium transition-colors duration-400 ease-expo md:col-span-5 md:col-start-2 ${
              open ? "text-accent" : ""
            }`}
          >
            {section.title}
          </span>

          {/* Plus → minus: the same mark the Services accordion draws, so the
              disclosure reads as the site's own control rather than a new one. */}
          <span
            aria-hidden="true"
            className="col-span-2 flex justify-end md:col-span-1 md:col-start-12"
          >
            <span className="relative block h-3 w-3">
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
              <span
                className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-600 ease-expo ${
                  open ? "scale-y-0" : "scale-y-100"
                }`}
              />
            </span>
          </span>

          {/* `col-start-3` on narrow layouts so the brief sits under the title
              rather than under the index number, and it takes the row's hover
              with the rest of the control — the same arrangement the services
              accordion's own supporting line uses. */}
          <span className="col-span-10 col-start-3 text-sm leading-relaxed text-ink/55 transition-colors duration-400 ease-expo group-hover:text-accent md:col-span-5 md:col-start-7">
            {section.brief}
          </span>
        </button>
      </h2>

      {/* `inert` rather than aria-hidden: the Contact row's panel holds a real
          link, and aria-hidden alone would leave it in the tab order while
          hidden from assistive tech. Collapsing is CSS under `.js` (see
          globals.css) so a no-JS visitor reads the full policy. */}
      <div
        id={panelId}
        ref={panelRef}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className="legal-panel"
      >
        <div className="grid grid-cols-12 gap-x-gutter">
          <div className="col-span-12 space-y-5 pb-10 text-sm leading-relaxed text-ink/70 md:col-span-5 md:col-start-7">
            {section.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The shared legal document body — Terms, Privacy and Refunds all use it. */
export default function LegalAccordion({ sections }: { sections: LegalSection[] }) {
  return (
    <div>
      {/* The same cue the services accordion carries, in the same meta
          treatment — these rows disclose the same way, so they should say so
          the same way. */}
      <p className="meta mb-6 text-right text-ink/50">Select to expand</p>

      <div className="border-t border-hairline">
        {sections.map((section) => (
          <LegalRow key={section.index} section={section} />
        ))}
      </div>
    </div>
  );
}
