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
      {/* True blur, not an opaque cover — the page behind stays recognisable.
          Falls back to a heavier tint (see globals.css) on the rare browser
          that ignores backdrop-filter entirely, so the panel still reads as
          the thing in front rather than a wash sitting over unreadable
          content. */}
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="preview-backdrop absolute inset-0 h-full w-full cursor-default"
      />

      <div
        ref={panelRef}
        className="relative max-h-[92svh] w-full max-w-6xl overflow-y-auto border border-hairline bg-canvas no-scrollbar"
      >
        <div className="flex items-center justify-between gap-6 border-b border-hairline px-6 py-4 lg:px-10">
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

        <div className="grid lg:grid-cols-2">
          {/* 16:9 while stacked above the content on narrow layouts, where it
              functions as a banner. From `lg` the two columns sit side by
              side and the richer right column (problem, solution, facts,
              technology) runs taller than a 16:9 crop of this width would —
              aspect-ratio wins over grid stretch-alignment when both apply
              to the same axis, so without this override the image would
              hold its 16:9 height and leave the remainder of the row as
              bare canvas beneath it. `lg:h-full` matches the row instead,
              and `object-cover` on the image crops to fill it. */}
          <div
            data-preview-item
            className="relative aspect-[16/9] overflow-hidden border-b border-hairline lg:aspect-auto lg:h-full lg:border-b-0 lg:border-r"
          >
            <Image
              src={project.image}
              alt={`${project.title} homepage`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-8 p-6 lg:p-10">
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

            <dl
              data-preview-item
              className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-hairline pt-6 sm:grid-cols-4"
            >
              <div>
                <dt className="meta text-ink/35">Deliverables</dt>
                <dd className="mt-2 text-sm text-ink/70">{project.deliverables.join(", ")}</dd>
              </div>
              <div>
                <dt className="meta text-ink/35">Industry</dt>
                <dd className="mt-2 text-sm text-ink/70">{project.industry}</dd>
              </div>
              <div>
                <dt className="meta text-ink/35">Status</dt>
                <dd
                  className={`mt-2 text-sm ${project.status === "live" ? "text-accent" : "text-ink/70"}`}
                >
                  {project.status === "live" ? "Live" : "Concept"}
                </dd>
              </div>
              <div>
                <dt className="meta text-ink/35">Year</dt>
                <dd className="tnum mt-2 text-sm text-ink/70">{project.year}</dd>
              </div>
            </dl>

            <div data-preview-item>
              <p className="meta text-ink/35">Technology</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.technology.map((t) => (
                  <li key={t} className="micro border border-hairline px-2 py-1 text-ink/50">
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div data-preview-item className="mt-auto flex flex-wrap items-center gap-6 pt-2">
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
