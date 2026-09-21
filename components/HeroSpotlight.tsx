"use client";

import { useEffect, useRef } from "react";
import DataRain from "@/components/DataRain";
import HeroContent from "@/components/HeroContent";

/** How much of the gap to close each frame — lower trails the cursor further. */
const LERP = 0.12;
/** Band width while active — 7rem, matching --reveal-axis-width. */
const ACTIVE_PX = 112;
/**
 * Collapse is timed, not lerped. A per-frame lerp decays asymptotically, so on
 * a slow frame rate it strands a few visible pixels of band indefinitely — the
 * "stuck blue line". A fixed duration reaches exactly 0 regardless of fps.
 */
const COLLAPSE_MS = 380;
/** Pointer must rest this long before the band collapses to a hairline. */
const IDLE_DELAY = 680;
/** Half of --reveal-axis-width (7rem), used to clamp against the edges. */
const HALF_BAND = 56;
/**
 * Below these the band is close enough that another frame would change
 * nothing a viewer could see, so the loop stops instead of easing forever.
 * The lerp is asymptotic: without a floor it never arrives and the rAF never
 * ends, which is what kept ~60 style recalculations a second running on an
 * idle page with the band collapsed and invisible.
 */
const SETTLE_PCT = 0.01;
const SETTLE_PX = 0.05;
/** LERP is authored against a 60fps frame; this keeps that feel at any rate. */
const FRAME_MS = 1000 / 60;
/**
 * Quiet time after the last scroll event before the band reattaches to the
 * cursor. Short enough that coming back into the hero feels immediate, long
 * enough not to fire mid-gesture on a trackpad's stream of small deltas.
 */
const SCROLL_SETTLE_MS = 110;

/** Desktop, real cursor only. */
const ENABLE_QUERY = "(min-width: 64rem) and (hover: hover) and (pointer: fine)";

