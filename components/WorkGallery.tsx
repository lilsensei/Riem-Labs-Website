"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import ProjectCard from "@/components/ProjectCard";
import ProjectPreview from "@/components/ProjectPreview";
import { EASE, gsap } from "@/lib/gsap";
import { projects, type Project } from "@/lib/projects";

/**
 * The Work index grid.
 *
 * The category filter bar it used to open with is gone: with a public index
 * this small, every filter was either "all of them" or "one of them", and the
 * control cost more attention than it saved. The hairline rule and project
 * count that used to frame the grid are gone too — 01 / Index already reads
 * as the section's own header, and a second rule immediately under it plus
 * a "3 projects" line only restated what the grid makes obvious by itself.
 */
export default function WorkGallery() {
  const [preview, setPreview] = useState<Project | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Deep link: /work#<slug> opens that project's preview on arrival, which is
  // how the home page's work rows hand off to this page. Same shape as the
  // services accordion's own hash handling.
  //
  // Nothing in the grid carries an id matching a slug, deliberately: the
  // browser (and SmoothScrollProvider's own hash routing) would otherwise
  // scroll to that element before the preview opened. An unknown slug simply
  // matches nothing and the page renders normally.
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (!slug) return;
    const target = projects.find((p) => p.slug === slug);
    if (target) setPreview(target);
    // Mount only — this is for arriving on the page, not for later hash edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stagger the grid in once on mount. This used to re-run whenever the
  // filter changed; with no filter left there is only the first pass.
  useGSAP(
    () => {
      const cards = gridRef.current?.querySelectorAll("article");
      if (!cards?.length) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(cards, { clearProps: "all" });
        return;
      }

      gsap.fromTo(
        cards,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: EASE, stagger: 0.06, overwrite: true },
      );
    },
    { scope: gridRef },
  );

  return (
    <>
      <div
        ref={gridRef}
        className="mt-10 grid gap-x-gutter gap-y-20 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onPreview={setPreview}
            reveal={false}
            headingLevel={2}
          />
        ))}
      </div>

      <ProjectPreview project={preview} onClose={() => setPreview(null)} />
    </>
  );
}
