"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import logoSrc from "@/public/riem-labs-logo.png";

type HeaderBarProps = {
  variant: "base" | "reveal";
  open: boolean;
  /** True when the accent drawer sits behind the bar. */
  bandVisible: boolean;
  /** True while the page is at rest at the very top. */
  atTop: boolean;
  /** The note belongs to the hero, so only the index page carries it. */
  showAvailability: boolean;
  /** Where the marker's open animation starts from. */
  origin: "grid" | "dot" | "close";
  onToggle?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Context-aware home action: scroll to top, or navigate. */
  onLogoClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Raises/clears the shared reveal-anchor flag the marker reads. */
  onAnchor?: (active: boolean) => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
};

/**
 * The header's visual content, rendered twice.
 *
 * `base` is interactive. `reveal` is an inert white-on-accent copy living
 * inside the clipped band layer, so header text and icons invert wherever the
 * cursor band sweeps under them — the same base/reveal pairing the hero uses.
 * Every layout class must stay identical between the two.
 */
export default function HeaderBar({
  variant,
  open,
  bandVisible,
  atTop,
  showAvailability,
  origin,
  onToggle,
  onAnchor,
  onLogoClick,
  buttonRef,
}: HeaderBarProps) {
  const isReveal = variant === "reveal";

  // Inside the band everything is white. Outside it the bar now paints its own
  // opaque row, so the label stays dark whatever the drawer is doing — going
  // white on `bandVisible` left "Close" as white-on-white once the row stopped
  // letting the accent panel show through from behind.
  const labelTone = isReveal ? "text-mist" : "text-graphite";
  const badgeTone = isReveal ? "text-mist" : bandVisible ? "text-mist" : "text-stone";
  const badgeDot = isReveal ? "bg-mist" : "bg-accent";

  // The four marks slide together into a single square on hover. The rule
  // that moves them lives in globals.css and is keyed off :has(), so it fires
  // on this copy AND on the reveal mirror from one hover — a `group-hover`
  // here would only ever reach the copy the pointer is actually over.
  /**
   * Four marks in a square, which gather to a single dot under the pointer and
   * unfold into a cross when the drawer opens.
   *
   * Each mark's grid position and its cross position are declared as custom
   * properties on the mark itself, so the stylesheet's keyframes can move any
   * of them between the two without knowing which one it is holding.
   */
  const icon = (
    <span aria-hidden="true" className="menu-marker">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} data-header-mark={isReveal ? undefined : ""} />
      ))}
    </span>
  );

  const toggleClass = `group -mr-1 flex items-center gap-3 px-1 py-2 transition-colors duration-400 ease-expo ${labelTone}`;

  // 16px, normal tracking — deliberately not the `.meta` scale used elsewhere.
  //
  // Both words are always rendered, stacked, and cross-faded: swapping the
  // string would snap, and the outgoing word needs to still be there to move
  // out of the way. The box is 5ch — the longer of the two words — so the
  // button never changes width mid-transition. Monospace makes that exact.
  const menuLabel = (
    <span
      data-header-tone={isReveal ? undefined : ""}
      className="menu-label font-mono text-base uppercase tracking-normal"
    >
      <span className="menu-word menu-word--menu">Menu</span>
      <span className="menu-word menu-word--close">Close</span>
    </span>
  );

  // The bar is not a chrome slab sitting on top of the page — it IS the page,
  // painted in the same surface, with a rule under it. Two things follow from
  // that and both matter:
  //
  //   the fill is `mist`, the hero's own colour, so the top of the site reads
  //   as one field rather than a white strip laid over a warm one;
  //
  //   the rule is drawn by a pseudo-element inset to the page gutter, not a
  //   `border-b` on the row. A border spans the whole viewport edge to edge; a
  //   rule that starts and stops on the same margin as the wordmark and the
  //   headline belongs to the grid, and holds those endpoints at every scroll
  //   position and every viewport width because the inset is the same clamp
  //   the gutter itself uses.
  return (
    // Two elements, not one. The white/accent field is the page-wide
    // surface and must run edge to edge; only the row inside it is held to
    // the shared content axes. Carrying both on a single element made the
    // background itself 112rem wide, leaving the page showing down either
    // side of the bar.
    <div
      className={`relative h-[var(--header-h)] w-full ${
        isReveal ? "bg-accent" : "bg-mist"
      }`}
    >
      {/* The hairline starts and stops on the same margin as the wordmark,
          so it belongs to this inner, axis-aligned row rather than to the
          full-width field behind it. */}
      <div
        className={`relative mx-auto flex h-full w-full max-w-grid items-center justify-between gap-6 px-gutter after:absolute after:bottom-0 after:left-gutter after:right-gutter after:h-px after:content-[''] ${
          isReveal ? "after:bg-mist/25" : "after:bg-hairline"
        }`}
      >
        {isReveal ? (
          <span className="flex items-center">
            {/* brightness-0 invert renders the mark and wordmark pure white. */}
            <Image
              src={logoSrc}
              alt=""
              priority
              className="h-7 w-auto brightness-0 invert sm:h-8"
            />
          </span>
        ) : (
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            onClick={onLogoClick}
            className="flex items-center"
          >
            <Image
              src={logoSrc}
              alt={site.name}
              priority
              data-header-logo=""
              className="h-7 w-auto sm:h-8"
            />
          </Link>
        )}

        <div className="flex flex-col items-end">
          {/* The mirror carries the same state attributes as the real control,
              because the stylesheet drives the marker off them — without these
              the reveal copy would sit in its resting grid while the base copy
              animated, and the band would show the two disagreeing. */}
          {isReveal ? (
            <span
              data-menu-state={open ? "open" : "closed"}
              data-menu-origin={origin}
              data-overlay-control=""
              className={toggleClass}
            >
              {menuLabel}
              {icon}
            </span>
          ) : (
            <button
              ref={buttonRef}
              type="button"
              /* Two attributes, not one: the flag says "this is an anchor", the
                 name says which. The pointer-band driver matches on the flag. */
              data-reveal-anchor=""
              data-reveal-anchor-name="menu"
              data-overlay-control=""
              data-nav-toggle=""
              data-menu-state={open ? "open" : "closed"}
              data-menu-origin={origin}
              onClick={onToggle}
              onPointerEnter={() => onAnchor?.(true)}
              onPointerLeave={() => onAnchor?.(false)}
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible")) onAnchor?.(true);
              }}
              onBlur={() => onAnchor?.(false)}
              aria-expanded={open}
              aria-controls="menu-drawer"
              className={toggleClass}
            >
              {menuLabel}
              {icon}
            </button>
          )}

        </div>

        {/* Availability note.
            Positioned against the ROW rather than the toggle, so it clears the
            rule instead of straddling it — it belongs to the band between the
            bar and the page, on the same right margin the rule ends on.

            It is a hero detail, so it appears on the index page only, and only
            while the page is at rest at the top: that band is empty just long
            enough for it, and left standing it would sit on top of whatever body
            copy happened to be passing under the rule. */}
        {showAvailability ? (
          <span
            className={`pointer-events-none absolute right-gutter top-full mt-3 hidden items-center gap-2 whitespace-nowrap transition-opacity duration-400 ease-expo sm:inline-flex ${
              atTop ? "opacity-100" : "opacity-0"
            }`}
          >
            <span
              data-header-mark={isReveal ? undefined : ""}
              className={`h-1.5 w-1.5 rounded-full animate-pulse-dot ${badgeDot}`}
            />
            <span data-header-tone={isReveal ? undefined : ""} className={`micro ${badgeTone}`}>
              {site.availability}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