export default function HeroSpotlight() {
  const layerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const hero = sectionRef.current;
    if (!layer || !hero) return;

    const root = document.documentElement;
    const enabled = window.matchMedia(ENABLE_QUERY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let idleTimer: number | undefined;
    let currentPosition = 50;
    let targetPosition = 50;
    let currentWidth = 0;
    let targetWidth = 0;
    let collapseFrom = 0;
    let collapseStart = 0;
    let anchorEl: Element | null = null;
    let running = false;

    /**
     * Last real cursor position, in viewport pixels.
     *
     * The band used to know where the pointer was only for as long as
     * pointermove events kept arriving. Scrolling collapses it by design, so
     * coming back up into the hero with a still cursor left nothing to re-open
     * it: the effect waited for a move that never came, and when one finally
     * did the band slid in from wherever it had been parked rather than
     * appearing under the cursor. Keeping the coordinate means the pointer
     * stays the source of truth across the seam in both directions.
     *
     * Recorded on every move including while the wipe owns the band, because
     * it is two number assignments and no layout read — the reason the old
     * code avoided work here does not apply.
     */
    let lastPointerX = -1;
    let lastPointerY = -1;
    let scrollEndTimer: number | undefined;

    // Measured on resize, never per pointermove. `--reveal-position` is a `%`
    // resolving against the hero's content box, so the pointer has to be
    // measured against that same box. Reading `clientWidth` on every move —
    // interleaved with this loop's own writes — was a layout read per event.
    let cachedWidth = 0;
    const measureWidth = () => {
      cachedWidth =
        hero.clientWidth || document.documentElement.clientWidth || window.innerWidth;
    };
    const layoutWidth = () => cachedWidth || 1;

    const clampPosition = (pct: number) => {
      // Keep the band inside the viewport rather than letting it clip off-edge.
      const halfPct = (HALF_BAND / layoutWidth()) * 100;
      return Math.min(100 - halfPct, Math.max(halfPct, pct));
    };

    // One tick writes both properties, so the band's geometry and the content
    // it clips can never be a frame out of step with each other.
    // The band — and the header's inverted copy, which is fixed to the top of
    // the viewport — only exist while the hero is on screen. Without this the
    // header copy paints a blue block over Work, Practice and everything
    // below whenever the band has any width. Driven by scroll rather than by
    // every frame, since only scrolling can change the answer.
    const syncReady = () => {
      if (hero.getBoundingClientRect().bottom > 0) root.dataset.revealReady = "true";
      else delete root.dataset.revealReady;
    };

    /**
     * Publish where the pointer band *wants* to be, on its own channel.
     *
     * `--reveal-position` / `--reveal-width` are the band as currently drawn,
     * and during the section wipe the wipe itself owns them. These two say
     * something different and always true: the geometry this component would
     * give the band right now, from the live cursor. SectionWipe reads them so
     * its contraction can resolve into the real band instead of into the rect
     * that was captured on the way down — which is a different place entirely
     * once the cursor has moved, and was the jump at the seam.
     *
     * Centre is refreshed per pointermove and costs no layout read (the clamp
     * runs off the cached width). Width only changes when the band opens or
     * collapses, so it is published from those transitions instead.
     */
    const publishCentre = () => {
      if (!running) return;
      const viewport = layoutWidth();
      const x = lastPointerX >= 0 ? lastPointerX : viewport / 2;
      const pct = clampPosition((x / viewport) * 100);
      root.style.setProperty("--hero-band-centre", `${((pct / 100) * viewport).toFixed(2)}px`);
    };

    const publishWidth = (width: number) => {
      if (!running) return;
      root.style.setProperty("--hero-band-width", `${width.toFixed(2)}px`);
    };

    const write = () => {
      root.style.setProperty("--reveal-position", `${currentPosition.toFixed(3)}%`);
      root.style.setProperty("--reveal-width", `${currentWidth.toFixed(3)}px`);

      // Fully collapsed is not the same as narrow: a zero-width clip still
      // rounds to a visible hairline. Flag the idle state so the stylesheet
      // can take the layer off screen entirely.
      if (currentWidth < 0.5) root.dataset.revealIdle = "true";
      else delete root.dataset.revealIdle;
    };

    let lastFrame = 0;

    const tick = (now: number) => {
      // While the section wipe owns the transition it drives --reveal-position
      // and --reveal-width itself, so the band and the veil stay one shape.
      // Nothing for this loop to do until the wipe hands back.
      if (paused) {
        frame = 0;
        return;
      }

      const dt = lastFrame ? Math.min(100, now - lastFrame) : FRAME_MS;
      lastFrame = now;

      // Frame-rate independent form of the same 0.12-per-60fps-frame ease, so
      // the band converges at one speed on a 60Hz and a 144Hz display.
      const ease = 1 - Math.pow(1 - LERP, dt / FRAME_MS);
      currentPosition += (targetPosition - currentPosition) * ease;

      if (targetWidth === 0) {
        const t = Math.min(1, (now - collapseStart) / COLLAPSE_MS);
        const eased = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
        currentWidth = t >= 1 ? 0 : collapseFrom * (1 - eased);
      } else {
        currentWidth += (targetWidth - currentWidth) * ease;
      }

      if (
        Math.abs(targetPosition - currentPosition) < SETTLE_PCT &&
        Math.abs(targetWidth - currentWidth) < SETTLE_PX
      ) {
        // Land on the exact target rather than near it — a collapse that stops
        // "almost zero" is the residual blue hairline this band must never leave.
        currentPosition = targetPosition;
        currentWidth = targetWidth;
        write();
        frame = 0;
        lastFrame = 0;
        return;
      }

      write();
      frame = window.requestAnimationFrame(tick);
    };

    /** Wake the loop. A no-op while it already runs or the wipe owns the band. */
    const run = () => {
      if (frame || paused || !running) return;
      lastFrame = 0;
      frame = window.requestAnimationFrame(tick);
    };

    const goIdle = () => {
      if (targetWidth === 0) return;
      root.dataset.revealActive = "false";
      collapseFrom = currentWidth;
      collapseStart = performance.now();
      targetWidth = 0;
      publishWidth(0);
      run();
    };

    const markActive = () => {
      root.dataset.revealActive = "true";
      targetWidth = ACTIVE_PX;
      publishWidth(ACTIVE_PX);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(goIdle, IDLE_DELAY);
      run();
    };

    /** Is the cursor actually over the hero right now? */
    const pointerInsideHero = () => {
      if (lastPointerX < 0 || lastPointerY < 0) return false;
      const rect = hero.getBoundingClientRect();
      return (
        lastPointerY >= rect.top &&
        lastPointerY <= rect.bottom &&
        lastPointerX >= rect.left &&
        lastPointerX <= rect.right
      );
    };

    /**
     * Re-attach the band to the live cursor position.
     *
     * Position is *snapped*, not eased: this runs when the band is collapsed
     * and invisible, so there is nothing on screen to jump, and easing from the
     * old parked position is exactly the drift that made coming back up into
     * the hero feel disconnected. Width still opens through the normal tween.
     */
    const reconnect = () => {
      if (paused || !running) return;
      // A hovered anchor owns the position outright; don't fight it.
      if (anchorEl) return;
      if (!pointerInsideHero()) return;

      const pct = clampPosition((lastPointerX / layoutWidth()) * 100);
      currentPosition = pct;
      targetPosition = pct;
      markActive();
    };

    /**
     * Scrolling holds the band closed — that part is deliberate and unchanged.
     * The moment it stops, the band reopens under wherever the cursor actually
     * is, so re-entering the hero needs no pointer movement to wake it. One
     * bounding-box read per scroll gesture, not per frame.
     */
    const onScrollEnd = () => {
      syncReady();
      reconnect();
    };

    // While the section wipe owns the transition, the band freezes rather than
    // fighting it for the same screen space.
    let paused = false;

    const onRevealPause = () => {
      paused = true;
      window.clearTimeout(idleTimer);
    };

    const onRevealResume = (event: Event) => {
      paused = false;
      const detail = (event as CustomEvent<{ centrePct?: number }>).detail;

      currentWidth = 0;
      targetWidth = 0;
      root.style.setProperty("--reveal-width", "0px");
      root.dataset.revealActive = "false";
      root.dataset.revealIdle = "true";

      if (pointerInsideHero()) {
        // The cursor outranks the handover point. Resuming at the wipe's centre
        // while the pointer sat somewhere else is what read as the band
        // "resetting to a midpoint" on the way back up.
        const pct = clampPosition((lastPointerX / layoutWidth()) * 100);
        currentPosition = pct;
        targetPosition = pct;
      } else if (typeof detail?.centrePct === "number" && Number.isFinite(detail.centrePct)) {
        // No cursor over the hero — pick up exactly where the scroll motion
        // left the band. Width stays at zero, so the next pointermove opens it
        // in place with no jump.
        currentPosition = clampPosition(detail.centrePct);
        targetPosition = currentPosition;
      }

      run();
      // If the gesture has already finished, reopen straight away rather than
      // waiting for a move that a still cursor will never send.
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(onScrollEnd, SCROLL_SETTLE_MS);
    };

    const onPointerMove = (event: PointerEvent) => {
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      // Before the pause check on purpose: while the wipe is driving the band
      // this channel is the only thing still tracking the cursor, and it is
      // what the wipe contracts back into.
      publishCentre();
      if (paused) return;
      if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        targetPosition = clampPosition(((rect.left + rect.width / 2) / layoutWidth()) * 100);
      } else {
        targetPosition = clampPosition((event.clientX / layoutWidth()) * 100);
      }
      markActive();
    };

    // Delegated: the anchor (menu button) lives in the header, mounted apart.
    const anchorFrom = (node: EventTarget | null) =>
      node instanceof Element ? node.closest("[data-reveal-anchor]") : null;

    const onPointerOver = (event: PointerEvent) => {
      if (paused) return;
      const found = anchorFrom(event.target);
      if (!found) return;
      anchorEl = found;
      const rect = found.getBoundingClientRect();
      targetPosition = clampPosition(((rect.left + rect.width / 2) / layoutWidth()) * 100);
      markActive();
    };

    const onPointerOut = (event: PointerEvent) => {
      const found = anchorFrom(event.target);
      if (!found || found !== anchorEl) return;
      if (event.relatedTarget instanceof Node && found.contains(event.relatedTarget)) return;
      anchorEl = null;
      markActive();
    };

    // Scrolling moves content under a stationary cursor, so the band would
    // otherwise hang around as a stray sliver at its last position. Collapse
    // it immediately; the next real pointermove re-opens it.
    const onScroll = () => {
      syncReady();
      // Never collapse while the wipe is driving the band — that is what made
      // the stripe disappear from the hero mid-transition.
      if (paused) return;
      window.clearTimeout(idleTimer);
      anchorEl = null;
      if (root.dataset.revealActive === "true") goIdle();
      // Re-arm on the trailing edge of the gesture, whichever direction it ran.
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(onScrollEnd, SCROLL_SETTLE_MS);
    };

    // A resize changes the percentage a pointer position maps to, so the cached
    // width is refreshed and the clamp re-applied to where the band already is.
    const onResize = () => {
      measureWidth();
      syncReady();
      targetPosition = clampPosition(targetPosition);
      publishCentre();
      run();
    };

    const start = () => {
      if (running) return;
      running = true;
      root.dataset.revealActive = "false";
      root.dataset.revealIdle = "true";
      measureWidth();
      syncReady();
      publishCentre();
      publishWidth(0);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      window.addEventListener("site:reveal-pause", onRevealPause);
      window.addEventListener("site:reveal-resume", onRevealResume);
      document.addEventListener("pointerover", onPointerOver);
      document.addEventListener("pointerout", onPointerOut);
      run();
    };

    const stop = () => {
      if (!running) return;
      running = false;
      delete root.dataset.revealReady;
      root.dataset.revealActive = "false";
      targetWidth = 0;
      currentWidth = 0;
      root.style.setProperty("--reveal-width", "0px");
      root.dataset.revealIdle = "true";
      // Touch and reduced-motion visitors never get a band; leaving the channel
      // behind would have SectionWipe contract toward a band that cannot exist.
      root.style.removeProperty("--hero-band-centre");
      root.style.removeProperty("--hero-band-width");
      window.clearTimeout(idleTimer);
      window.clearTimeout(scrollEndTimer);
      window.cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("site:reveal-pause", onRevealPause);
      window.removeEventListener("site:reveal-resume", onRevealResume);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
    };

    const sync = () => (enabled.matches && !reduced.matches ? start() : stop());

    sync();
    enabled.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      stop();
      enabled.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-hero
      className="relative isolate overflow-hidden bg-mist"
    >
      {/* Layer 1 — the real, interactive hero.

          The rain sits behind it at its own z-0; HeroContent gets an
          explicit z-10 rather than relying on default stacking, since a
          positioned (absolute) sibling at z-0 paints ABOVE plain in-flow
          content per the CSS stacking order, not below it. */}
      <div className="relative z-0">
        <DataRain tone="ambient" opacity={0.025} className="absolute inset-0 z-0" />
        <div className="relative z-10">
          <HeroContent variant="base" />
        </div>
      </div>

      {/* Laid out to the band's live geometry so its getBoundingClientRect()
          reports the band's real, currently-rendered position. The band itself
          is a clip-path, whose border box is the whole hero and therefore
          useless to measure. */}
      <div
        data-reveal-band-marker
        aria-hidden="true"
        className="pointer-events-none absolute top-0 h-px opacity-0"
        style={{
          left: "calc(var(--reveal-position) - var(--reveal-width) / 2)",
          width: "var(--reveal-width)",
        }}
      />

      {/* Layer 2 — inverted mirror, clipped to the band.

          `DataRain tone="bright"` needs no mask, opacity transition, or
          pointer listener of its own here — this whole div already carries
          `.reveal-clip`, driven by the same --reveal-position/--reveal-width
          HeroSpotlight's own pointer tracking publishes for the text
          reveal. Rain drawn inside it brightens and fades exactly in step
          with that existing band, for free. `fade={false}` because the
          radial edge-fade is what makes the ambient layer taper off before
          the section boundary — inside a band already this narrow, it would
          just double up on clipping the same handful of characters. */}
      <div
        ref={layerRef}
        aria-hidden="true"
        inert
        className="reveal-clip reveal-layer pointer-events-none absolute inset-0 z-20 bg-accent"
      >
        <DataRain tone="bright" fade={false} className="absolute inset-0 z-0" />
        <div className="relative z-10">
          <HeroContent variant="reveal" />
        </div>
      </div>
    </section>
  );
}
