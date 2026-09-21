"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import Glyph, { type GlyphColor, type GlyphHandle } from "@/components/Glyph";
import type { Choreography } from "@/lib/glyphChoreographies";
import type { Project } from "@/lib/projects";

type ProjectCardProps = {
  project: Project;
  layout?: "card" | "row";
  /**
   * When supplied, the cover plate opens an in-page preview instead of the
   * live site. The title still links out, so both routes stay reachable.
   */
  onPreview?: (project: Project) => void;
  /** Adds the reveal hook attribute so a parent RevealSection staggers it in. */
  reveal?: boolean;
  /** Row layout only — replaces the plain index number with the animated
   *  glyph, choreographed on hover. Unused (and unneeded) in card layout. */
  choreography?: Choreography;
  glyphColor?: GlyphColor;
  /**
   * Heading level for the project title. Defaults to 3, which is right on the
   * home page, where these sit under the Selected work section's own h2. The
   * dedicated /work page has no such section heading — the cards follow the
   * page h1 directly — so WorkGallery passes 2 and the outline stops skipping
   * a level. Styling is identical either way; only the tag changes.
   */
  headingLevel?: 2 | 3;
};

export default function ProjectCard({
  project,
  layout = "card",
  onPreview,
  reveal = true,
  choreography,
  glyphColor,
  headingLevel = 3,
}: ProjectCardProps) {
  const revealAttr = reveal ? { "data-reveal-fade": "" } : {};
  const Heading = (headingLevel === 2 ? "h2" : "h3") as "h2" | "h3";
  const glyphRef = useRef<GlyphHandle>(null);
  const [hovered, setHovered] = useState(false);

  if (layout === "row") {
    return (
      <article {...revealAttr} className="group relative hairline-b">
        {/* Internal, not the client's site. The home page's job is to get you
            into the work index with this project already open; the live site
            is one click further on, from inside the preview itself. The hash
            is the same deep-link shape `/services#<slug>` already uses. */}
        <Link
          href={`/work#${project.slug}`}
          onMouseEnter={() => {
            setHovered(true);
            glyphRef.current?.play();
          }}
          onMouseLeave={() => {
            setHovered(false);
            glyphRef.current?.reset();
          }}
          className="grid grid-cols-12 items-center gap-x-gutter gap-y-4 py-7 md:py-9"
        >
          {choreography ? (
            <Glyph
              ref={glyphRef}
              choreography={choreography}
              color={glyphColor}
              hovered={hovered}
              className="col-span-2 h-9 w-9 text-ink/35 transition-colors duration-400 ease-expo group-hover:text-accent md:col-span-1"
            />
          ) : (
            <span className="meta tnum col-span-2 text-ink/35 transition-colors duration-400 ease-expo group-hover:text-accent md:col-span-1">
              {project.index}
            </span>
          )}

          <Heading className="col-span-10 text-title font-medium transition-[color,transform] duration-600 ease-expo group-hover:translate-x-2 group-hover:text-accent md:col-span-6">
            {project.title}
          </Heading>

          {/* One descriptor, not two. The old row carried the client name
              beside the project name, which for most of these is the same
              words twice; what earns the column is what the client does.

              `min-w-0` because a grid item's automatic minimum size is its
              content, not its track. These names are set in tracked-out mono
              and the longest ("Marketing & Communications") is already close to
              the ten columns it gets at 360; without this it would push past
              them rather than wrap inside them, since nothing else here is
              free to give way. */}
          <p className="meta col-span-10 min-w-0 text-ink/45 md:col-span-3">{project.industry}</p>

          <div className="col-span-2 flex items-center justify-end gap-4 md:col-span-2">
            <span className="meta tnum text-ink/35">{project.year}</span>
            {/* Hidden outright below `md`, not merely transparent. It is a
                hover cue, and a touch device has no hover to reveal it — but
                `opacity-0` still reserves its width plus the 1rem gap beside
                it. This cell is two 4px tracks and one 24px gap wide at 360,
                so those 30px had nowhere to go: `justify-end` pushed the
                overflow left and the year sat 4px on top of the industry
                label. Hiding it gives the year the cell to itself. */}
            <span
              aria-hidden="true"
              className="hidden -translate-x-2 text-accent opacity-0 transition-all duration-600 ease-expo group-hover:translate-x-0 group-hover:opacity-100 md:inline"
            >
              ↗
            </span>
          </div>
        </Link>

        {/* Hover plate — clipped open from the centre. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[calc(var(--gutter)+4.5rem)] top-1/2 hidden h-28 aspect-video -translate-y-1/2 overflow-hidden border border-hairline opacity-0 [clip-path:inset(50%_0%)] transition-all duration-800 ease-expo group-hover:opacity-100 group-hover:[clip-path:inset(0%_0%)] lg:block"
        >
          <Image src={project.image} alt="" fill sizes="160px" className="object-cover" />
        </div>
      </article>
    );
  }

  const plate = (
    <>
      <div className="absolute inset-0 transition-transform duration-800 ease-expo group-hover:scale-[1.02]">
        <Image
          src={project.image}
          alt={`${project.title} homepage`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <span className="meta absolute bottom-4 right-4 translate-y-3 bg-accent px-2.5 py-1.5 text-canvas opacity-0 transition-all duration-600 ease-expo group-hover:translate-y-0 group-hover:opacity-100">
        {onPreview ? "Preview" : "View ↗"}
      </span>
    </>
  );

  const plateClass =
    "relative block aspect-[16/9] w-full overflow-hidden border border-hairline bg-bone text-left transition-colors duration-600 ease-expo group-hover:border-accent";

  return (
    <article {...revealAttr} className="group">
      {onPreview ? (
        <button
          type="button"
          onClick={() => onPreview(project)}
          aria-label={`Preview ${project.title}`}
          className={plateClass}
        >
          {plate}
        </button>
      ) : project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noreferrer noopener"
          className={plateClass}
        >
          {plate}
        </a>
      ) : (
        <div className={plateClass}>{plate}</div>
      )}

      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <Heading className="text-title font-medium">
            {onPreview ? (
              <button
                type="button"
                onClick={() => onPreview(project)}
                className="text-left transition-colors duration-400 ease-expo hover:text-accent group-hover:text-accent"
              >
                {project.title}
              </button>
            ) : project.href ? (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors duration-400 ease-expo hover:text-accent group-hover:text-accent"
              >
                {project.title}
              </a>
            ) : (
              project.title
            )}
          </Heading>
          <p className="meta mt-2 text-ink/45">{project.industry}</p>
        </div>
        <span className="meta tnum shrink-0 text-ink/35">{project.year}</span>
      </div>

      <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink/55">
        {project.summary}
      </p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {project.technology.map((tag) => (
          <li
            key={tag}
            className="micro border border-hairline px-2 py-1 text-ink/50 transition-colors duration-400 ease-expo group-hover:border-accent/30"
          >
            {tag}
          </li>
        ))}
        {/* Status flag, not a tech tag — filled solid instead of outlined so
            it reads as distinct from the technology row it shares. */}
        <li className="micro bg-accent px-2 py-1 text-canvas">
          {project.status === "live" ? "Live" : "Concept"}
        </li>
      </ul>
    </article>
  );
}
