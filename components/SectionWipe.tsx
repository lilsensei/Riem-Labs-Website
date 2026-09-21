"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Where the wipe runs: everywhere, unless the visitor has asked for stillness.
 *
 * There were size conditions here — a width one inherited from the reference,
 * then a 37.5rem height one. Both are gone. The height condition in particular
 * was the wrong shape of test on a phone: browsers there report a viewport
 * that shrinks by the height of the URL bar, and a device that clears 600px
 * once the bar has rolled away can easily be under it at load. That put the
 * whole section on a knife edge for no benefit — the section is far taller
 * than any viewport, so the sweep reads the same however short the window is.
 *
 * With no pointer band on a phone, the hero's band marker resolves to a
 * zero-width point at the centre of the viewport, so captureBand starts the
 * field from a seam there and opens it outward. That is the same code path
 * desktop takes when the pointer is idle.
 */
const ENABLE_QUERY = "(prefers-reduced-motion: no-preference)";

/**
 * How much of the viewport still shows About Us once the blue has fully lifted.
 * The recede finishes here rather than at the section boundary, so the section's
 * real light background is on screen for a beat before the dark stats bar.
 */
export const EXIT_END = "bottom 40%";

const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v));

/**
 * Scroll-driven colour wipe on the hero → About Us seam, plus a custom recede
 * on the About Us → Work seam.
 *
 * Entrance follows specia1ne's handoff: pause the pointer band, measure its
 * live rect, and interpolate that rect out to the full viewport.
 *
 * Exit has no counterpart in specia1ne's source — its hero→work trigger is
 * entrance-only and simply holds at full coverage. This is custom motion built
 * with the same technique in reverse.
 */
