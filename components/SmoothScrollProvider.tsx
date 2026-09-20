"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ScrollTrigger, gsap } from "@/lib/gsap";

type ScrollTo = (target: string | number | HTMLElement, offset?: number) => void;

type SmoothScrollContextValue = {
  scrollTo: ScrollTo;
  /** Jump with no easing — the scrollbar thumb must track the pointer 1:1
   *  while dragging, not ease toward it a beat later. */
  scrollToImmediate: (y: number) => void;
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

export function useSmoothScroll(): SmoothScrollContextValue {
  const ctx = useContext(SmoothScrollContext);
  // A no-op fallback keeps components usable outside the provider (e.g. tests).
  return (
    ctx ?? {
      scrollTo: () => {},
      scrollToImmediate: () => {},
      stop: () => {},
      start: () => {},
    }
  );
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const [, setReady] = useState(false);

  // Measured once, before anything ever locks scroll, so the value is the
  // real width of a present scrollbar rather than 0 from a moment when it
  // had already been removed. `scrollbar-gutter: stable` looked like the
  // cleaner fix for the menu drawer's width jump, but a JS-measured
  // `padding-right` — the older, universally-supported technique — is what
  // globals.css's `lenis-stopped` rule actually applies, since it doesn't
  // depend on browser support for a newer CSS property.
  useEffect(() => {
    const width = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--scrollbar-width", `${width}px`);
  }, []);

  useEffect(() => {
    // Respect the OS preference — no inertia hijacking for reduced-motion users.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Exponential out — the JS twin of cubic-bezier(0.16, 1, 0.3, 1).
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
      autoRaf: false,
    });

    lenisRef.current = lenis;
    setReady(true);

    // Lenis owns the scroll position, so ScrollTrigger must read from it.
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // One RAF loop for both libraries — GSAP's ticker is the source of truth.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lenis owns scrollTop, so the browser's native hash jump never lands.
  // Anything targeting an in-page anchor has to be routed through it.
  const goToHash = useCallback((hash: string, immediate: boolean) => {
    if (!hash || hash.length < 2) return false;

    let el: HTMLElement | null = null;
    try {
      el = document.querySelector<HTMLElement>(hash);
    } catch {
      return false; // Not a valid selector — treat as no anchor.
    }
    if (!el) return false;

    const offset = -(Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
    ) || 0);

    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { offset, immediate, duration: 1.1 });
    else window.scrollTo({ top: el.offsetTop + offset, behavior: immediate ? "auto" : "smooth" });

    return true;
  }, []);

  // New route: honour an anchor if there is one, otherwise jump to the top.
  // Then let ScrollTrigger re-measure the new DOM.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      if (!goToHash(window.location.hash, true)) {
        lenisRef.current?.scrollTo(0, { immediate: true });
        if (!lenisRef.current) window.scrollTo(0, 0);
      }
      ScrollTrigger.refresh();
    });

    return () => window.cancelAnimationFrame(id);
  }, [pathname, goToHash]);

  // Same-page anchor clicks change only the hash, so pathname never fires.
  useEffect(() => {
    const onHashChange = () => goToHash(window.location.hash, false);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [goToHash]);

  const scrollTo = useCallback<ScrollTo>((target, offset = 0) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.2 });
      return;
    }

    if (typeof target === "number") {
      window.scrollTo({ top: target + offset, behavior: "smooth" });
      return;
    }

    const el =
      typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (el) {
      window.scrollTo({ top: el.offsetTop + offset, behavior: "smooth" });
    }
  }, []);

  const scrollToImmediate = useCallback((y: number) => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, []);

  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, scrollToImmediate, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
