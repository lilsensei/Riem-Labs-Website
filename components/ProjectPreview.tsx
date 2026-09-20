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
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
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
          content and the panel never grows past the viewport. */}
      <div
        ref={panelRef}
        className="relative flex max-h-[90svh] w-full max-w-6xl flex-col border border-hairline bg-canvas"
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

        {/* Below `lg` this is one column and the whole body scrolls. From `lg`
            the media column holds still and only the reading column moves, so
            the screenshot stays put while you read past it. */}
        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
          {/* The media column sizes to the screenshot's own ratio (1453×846)
              rather than a nominal 16:9, so `object-contain` has nothing to
              letterbox and nothing is cropped. It deliberately does not
              stretch to the row: matching the taller reading column is what
              forced the earlier crop. The facts and technology sit beneath it,
              which is what turns the leftover height into something useful
              instead of bare canvas — and shortens the reading column enough
              that most projects need no scrolling at all. */}
          {/* Scrolls only when it has to. At ordinary window heights the image
              and its metadata fit and this column never moves; on a short
              viewport it scrolls rather than letting the technology row fall
              past the bottom of the frame, which is what a plain `hidden`
              here did at 1280x640 and below. */}
          <div className="flex min-h-0 flex-col border-b border-hairline lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div
              data-preview-item
              className="relative aspect-[1453/846] w-full shrink-0 overflow-hidden bg-bone"
            >
              <Image
                src={project.image}
                alt={`${project.title} homepage`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain"
              />
            </div>

            <div data-preview-item className="border-t border-hairline p-6 lg:p-10">
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

              <div className="mt-6 border-t border-hairline pt-6">
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
          </div>

          <div className="flex min-h-0 flex-col gap-8 p-6 lg:overflow-y-auto lg:p-10">
            <div data-preview-item>
              <h2 className="text-headline font-medium">{project.title}</h2>
              <p className="meta mt-3 text-ink/45">
                {project.industry} — {project.year}
              </p>
            </div>

            <p data-preview-item className="text-sm leading-relaxed text-ink/60">
              {project.summary}
            </p>

            <div data-preview-item className="space-y-6 border-t border-hairline pt-6">
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
              className="mt-auto flex flex-wrap items-center gap-6 border-t border-hairline pt-6"
            >
              {project.href ? (
                <BracketLink href={project.href} variant="framed">
                  Visit live site
                </BracketLink>
              ) : null}
              <BracketLink href="/contact" size="sm">
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