export default function SectionWipe({
  children,
  reveal,
  trail,
  className = "",
  id,
}: {
  children: ReactNode;
  /** Inverted mirror of `children`, painted inside the accent veil. */
  reveal?: ReactNode;
  /**
   * Normal-tone mirror of `children`, clipped to the region the veil has
   * already receded past. Gives the section somewhere to land once the blue
   * has gone, instead of leaving the base layer's hidden copy on screen.
   */
  trail?: ReactNode;
  className?: string;
  id?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const veil = veilRef.current;
    if (!section || !veil) return;

    /**
     * The clip geometry is published on the SECTION, not on the veil.
     *
     * Three layers read it now — the veil, the trail, and nothing else may
     * disagree about where the blue's edge is. Writing it once on their common
     * ancestor and letting it inherit is what guarantees they cannot; writing
     * it on the veil alone left the trail with no way to see it.
     */
    const clipHost = section;

    const root = document.documentElement;
    const gate = window.matchMedia(ENABLE_QUERY);

    let cancelled = false;
    let teardown = () => {};
    let active = false;

    /**
     * Set up and tear down as the gate changes, rather than reading it once.
     *
     * A one-shot read meant a viewport that did not qualify at mount never got
     * the wipe, no matter what happened afterwards — rotate the phone, let the
     * URL bar roll away, turn off "reduce motion" mid-visit, and the section
     * stayed permanently on its static fallback until a reload. The gate is a
     * live MediaQueryList; it should be treated as one.
     */
    const start = () => {
      if (active || cancelled) return;
      active = true;

      void (async () => {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);

        // Tells the stylesheet the veil is under scroll control here. Section
        // copy that renders *only* inside the veil keys off this, so a visitor
        // who has asked for reduced motion — the one case left that never gets
        // the wipe — still sees the section's own base copy, painted normally.
        root.dataset.sectionWipe = "true";

        const setClip = (top: number, right: number, bottom: number, left: number) => {
          clipHost.style.setProperty("--section-clip-top", `${top.toFixed(2)}px`);
          clipHost.style.setProperty("--section-clip-right", `${right.toFixed(2)}px`);
          clipHost.style.setProperty("--section-clip-bottom", `${bottom.toFixed(2)}px`);
          clipHost.style.setProperty("--section-clip-left", `${left.toFixed(2)}px`);
        };

        /**
         * Point the hero's pointer band at the same horizontal span as the veil.
         *
         * The hero layer and this veil are each `absolute inset-0` inside their
         * own adjacent sections, so an identical band in both reads as one
         * continuous vertical stripe running across the section boundary — the
         * expansion starts in the hero and carries down, instead of vanishing
         * there and restarting inside About Us.
         */
        /**
         * The layout width, excluding the scrollbar.
         *
         * `window.innerWidth` INCLUDES the scrollbar, but the veil's px insets
         * and the band's `%` position both resolve against the element's content
         * box, which excludes it. Mixing the two put the band ~1.1% off the veil
         * — a ~10px step on each side at the section boundary.
         */
        const layoutWidth = () =>
          section.clientWidth || document.documentElement.clientWidth || window.innerWidth;

        const setBand = (left: number, width: number) => {
          const viewport = layoutWidth() || 1;
          root.style.setProperty(
            "--reveal-position",
            `${(((left + width / 2) / viewport) * 100).toFixed(3)}%`,
          );
          root.style.setProperty("--reveal-width", `${width.toFixed(2)}px`);
        };

        const collapse = () => {
          clipHost.style.setProperty("--section-clip-top", "0px");
          clipHost.style.setProperty("--section-clip-right", "50%");
          clipHost.style.setProperty("--section-clip-bottom", "0px");
          clipHost.style.setProperty("--section-clip-left", "50%");
          delete root.dataset.wipeCover;
        };

        const syncHeaderCover = (visible: boolean, fieldTopViewport: number) => {
          const rect = section.getBoundingClientRect();
          const headerH =
            Number.parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) || 0;
          const covered = visible && fieldTopViewport < headerH && rect.bottom > 0;
          if (covered) root.dataset.wipeCover = "true";
          else delete root.dataset.wipeCover;
        };

        // ── Pointer-band handoff ───────────────────────────────────────────
        // The band is a clip-path, so its own border box is the whole hero and
        // getBoundingClientRect() can't report it. HeroSpotlight renders a 1px
        // marker laid out to the band's live geometry; that rect is the real,
        // currently-rendered position — never a cached custom-property string.
        let startLeft = 0;
        let startWidth = 0;
        /**
         * Whether startLeft/startWidth hold a real handoff rect to animate from.
         *
         * This is the whole of the direction bug. It used to be cleared inside
         * resumeBand(), which onLeave calls the moment the field reaches full
         * width. So by the time the visitor scrolled back up, the flag said
         * "nothing captured" and re-entry re-measured the band — while it was
         * full-bleed. Progress 0 then meant "already the whole viewport", the
         * interpolation had nowhere to travel, and the contraction never
         * played in either direction; worse, the stale full-width rect stayed
         * as the start for the *next* downward pass, which is why the sweep
         * looked right once after a reload and flat every time after that.
         *
         * The rect is now kept across the bottom of the range, exactly so the
         * scroll-up can reverse the scroll-down, and is dropped only when the
         * visitor leaves back above the hero — where the next downward pass
         * should genuinely re-measure from wherever the pointer band then is.
         */
        let hasStart = false;

        const pauseBand = () => window.dispatchEvent(new CustomEvent("site:reveal-pause"));

        const captureBand = () => {
          const marker = document.querySelector<HTMLElement>("[data-reveal-band-marker]");
          const viewport = layoutWidth();
          const rect = marker?.getBoundingClientRect();

          if (rect && rect.width > 0) {
            startWidth = rect.width;
            startLeft = rect.left;
          } else {
            // Band idle (zero width) — start from a seam at its centre.
            startWidth = 0;
            startLeft = rect ? rect.left : viewport / 2;
          }

          hasStart = true;
          pauseBand();
        };

        /**
         * Re-entering from below (scrolling up) must NOT re-measure the band —
         * it is full-bleed at that moment. Reuse the rect captured on the way
         * down so the scroll-up exactly reverses it.
         */
        const reenterFromBelow = () => {
          if (!hasStart) {
            // Arrived under the seam without ever crossing it — a deep link, or
            // a browser restoring scroll position on reload. There is no
            // handoff to reverse, so contract to a centre seam: the same shape
            // the downward pass takes when the band is idle, which is every
            // time on a touch device.
            startWidth = 0;
            startLeft = layoutWidth() / 2;
            hasStart = true;
          }
          pauseBand();
        };

        /**
         * Hand the band back to HeroSpotlight. Deliberately does not touch
         * `hasStart` — see above; the rect has to outlive this.
         */
        const resumeBand = (leftPx: number, widthPx: number) => {
          // layoutWidth(), not window.innerWidth — the latter includes the
          // scrollbar, and handing the band back on that basis offset it from
          // the veil by the scrollbar's width for the frames after the handoff.
          const viewport = layoutWidth() || 1;
          window.dispatchEvent(
            new CustomEvent("site:reveal-resume", {
              detail: { centrePct: ((leftPx + widthPx / 2) / viewport) * 100 },
            }),
          );
        };

        collapse();

        // ── Entrance: band rect → full viewport ────────────────────────────
        const entrance = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
          onEnter: captureBand,
          onEnterBack: reenterFromBelow,
          onUpdate: (self) => {
            if (!hasStart) captureBand();

            const p = gsap.utils.clamp(0, 1, self.progress);
            const viewport = layoutWidth();

            const left = gsap.utils.interpolate(startLeft, 0, p);
            const width = gsap.utils.interpolate(startWidth, viewport, p);
            const right = Math.max(0, viewport - (left + width));

            setClip(0, right, 0, Math.max(0, left));
            setBand(left, width);
            syncHeaderCover(width > 0, section.getBoundingClientRect().top);
          },
          onLeave: () => {
            // Fully expanded. The hero is off screen by now and its layers are
            // gated off, so hand the band back collapsed rather than full-bleed.
            setClip(0, 0, 0, 0);
            resumeBand(startLeft, startWidth);
          },
          onLeaveBack: () => {
            // Back above the hero — hand the band to the cursor again, and let
            // the next downward pass re-measure from wherever it then sits.
            // This is the one place the handoff rect is genuinely spent.
            collapse();
            hasStart = false;
            resumeBand(startLeft, startWidth);
          },
        });

        // ── Exit: the blue's top edge sweeps down through the VIEWPORT ─────
        // Driving clip-top straight from 0 → section height fails: by the time
        // this range runs, the section's top is far above the viewport, so the
        // edge recedes through off-screen space and nothing appears to change
        // until the section has almost gone. Everything below is computed from
        // the section's live viewport rect instead.
        const exit = ScrollTrigger.create({
          trigger: section,
          start: "bottom bottom",
          end: EXIT_END,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = gsap.utils.clamp(0, 1, self.progress);
            const eased = p * p * (3 - 2 * p);

            const rect = section.getBoundingClientRect();
            const height = section.offsetHeight || rect.height;
            const viewportH = window.innerHeight;

            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(viewportH, rect.bottom);

            // Where the blue's top edge should sit on screen right now.
            const fieldTop = visibleTop + eased * (visibleBottom - visibleTop);
            const clipTop = clamp(0, height, fieldTop - rect.top);

            setClip(clipTop, 0, 0, 0);
            syncHeaderCover(eased < 0.999, fieldTop);
          },
          onLeaveBack: () => {
            setClip(0, 0, 0, 0);
          },
          onLeave: () => {
            // Fully lifted — nothing painted for the rest of the section.
            setClip(section.offsetHeight, 0, 0, 0);
            delete root.dataset.wipeCover;
          },
        });

          teardown = () => {
            entrance.kill();
            exit.kill();
            collapse();
            delete root.dataset.sectionWipe;
          };
      })();
    };

    const stop = () => {
      if (!active) return;
      active = false;
      teardown();
      teardown = () => {};
    };

    const sync = () => (gate.matches ? start() : stop());

    sync();
    gate.addEventListener("change", sync);

    return () => {
      cancelled = true;
      gate.removeEventListener("change", sync);
      delete document.documentElement.dataset.wipeCover;
      delete document.documentElement.dataset.sectionWipe;
      stop();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      data-wipe-root
      className={`relative overflow-hidden ${className}`}
    >
      {children}

      {/* Everything the blue has finished with, in normal tone. Sits below the
          veil so the two never fight over the same strip of screen. */}
      {trail ? (
        <div
          aria-hidden="true"
          inert
          className="section-trail pointer-events-none absolute inset-0 z-10"
        >
          {trail}
        </div>
      ) : null}

      <div
        ref={veilRef}
        aria-hidden="true"
        inert
        className="section-sticky pointer-events-none absolute inset-0 z-20 bg-accent"
      >
        {reveal}
      </div>
    </section>
  );
}
