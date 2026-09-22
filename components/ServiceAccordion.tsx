"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import BracketLink from "@/components/BracketLink";
import Glyph, { type GlyphHandle } from "@/components/Glyph";
import { CHOREO_OFFSETS, choreographyPool } from "@/lib/glyphChoreographies";
import { EASE, ScrollTrigger, gsap } from "@/lib/gsap";
import type { Choreography } from "@/lib/glyphChoreographies";
import { serviceSlug, type Service } from "@/lib/services";

function AccordionRow({
  service,
  choreography,
  open,
  onToggle,
}: {
  service: Service;
  choreography: Choreography;
  open: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<GlyphHandle>(null);
  const id = useId();
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;
  const [hovered, setHovered] = useState(false);
  const slug = serviceSlug(service.title);

  useGSAP(
    () => {
      const el = contentRef.current;
      if (!el) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.to(el, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
        duration: reduced ? 0 : 0.7,
        ease: EASE,
        // The page got taller or shorter — scroll triggers must re-measure.
        onComplete: () => ScrollTrigger.refresh(),
      });
    },
    { dependencies: [open] },
  );

  return (
    <div id={`service-${slug}`} data-service={slug} className="scroll-mt-[calc(var(--header-h)+2rem)] border-b border-hairline">
      {/* h2, not h3: this accordion is only ever the offerings list on
          /services, where the rows are the first headings under the page
          h1 and sit alongside the Engagement models and Process section
          headings. The home page uses ServiceCard, which stays h3 under
          its own section h2. */}
      <h2>
        <button
          type="button"
          id={buttonId}
          onClick={onToggle}
          onMouseEnter={() => {
            setHovered(true);
            glyphRef.current?.play();
          }}
          onMouseLeave={() => {
            setHovered(false);
            glyphRef.current?.reset();
          }}
          aria-expanded={open}
          aria-controls={panelId}
          className="group grid w-full grid-cols-12 items-baseline gap-x-gutter gap-y-3 py-8 text-left transition-colors duration-400 ease-expo hover:text-accent lg:py-10"
        >
          {/* Same glyph as the homepage cards, sized down for this denser
              row — the 40px card size measured off codedgar would crowd a
              row this text-heavy, and nothing in the source material speaks
              to sizing it for an accordion layout at all. Dimmed via
              opacity rather than currentColor now that the glyph's own
              fill comes from --glyph-color, not the wrapper's text color. */}
          <span
            className={`col-span-2 transition-opacity duration-400 ease-expo md:col-span-1 ${
              open ? "opacity-100" : "opacity-30 group-hover:opacity-100"
            }`}
          >
            <Glyph
              ref={glyphRef}
              choreography={choreography}
              color="black"
              hovered={hovered}
              className="h-9 w-9"
            />
          </span>

          <span
            className={`col-span-8 text-title font-medium transition-colors duration-400 ease-expo md:col-span-5 ${
              open ? "text-accent" : ""
            }`}
          >
            {service.label}
          </span>

          <span className="col-span-12 col-start-3 text-sm text-ink/50 transition-colors duration-400 ease-expo group-hover:text-accent md:col-span-4 md:col-start-7">
            {service.short}
          </span>

          {/* Plus → minus */}
          <span
            aria-hidden="true"
            className="col-span-2 flex justify-end md:col-span-2"
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
        </button>
      </h2>

      <div
        id={panelId}
        ref={contentRef}
        role="region"
        aria-labelledby={buttonId}
        // `inert`, not aria-hidden — the same choice, for the same reason, as
        // the legal accordion next door: a collapsed panel still holds a real
        // "Scope this" link, and aria-hidden alone leaves it in the tab order
        // while hiding it from assistive tech. With every row closed by
        // default that was four invisible tab stops on arrival.
        inert={!open}
        className="h-0 overflow-hidden opacity-0"
      >
        <div className="grid gap-x-gutter gap-y-10 pb-14 md:grid-cols-12">
          <p className="text-lede leading-relaxed text-ink/60 md:col-span-5 md:col-start-2">
            {service.body}
          </p>

          <div className="md:col-span-3">
            <p className="meta text-ink/35">Deliverables</p>
            <ul className="mt-5 space-y-3">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-3 text-sm text-ink/70">
                  <span className="mt-[0.45rem] h-px w-3 shrink-0 bg-accent" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="meta text-ink/35">Stack</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {service.stack.map((s) => (
                <li
                  key={s}
                  className="micro border border-hairline px-2.5 py-1.5 text-ink/60 transition-colors duration-400 ease-expo hover:border-accent hover:text-accent"
                >
                  {s}
                </li>
              ))}
            </ul>

            <p className="meta mt-10 text-ink/35">Typical duration</p>
            <p className="mt-3 text-sm text-ink/70">{service.duration}</p>

            <BracketLink href="/contact" size="sm" className="mt-8">
              Scope this
            </BracketLink>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Expandable breakdown of the studio's four offerings. One open at a time. */
export default function ServiceAccordion({ services }: { services: Service[] }) {
  // Closed by default. Arriving at /services from the menu, the home page's
  // "Explore all services" or a direct URL should present the four offerings
  // as equal choices — opening the first one on load made it look picked out
  // for a reason, and the reason never existed. The only thing that opens a
  // row on arrival is a deep link naming that row, handled below.
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  /**
   * Deep-link support: /services#<slug> opens that row and scrolls to it.
   *
   * On mount *and* on every subsequent hash change, which is the part that was
   * missing. Arriving from a home-page card works either way, because that is
   * a fresh document — but once the visitor is on /services, moving between
   * hashes is a same-document navigation and the component never remounts.
   * Back and forward are the same story. With a mount-only effect the row
   * opened by the first hash simply stayed open and every later hash did
   * nothing, so /services#data-science-analytics could sit there showing
   * AI & Intelligent Workflows.
   *
   * `hashchange` covers in-page moves; `popstate` covers back/forward, which
   * does not always fire `hashchange` when the path changes too. Applying the
   * same function to both keeps one definition of what a hash means.
   *
   * A hash that matches nothing is left alone rather than closing whatever is
   * open — an unknown fragment should not undo the visitor's own state.
   */
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const target = services.find((s) => serviceSlug(s.title) === hash);
      if (!target) return;

      setOpenIndex(target.index);
      // Wait a frame so the row (and its expanding panel) has a chance to
      // lay out before scrolling — an immediate scrollIntoView can measure
      // against the pre-expand height and land short.
      requestAnimationFrame(() => {
        document.getElementById(`service-${hash}`)?.scrollIntoView({ block: "start" });
      });
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    window.addEventListener("popstate", applyHash);
    return () => {
      window.removeEventListener("hashchange", applyHash);
      window.removeEventListener("popstate", applyHash);
    };
  }, [services]);

  return (
    <div className="border-t border-hairline">
      {services.map((service, i) => (
        <AccordionRow
          key={service.index}
          service={service}
          choreography={choreographyPool[CHOREO_OFFSETS.servicesOfferings + i]}
          open={openIndex === service.index}
          onToggle={() =>
            setOpenIndex((current) => (current === service.index ? null : service.index))
          }
        />
      ))}
    </div>
  );
}
