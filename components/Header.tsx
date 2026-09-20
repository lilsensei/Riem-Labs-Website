"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import HeaderBar from "@/components/HeaderBar";
import { EXIT_END } from "@/components/SectionWipe";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";
import { ScrollTrigger } from "@/lib/gsap";
import { legalLinks, navigation } from "@/lib/site";

/**
 * Scroll distance the bar is driven over, in px.
 *
 * Kept equal to --nav-travel (6.5rem) so the bar moves exactly one pixel per
 * pixel of scroll. That 1:1 relationship is the whole point: it makes the bar
 * read as part of the page rather than an element playing an animation, and
 * scrolling back up reverses it for free because it is the same mapping.
 */
const NAV_TRAVEL = 104;

/** Where the scroll-spy decides a section has become the current one. */
const SPY_LINE = 45;

/**
 * How far down still counts as "at the top", in px.
 *
 * The availability note lives in the band between the bar and the page, which
 * is empty space only while nothing has scrolled up into it yet.
 */
const TOP_ZONE = 8;

/**
 * `useEffect` runs after the browser has already painted the new DOM — so
 * the drawer's `data-overlay-state="open"` commits and the panel's slide
 * transition starts a full frame before a plain `useEffect` gets to call
 * `stop()`. That gap is exactly the window the scrollbar disappears in,
 * mid-transition, which is what read as a jump partway through the open
 * rather than something present for the whole animation. `useLayoutEffect`
 * runs synchronously before paint, so the lock lands in the very first
 * frame the panel is visible in. SSR has no window, so it falls back to
 * `useEffect` there — this component never locks scroll during render
 * anyway, only from a browser event, so the fallback never actually fires.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navGone, setNavGone] = useState(false);
  /** True while the page is at rest at the very top. */
  const [atTop, setAtTop] = useState(true);
  /** Which menu entry the home page is currently scrolled into. */
  const [activeKey, setActiveKey] = useState<string | null>(null);
  /**
   * Where the marker's open animation starts from.
   *
   * "dot" when the pointer had already collapsed the four marks to centre
   * before the click, so the cross grows straight out of that single dot;
   * "grid" when the click came cold and the marks have to gather first.
   */
  const [origin, setOrigin] = useState<"grid" | "dot" | "close">("grid");
  const { stop, start, scrollTo } = useSmoothScroll();

  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const goneRef = useRef(false);
  const atTopRef = useRef(true);
  const scrollLockY = useRef(0);
  /** The route the lock was taken on, so the unlock can tell a dismissal
   *  apart from a navigation. */
  const scrollLockPath = useRef<string | null>(null);

  /**
   * The only way out of the open state.
   *
   * It sets the origin as well as the flag, because the marker's return
   * animation is selected by `data-menu-origin` — and the drawer's own Close
   * button, the backdrop and Escape all land here rather than going through
   * the toggle. Without this they closed the panel while leaving the origin on
   * whatever opened it, no rule matched, and the cross snapped back to a grid
   * instead of unfolding into one.
   */
  const close = useCallback(() => {
    setOrigin("close");
    setOpen(false);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  /**
   * Freeze the page and flag the open state on <html>.
   *
   * `data-menu-open` does double duty: both reveal layers key off it to
   * suppress themselves, so nothing is left tracking the pointer or sweeping
   * behind the scrim while the drawer is up, and it's what the CSS keys the
   * `.reveal-clip` suppression rule on. The actual scroll lock is done here
   * directly, as inline styles on <body>, rather than through a CSS rule —
   * `position: fixed` takes body out of flow entirely, which leaves nothing
   * for <html> to scroll and needs no `overflow: hidden` of its own. That's
   * a deliberate swap from an earlier `overflow: hidden` +
   * `padding-right: var(--scrollbar-width)` compensation technique: that
   * depended on accurately measuring a real, layout-consuming scrollbar,
   * which desktop browsers have and touch-device ones normally don't —
   * a stale or nonzero measurement on a device with no scrollbar to
   * compensate for shifted the page sideways the instant the menu opened.
   * Position-fixed doesn't measure or compensate for anything, so it
   * behaves the same regardless of what kind of scrollbar (or none) the
   * device has. This is this component's own flag rather than Lenis's
   * `lenis-stopped` class because Lenis is never instantiated under
   * `prefers-reduced-motion`, and a class only Lenis manages would never
   * appear for those visitors — the lock has to hold whether or not Lenis
   * exists. `stop()` still runs alongside it, for the wheel/touch
   * interception Lenis itself owns.
   *
   * Layout effect, not a plain effect: a plain `useEffect` runs after the
   * browser has already painted the `data-overlay-state="open"` commit, so
   * the panel's slide transition would start a frame before this lock lands.
   */
  useIsomorphicLayoutEffect(() => {
    if (!open) {
      delete document.documentElement.dataset.menuOpen;
      const y = scrollLockY.current;
      // A drawer link changes the route, which closes the drawer (see the
      // pathname effect above) and lands here. Restoring the position the
      // lock was taken at would then drop the visitor partway down the NEW
      // page — /about opened at wherever the home page had been left. The
      // restore belongs to a dismissal, not to a navigation; on a route
      // change the body lock is simply released and SmoothScrollProvider's
      // own route effect takes the page to the top.
      const navigated = scrollLockPath.current !== null && scrollLockPath.current !== pathname;
      scrollLockPath.current = null;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      // start() before the restore: Lenis re-syncs from wherever native
      // scroll actually is via its own scroll listener, the same path
      // ordinary scrolling takes.
      start();
      if (!navigated) window.scrollTo(0, y);
      return;
    }

    document.documentElement.dataset.menuOpen = "true";
    scrollLockY.current = window.scrollY;
    scrollLockPath.current = pathname;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    stop();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    // `preventScroll` matters here specifically: at the moment this runs the
    // panel is still translated fully off-screen (the slide-in transition
    // hasn't painted its first frame yet), so an unguarded `.focus()` gives
    // the browser an off-screen element to scroll toward and it takes the
    // native "scroll the focused element into view" path — visible as a
    // jump right as the drawer starts opening.
    const first = panelRef.current?.querySelector<HTMLAnchorElement>("a[href]");
    first?.focus({ preventScroll: true });

    return () => {
      window.removeEventListener("keydown", onKey);

      // Never leave focus stranded inside a panel that is about to become
      // aria-hidden and non-interactive.
      if (panelRef.current?.contains(document.activeElement)) {
        toggleRef.current?.focus({ preventScroll: true });
      }
    };
  }, [open, pathname, stop, start, close]);

  /**
   * Where the bar is, as a 0-to-1 scroll progress on --nav-exit.
   *
   * Published on <html> and read by BOTH the real bar and its inverted reveal
   * copy, so the two can never travel by different amounts or in different
   * frames. Everything the bar contains moves as one piece.
   *
   * The home page has three regions. Through the hero the bar rises with the
   * page, one pixel per pixel, and is gone before the headline reaches the
   * top. It stays gone for the whole of About Us, whose accent field owns the
   * screen there. It docks again the moment that field finishes lifting, and
   * from then on it is simply the page's bar — content scrolls up under it and
   * is cut off at its rule. Scrolling back up reverses each region in turn.
   *
   * Interior pages have no hero and no wipe, so the bar is always docked.
   *
   * The React state is only for `inert`; it flips once per region rather than
   * on every scroll frame, so this does not re-render the drawer at 60fps.
   */
  useEffect(() => {
    const root = document.documentElement;
    const write = (p: number) => root.style.setProperty("--nav-exit", p.toFixed(4));

    const settle = (value: boolean) => {
      if (goneRef.current === value) return;
      goneRef.current = value;
      setNavGone(value);
    };

    const settleTop = (value: boolean) => {
      if (atTopRef.current === value) return;
      atTopRef.current = value;
      setAtTop(value);
    };

    const hero = document.querySelector<HTMLElement>("[data-hero]");

    // A zero-length trigger used purely to read the scroll position where the
    // veil finishes receding. Sharing EXIT_END with SectionWipe is what keeps
    // "the bar docks when the blue has gone" true rather than approximately
    // true — one string, one number, no drift if the wipe is ever retimed.
    const about = hero ? document.querySelector<HTMLElement>("#about") : null;
    const dock = about
      ? ScrollTrigger.create({ trigger: about, start: EXIT_END, end: EXIT_END })
      : null;

    const at = (y: number) => {
      if (!hero) return 0;
      if (y <= NAV_TRAVEL) return y / NAV_TRAVEL;
      const docked = dock?.start;
      if (docked == null || y <= docked) return 1;
      return Math.max(0, 1 - (y - docked) / NAV_TRAVEL);
    };

    const apply = (y: number) => {
      const p = at(y);
      write(p);
      settle(p > 0.98);
      settleTop(y <= TOP_ZONE);
    };

    const driver = ScrollTrigger.create({
      start: 0,
      end: "max",
      invalidateOnRefresh: true,
      onUpdate: (self) => apply(self.scroll()),
      onRefresh: (self) => apply(self.scroll()),
    });

    apply(window.scrollY);

    return () => {
      driver.kill();
      dock?.kill();
      root.style.removeProperty("--nav-exit");
    };
  }, [pathname]);

  /**
   * Scroll-spy for the drawer's resting cue.
   *
   * The cue beside each entry marks where you actually are. On an interior
   * page that is just the route, but the home page carries every section at
   * once, so the entry has to follow the section crossing the middle of the
   * screen rather than sit permanently on the first one.
   */
  useEffect(() => {
    if (pathname !== "/") {
      setActiveKey(null);
      return;
    }

    const targets = navigation
      .map((item) => {
        const el =
          item.href === "/"
            ? document.querySelector<HTMLElement>("[data-hero]")
            : document.querySelector<HTMLElement>(`#${item.href.slice(1)}`);
        return el ? { href: item.href, el } : null;
      })
      .filter((t): t is { href: string; el: HTMLElement } => t !== null);

    if (targets.length === 0) return;

    const triggers = targets.map(({ href, el }) =>
      ScrollTrigger.create({
        trigger: el,
        start: `top ${SPY_LINE}%`,
        end: `bottom ${SPY_LINE}%`,
        onToggle: (self) => {
          if (self.isActive) setActiveKey(href);
        },
      }),
    );

    // onToggle only reports transitions, so seed from whatever is already
    // under the line — otherwise a mid-page reload shows the wrong entry.
    const seeded = triggers.findIndex((t) => t.isActive);
    setActiveKey(targets[seeded === -1 ? 0 : seeded].href);

    return () => triggers.forEach((t) => t.kill());
  }, [pathname]);

  // On the home page the current entry is whichever section you are in; on an
  // interior page it is the route. Index never matches a sub-route, or it
  // would light up on every page.
  const isActive = (href: string) => {
    if (pathname === "/") return href === (activeKey ?? "/");
    return href !== "/" && pathname.startsWith(href);
  };

  // Every entry is a real page now, so navigation is an ordinary link
  // traversal — nothing to intercept.

  // The drawer's accent panel appears only when the drawer is actually open.
  // It used to also peek out as a 7rem band on hover, which parked a blue
  // stripe against the bar on every page and cut across the availability
  // badge. The accent belongs to the cursor band in the hero, where it is a
  // surprise, not to a permanent affordance.
  const bandVisible = open;

  /**
   * The marker's hover state is published as one flag on <html>, and read from
   * CSS by both the real bar and its reveal mirror. One writer, so the two
   * layers cannot disagree about whether the marks are gathered.
   *
   * It lives here rather than in the pointer-band driver because that driver
   * only runs on the home page, behind a desktop media query — the marker has
   * to react on every page the bar appears on.
   */
  const markAnchor = useCallback((active: boolean) => {
    const root = document.documentElement;
    if (active) root.dataset.revealAnchorActive = "menu";
    else if (root.dataset.revealAnchorActive === "menu") delete root.dataset.revealAnchorActive;
  }, []);

  useEffect(() => () => markAnchor(false), [markAnchor]);

  const onToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = !open;

    // Two ways of asking the same question, because either can be the one that
    // knows: the shared flag is authoritative while a pointer is driving, but
    // :hover still answers correctly if the click arrived without one ever
    // being raised. A pointerless click — touch, keyboard — answers false to
    // both, which is right: the marks are in their grid and have to gather.
    const gathered =
      document.documentElement.dataset.revealAnchorActive === "menu" ||
      event.currentTarget.matches(":hover");

    setOrigin(next ? (gathered ? "dot" : "grid") : "close");
    setOpen(next);
  };

  // `inert` follows the travel so a keyboard user never tabs into a bar that
  // has scrolled off the top. Never while the drawer is open — the toggle has
  // to stay reachable to close it.
  const hidden = navGone && !open;
  const chromeState = hidden ? "pointer-events-none" : "";

  /**
   * The wordmark answers to where you already are.
   *
   * Scrolled down, it takes you back to the top of the page you are on —
   * that is the thing you actually wanted, and on the home page it is the
   * only thing it could mean. Already at the top of a sub-page, there is
   * nowhere to scroll, so it goes home; the Link's own navigation handles
   * that, which keeps it a real anchor for middle-click and for crawlers.
   * Already at the top of the home page, it does nothing at all rather than
   * re-navigating to the page you are looking at.
   */
  const onLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.scrollY > TOP_ZONE * 6) {
      event.preventDefault();
      scrollTo(0);
      return;
    }
    if (pathname === "/") event.preventDefault();
  };

  const barProps = {
    open,
    bandVisible,
    atTop,
    showAvailability: pathname === "/",
    origin,
    onToggle,
    onAnchor: markAnchor,
    onLogoClick,
    buttonRef: toggleRef,
  };

  return (
    <>
      {/* The bar is opaque and carries a rule along its bottom edge. That
          rule is the site's horizon: everything scrolling up runs under the
          bar and is cut off there rather than fading out in open space, and
          everything scrolling back down emerges from it. */}
      <header
        inert={hidden}
        className={`nav-chrome fixed inset-x-0 top-0 z-50 ${chromeState}`}
      >
        <HeaderBar variant="base" {...barProps} />
      </header>

      {/* Inverted header copy, clipped to the cursor band.

          The accent fill belongs to the bar's own row, NOT to this panel. The
          panel keeps its padding because clip-path clips to the border box and
          the availability badge hangs below the row on `top-full` — without the
          padding the badge falls outside the box and is clipped away. But when
          the padding also carried `bg-accent`, those 56px painted as an opaque
          blue slab with nothing drawn in it, stretched the full width at
          z-[51]. The hero's own footer row passes under exactly that strip on
          the way into About Us, and the slab masked the top of "Based in
          Nairobi" and "Let's talk" — which is why they read as smudges rather
          than the bright white their reveal copies actually compute to.

          The badge needs no fill of its own: the band that reveals this panel
          is the same band that turns the hero (and then the veil) blue
          underneath it, so there is always accent behind the badge wherever
          this copy is visible at all. */}
      <div
        aria-hidden="true"
        inert
        className="nav-chrome reveal-clip pointer-events-none fixed inset-x-0 top-0 z-[51] pb-14"
      >
        <HeaderBar
          variant="reveal"
          open={open}
          bandVisible={bandVisible}
          atTop={atTop}
          showAvailability={pathname === "/"}
          origin={origin}
        />
      </div>

      {/* One fixed overlay root; the backdrop and the panel are absolute
          inside it. The panel used to be revealed by clip-path, which opened
          it as a widening slot — this slides the whole panel in from the edge
          instead, which is what the reference does and what reads as a drawer
          rather than a reveal. */}
      <div
        className="site-overlay fixed inset-0 z-[60]"
        data-overlay-state={open ? "open" : "closed"}
      >
        <button
          type="button"
          onClick={close}
          tabIndex={-1}
          aria-hidden="true"
          className="site-overlay__backdrop"
        />

        <aside
          id="menu-drawer"
          ref={panelRef}
          aria-label="Primary"
          aria-hidden={!open}
          className="site-overlay__panel bg-accent text-mist"
        >
          <div className="flex h-full flex-col px-gutter pb-8 sm:px-10 sm:pb-10">
          {/* The drawer carries its own bar. It sits above the site's, which is
              covered while this is open, so Close has to live in here — on a
              phone the panel is full-bleed and the real toggle is underneath
              it entirely. */}
          <div className="site-overlay__eyebrow flex h-[var(--header-h)] shrink-0 items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em]">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-none bg-mist" />
              <span className="text-mist">Menu</span>
              <span aria-hidden="true" className="text-mist/50">
                /
              </span>
              <span className="text-mist/80">
                {navigation[0].index}–{navigation[navigation.length - 1].index}
              </span>
            </p>

            <button
              type="button"
              onClick={close}
              tabIndex={open ? 0 : -1}
              className="flex items-center gap-3 font-mono text-base uppercase tracking-normal text-mist"
            >
              Close
              <span aria-hidden="true" className="relative block h-4 w-4">
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 rotate-45 bg-mist" />
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 -rotate-45 bg-mist" />
              </span>
            </button>
          </div>

          <nav className="site-overlay__menu menu-nav mt-8 sm:mt-12">
            <ul>
              {navigation.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    tabIndex={open ? 0 : -1}
                    data-current={isActive(item.href) ? "true" : "false"}
                    className="menu-link group flex items-baseline gap-4 border-b border-mist/15 py-5 sm:py-[2.34rem]"
                  >
                    <span className="micro tnum w-6 shrink-0 text-mist/45">{item.index}</span>

                    <span className="text-title font-medium text-mist transition-transform duration-600 ease-expo group-hover:translate-x-2">
                      {item.label}
                    </span>

                    <span className="menu-cue micro ml-3 whitespace-nowrap text-mist/70 sm:ml-auto">
                      [ {item.cue} ]
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-overlay__footer mt-auto flex items-center gap-3 pt-8 sm:pt-10">
            {legalLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-3">
                {i > 0 ? (
                  <span aria-hidden="true" className="micro text-mist/35">
                    /
                  </span>
                ) : null}
                <Link
                  href={link.href}
                  tabIndex={open ? 0 : -1}
                  className="micro text-mist/60 transition-opacity duration-400 ease-expo hover:opacity-100"
                >
                  {link.label}
                </Link>
              </span>
            ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
