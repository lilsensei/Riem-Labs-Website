"use client";

import { useEffect, useRef } from "react";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";

/** Desktop, real cursor only — the same gate the hero reveal uses. */
const ENABLE_QUERY = "(hover: hover) and (pointer: fine)";
/** How long the thumb stays up after the last scroll or pointer contact. */
const IDLE_MS = 900;
/** Never let the thumb shrink below this, however long the page is. */
const MIN_THUMB = 32;

/**
 * Riem's own scrollbar.
 *
 * The native Windows scrollbar is 15px of permanent chrome that also carried
 * two real bugs: it made `clientWidth` 15px narrower than `innerWidth`, which
 * is what left a dead strip at the right of the hero where no pointermove can
 * ever fire, and it made the whole page jump sideways by 15px whenever the
 * menu's body-lock removed it.
 *
 * Hiding it is therefore a structural fix, not decoration — but only where
 * there is a real cursor to drive this replacement, and only once JS has
 * confirmed it is running. `data-custom-scrollbar` is set from here, so a
 * failed or disabled script leaves the native scrollbar exactly where it was.
 *
 * Position is written as a transform on one element, so scrolling never
 * touches layout. Lenis keeps ownership of the scroll position: this only
 * reads it, and a drag pauses Lenis rather than competing with it — there
 * is no second scroll model.
 */
export default function PageScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const { stop: stopLenis, start: startLenis } = useSmoothScroll();

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const root = document.documentElement;
    const enabled = window.matchMedia(ENABLE_QUERY);

    let frame = 0;
    let idleTimer: number | undefined;
    let dragging = false;
    let grabOffset = 0;
    let trackH = 0;
    let thumbH = 0;
    let maxScroll = 0;
    let running = false;

    // Re-measured on resize only — never per scroll event.
    const measure = () => {
      const offset = 8;
      trackH = Math.max(0, window.innerHeight - offset * 2);
      const docH = document.documentElement.scrollHeight;
      maxScroll = Math.max(0, docH - window.innerHeight);
      const ratio = docH > 0 ? window.innerHeight / docH : 1;
      thumbH = maxScroll > 0 ? Math.max(MIN_THUMB, Math.round(trackH * ratio)) : 0;
      thumb.style.height = `${thumbH}px`;
      // A page that does not scroll gets no scrollbar at all.
      root.dataset.scrollbarActive = maxScroll > 0 ? "true" : "false";
    };

    const paint = () => {
      frame = 0;
      if (maxScroll <= 0) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const y = progress * (trackH - thumbH);
      thumb.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    const schedulePaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const show = () => {
      root.dataset.scrollbarVisible = "true";
      window.clearTimeout(idleTimer);
      // While dragging or hovering the track the thumb must not time out.
      if (dragging) return;
      idleTimer = window.setTimeout(() => {
        if (!dragging) delete root.dataset.scrollbarVisible;
      }, IDLE_MS);
    };

    const onScroll = () => {
      schedulePaint();
      show();
    };

    const onResize = () => {
      measure();
      schedulePaint();
    };

    // --- drag -------------------------------------------------------------
    // Lenis is paused for the duration of a drag and handed the position back
    // on release. Asking it to tween to each pointer position instead left the
    // page motionless: its own inertia was still in flight and swallowed the
    // per-move target. Pausing is also what the drawer's scroll lock does, so
    // this is the pattern already proven in this codebase.
    const scrollFromPointer = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      const span = trackH - thumbH;
      if (span <= 0) return;
      const local = clientY - rect.top - grabOffset;
      const progress = Math.min(1, Math.max(0, local / span));
      window.scrollTo(0, progress * maxScroll);
    };

    const onThumbPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || maxScroll <= 0) return;
      event.preventDefault();
      dragging = true;
      root.dataset.scrollbarDragging = "true";
      grabOffset = event.clientY - thumb.getBoundingClientRect().top;
      thumb.setPointerCapture(event.pointerId);
      stopLenis();
      show();
    };

    const onThumbPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      event.preventDefault();
      scrollFromPointer(event.clientY);
    };

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete root.dataset.scrollbarDragging;
      if (thumb.hasPointerCapture(event.pointerId)) thumb.releasePointerCapture(event.pointerId);
      // Lenis re-syncs from wherever native scroll actually is when restarted.
      startLenis();
      show();
    };

    // Clicking the bare track jumps the thumb to that point, then drags.
    const onTrackPointerDown = (event: PointerEvent) => {
      if (event.target === thumb || event.button !== 0 || maxScroll <= 0) return;
      grabOffset = thumbH / 2;
      stopLenis();
      scrollFromPointer(event.clientY);
      startLenis();
      show();
    };

    const start = () => {
      if (running) return;
      running = true;
      root.dataset.customScrollbar = "true";
      measure();
      paint();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      track.addEventListener("pointerenter", show);
      track.addEventListener("pointerdown", onTrackPointerDown);
      thumb.addEventListener("pointerdown", onThumbPointerDown);
      thumb.addEventListener("pointermove", onThumbPointerMove);
      thumb.addEventListener("pointerup", endDrag);
      thumb.addEventListener("pointercancel", endDrag);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      delete root.dataset.customScrollbar;
      delete root.dataset.scrollbarVisible;
      delete root.dataset.scrollbarActive;
      delete root.dataset.scrollbarDragging;
      window.clearTimeout(idleTimer);
      window.cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      track.removeEventListener("pointerenter", show);
      track.removeEventListener("pointerdown", onTrackPointerDown);
      thumb.removeEventListener("pointerdown", onThumbPointerDown);
      thumb.removeEventListener("pointermove", onThumbPointerMove);
      thumb.removeEventListener("pointerup", endDrag);
      thumb.removeEventListener("pointercancel", endDrag);
    };

    const sync = () => (enabled.matches ? start() : stop());

    sync();
    enabled.addEventListener("change", sync);

    // The document grows and shrinks as sections reveal and accordions open,
    // so the thumb's height has to follow the page, not just the window.
    const observer = new ResizeObserver(() => {
      measure();
      schedulePaint();
    });
    observer.observe(document.body);

    return () => {
      stop();
      observer.disconnect();
      enabled.removeEventListener("change", sync);
    };
  }, [stopLenis, startLenis]);

  return (
    <div ref={trackRef} aria-hidden="true" className="site-scrollbar">
      <div ref={thumbRef} className="site-scrollbar__thumb" />
    </div>
  );
}
