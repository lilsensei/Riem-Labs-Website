"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import BracketLink from "@/components/BracketLink";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";
import { EASE, gsap } from "@/lib/gsap";
import type { Project } from "@/lib/projects";

type ProjectPreviewProps = {
  project: Project | null;
  onClose: () => void;
};

/** Elements a keyboard user can land on inside the dialog, for the Tab trap. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * In-page project preview — a compact case study, opened from a card plate
 * on the Work index (or from a home-page row via /work#<slug>).
 *
 * Rendered through a portal straight onto <body>, not inline where WorkGallery
 * mounts it. That is what lets the rest of the page go inert while this is
 * open: inert is inherited by every descendant, so marking header/main/
 * footer inert while the dialog stays a DOM sibling of all three is what
 * makes the underlying page fully untouchable — no stray Tab lands on it, no
 * click reaches it — without also disabling the dialog sitting inside that
 * same subtree.
 */
export default function ProjectPreview({ project, onClose }: ProjectPreviewProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { stop, start } = useSmoothScroll();

  // Escape to close, Tab trapped inside, scroll frozen behind, background
  // inert, focus moved in on open and restored to the triggering card on
  // close.
  useEffect(() => {
    if (!project) return;

    const restoreFocus = document.activeElement as HTMLElement | null;
    stop();
    document.documentElement.dataset.previewOpen = "true";
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Everything the visitor must not reach while the dialog is up. The
    // scrollbar thumb is already hidden via the data-preview-open CSS rule
    // below, but it stays hit-testable without this — inert removes it from
    // the tab order and from pointer/keyboard interaction outright.
    const inertTargets = [
      document.querySelector<HTMLElement>("header"),
      document.getElementById("main"),
      document.querySelector<HTMLElement>("footer"),
      document.querySelector<HTMLElement>(".site-scrollbar"),
    ].filter((el): el is HTMLElement => el !== null);
    inertTargets.forEach((el) => {
      el.inert = true;
    });

    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      start();
      delete document.documentElement.dataset.previewOpen;
      document.body.style.overflow = previousOverflow;
      inertTargets.forEach((el) => {
        el.inert = false;
      });
      window.removeEventListener("keydown", onKeyDown);
      restoreFocus?.focus?.();
    };
  }, [project, onClose, stop, start]);

  useGSAP(
    () => {
      if (!project || !panelRef.current) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(panelRef.current, { clearProps: "all" });
        gsap.set(panelRef.current.querySelectorAll("[data-preview-item]"), { clearProps: "all" });
        return;
      }

      gsap.fromTo(
        panelRef.current,
        { yPercent: 3, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: EASE },
      );

      gsap.fromTo(
        panelRef.current.querySelectorAll("[data-preview-item]"),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: EASE, stagger: 0.05, delay: 0.12 },
      );
    },
    { dependencies: [project?.slug] },
  );

  if (!project) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} preview`}
      className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center"
    >
      {/* Near-opaque, not a readable blur: the page behind should drop away
          entirely so the panel has the screen to itself. The slight blur is
          only there to soften what little reads through at the edges. */}
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="preview-backdrop absolute inset-0 h-full w-full cursor-default"
      />

      {/* The frame is a column: the header keeps its place and the body below
          it is what scrolls, so Close is reachable from anywhere in the
          content and the panel never grows past the viewport.

          On a phone it takes the whole screen. `max-h-[90svh]` against an
          `items-end` dialog left the panel 10% of the viewport short and
          pinned to the bottom — 78px of dead canvas above it at 360, 93px at
          430 — while the content it could not fit ran on below the fold.
          Stretching to the dialog's own box (which is `fixed inset-0`, so it
          is the viewport, with none of the svh/dvh URL-bar guesswork) gives
          the header a fixed top, the body the exact remaining height, and the
          scroll one unambiguous owner. From `sm` the centred sheet returns
          untouched. */}
      <div
        ref={panelRef}
        className="relative flex h-full max-h-none w-full max-w-6xl flex-col border-0 border-hairline bg-canvas sm:h-auto sm:max-h-[90svh] sm:border"
      >
        <div className="flex shrink-0 items-center justify-between gap-6 border-b border-hairline px-6 py-4 lg:px-10">
          <p className="meta flex items-baseline gap-2">
            <span className="tnum text-accent">{project.index}</span>
            <span className="text-ink/25">/</span>
            <span>{project.industry}</span>
          </p>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="meta flex items-center gap-2 py-1 transition-colors duration-400 ease-expo hover:text-accent"
          >
            Close
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Two layouts out of one DOM.

            From `lg` this is the approved two-column composition: the media
            column holds the screenshot with its facts and technology beneath,
            the reading column scrolls beside it, and each column owns its own
            overflow so the screenshot stays put while you read past it.

            Below `lg` both column wrappers go `display: contents`, which drops
            them out of the box tree and lets their seven blocks become direct
            children of this flex column. That is what allows a mobile reading
            order — image, title, summary, facts, technology, problem, solution,
            CTA — to interleave blocks that live in different columns on
            desktop, using `order` alone and without a second copy of the markup.

            It is also the fix for the overlap this had at every width under
            1024. As a grid, the two column tracks were sized by this box rather
            than by their content: at 390x844 the rows resolved to 328 and 375
            inside a 705px body while the content needed 960, and because each
            column carried `min-h-0` it shrank to its track and painted its
            overflow straight over the next one — Status and Year across the
            project title, the technology chips across the summary. A flex
            column of `shrink-0` blocks cannot compress that way, so the body
            simply scrolls. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-2 lg:overflow-hidden">
          {/* The media column sizes to the screenshots' own ratio — all three
              are 1600×900, so a true 16:9 box leaves `object-contain` nothing
              to letterbox and nothing to crop. It deliberately does not
              stretch to the row: matching the taller reading column is what
              forced the earlier crop. The facts and technology sit beneath it,
              which is what turns the leftover height into something useful
              instead of bare canvas — and shortens the reading column enough
              that most projects need no scrolling at all.

              Scrolls only when it has to. At ordinary window heights the image
              and its metadata fit and this column never moves; on a short
              viewport it scrolls rather than letting the technology row fall
              past the bottom of the frame, which is what a plain `hidden`
              here did at 1280x640 and below. */}
          <div className="contents lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-hairline">
            <div
              data-preview-item
              className="relative order-1 aspect-[16/9] w-full shrink-0 overflow-hidden bg-bone lg:order-none"
            >
              <Image
                src={project.image}
                alt={`${project.title} homepage`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain"
              />
            </div>

            {/* Facts stay two columns at every width — four short values that
                read as pairs, not a list worth stacking into one narrow file. */}
            <div
              data-preview-item
              className="order-4 mt-8 shrink-0 border-t border-hairline p-6 lg:order-none lg:mt-0 lg:p-10 lg:pb-6"
            >
              <dl className="grid grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <dt className="meta text-ink/35">Deliverables</dt>
                  <dd className="mt-2 text-sm text-ink/70">
                    {project.deliverables.join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="meta text-ink/35">Industry</dt>
                  <dd className="mt-2 text-sm text-ink/70">{project.industry}</dd>
                </div>
                <div>
                  <dt className="meta text-ink/35">Status</dt>
                  <dd
                    className={`mt-2 text-sm ${
                      project.status === "live" ? "text-accent" : "text-ink/70"
                    }`}
                  >
                    {project.status === "live" ? "Live" : "Concept"}
                  </dd>
                </div>
                <div>
                  <dt className="meta text-ink/35">Year</dt>
                  <dd className="tnum mt-2 text-sm text-ink/70">{project.year}</dd>
                </div>
              </dl>
            </div>

            {/* Its own block rather than a nested rule inside the facts box:
                on mobile it has to be orderable independently of them. */}
            <div
              data-preview-item
              className="order-5 shrink-0 border-t border-hairline p-6 lg:order-none lg:px-10 lg:pb-10 lg:pt-6"
            >
              <p className="meta text-ink/35">Technology</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.technology.map((t) => (
                  <li key={t} className="micro border border-hairline px-2 py-1 text-ink/50">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="contents lg:flex lg:min-h-0 lg:flex-col lg:gap-8 lg:overflow-y-auto lg:p-10">
            <div data-preview-item className="order-2 shrink-0 px-6 pt-8 lg:order-none lg:p-0">
              <h2 className="text-headline font-medium">{project.title}</h2>
              <p className="meta mt-3 text-ink/45">
                {project.industry} — {project.year}
              </p>
            </div>

            <p
              data-preview-item
              className="order-3 shrink-0 px-6 pt-5 text-sm leading-relaxed text-ink/60 lg:order-none lg:p-0"
            >
              {project.summary}
            </p>

            <div
              data-preview-item
              className="order-6 mt-8 shrink-0 space-y-6 border-t border-hairline p-6 lg:order-none lg:mt-0 lg:px-0 lg:pb-0 lg:pt-6"
            >
              <div>
                <p className="meta text-accent">Problem</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{project.problem}</p>
              </div>
              <div>
                <p className="meta text-accent">Solution</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{project.solution}</p>
              </div>
            </div>

            <div
              data-preview-item
              className="order-7 flex shrink-0 flex-wrap items-center gap-6 border-t border-hairline p-6 lg:order-none lg:mt-auto lg:px-0 lg:pb-0 lg:pt-6"
            >
              {project.href ? (
                <BracketLink href={project.href} variant="framed">
                  Visit live site
                </BracketLink>
              ) : null}
              {/* `#brief` lands on the form's first fieldset with the cursor
                  already in Name — see ContactForm. Navigating unmounts the
                  gallery, so this dialog tears down on the way out and clears
                  its own scroll lock, inert flags and focus trap first. */}
              <BracketLink href="/contact#brief" size="sm">
                Brief a similar project
              </BracketLink>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
