"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { DURATION, EASE, gsap } from "@/lib/gsap";

const LINE_SELECTOR = "[data-reveal-line] > span";
const FADE_SELECTOR = "[data-reveal-fade]";

/**
 * Section-level reveal driver.
 *
 * Attach the returned ref to any container. Inside it:
 *   • `[data-reveal-block]`        — one animation group (defaults to the container)
 *   • `[data-reveal-block="load"]` — plays on mount instead of on scroll
 *   • `[data-reveal-line] > span`  — masked line, slides 110% → 0%
 *   • `[data-reveal-fade]`         — block, fades and rises 18px
 *
 * Pre-hidden states live in globals.css under `.js` so nothing flashes before
 * this runs, and so the page stays fully readable with JavaScript disabled.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const lines = gsap.utils.toArray<HTMLElement>(LINE_SELECTOR, root);
      const fades = gsap.utils.toArray<HTMLElement>(FADE_SELECTOR, root);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const all = [...lines, ...fades];
        if (all.length > 0) {
          gsap.set(all, { clearProps: "all", yPercent: 0, y: 0, opacity: 1 });
        }
        return;
      }

      // Own the initial state in JS so the CSS pre-hide and the tween agree.
      //
      // `y: 0` is load-bearing. GSAP resolves the CSS pre-hide's
      // `translateY(110%)` into a *pixel* y offset when it first reads the
      // element, and `yPercent` is applied on top of that rather than
      // replacing it. Without zeroing y, the tween animates the percentage to
      // 0 while the stale pixel offset survives, leaving every line parked
      // just below its own overflow-hidden mask — invisible.
      // 120, matching the CSS pre-hide. The mask box is the line plus the
      // 0.18em of descender padding `.reveal-line` now carries, so clearing it
      // takes ~118% of the line's own height; 110 left a band of the line's
      // top edge sitting inside the box, visible before the tween started.
      // Guarded the same way the per-block tweens below are: a scope that
      // holds no reveal targets is legitimate (several sections wrap content
      // that reveals by other means), and handing gsap.set an empty array
      // makes it warn "GSAP target not found" on every such mount.
      if (lines.length > 0) gsap.set(lines, { yPercent: 120, y: 0, opacity: 0 });
      if (fades.length > 0) gsap.set(fades, { yPercent: 0, y: 18, opacity: 0 });

      const explicit = gsap.utils.toArray<HTMLElement>("[data-reveal-block]", root);
      const blocks = explicit.length > 0 ? explicit : [root as HTMLElement];

      blocks.forEach((block) => {
        const blockLines = gsap.utils.toArray<HTMLElement>(LINE_SELECTOR, block);
        const blockFades = gsap.utils.toArray<HTMLElement>(FADE_SELECTOR, block);
        if (blockLines.length === 0 && blockFades.length === 0) return;

        const onLoad = block.dataset.revealBlock === "load";

        const tl = gsap.timeline({
          delay: onLoad ? 0.15 : 0,
          scrollTrigger: onLoad
            ? undefined
            : { trigger: block, start: "top 88%", once: true },
        });

        if (blockLines.length > 0) {
          tl.to(
            blockLines,
            {
              yPercent: 0,
              y: 0,
              opacity: 1,
              duration: DURATION.line,
              ease: EASE,
              stagger: 0.075,
            },
            0,
          );
        }

        if (blockFades.length > 0) {
          tl.to(
            blockFades,
            {
              y: 0,
              opacity: 1,
              duration: DURATION.fade,
              ease: EASE,
              stagger: 0.06,
            },
            blockLines.length > 0 ? 0.18 : 0,
          );
        }
      });
    },
    { scope },
  );

  return scope;
}

/**
 * Counts a numeric metric up when it scrolls into view.
 * Returns a ref for the element whose textContent should be driven.
 */
export function useCountUp(target: number, decimals = 0) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = target.toFixed(decimals);
        return;
      }

      const counter = { value: 0 };
      el.textContent = "0";

      gsap.to(counter, {
        value: target,
        duration: 1.9,
        ease: EASE,
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => {
          el.textContent = counter.value.toFixed(decimals);
        },
      });
    },
    { dependencies: [target, decimals] },
  );

  return ref;
}
