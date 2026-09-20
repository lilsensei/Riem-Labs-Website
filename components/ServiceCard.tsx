"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Glyph, { type GlyphHandle } from "@/components/Glyph";
import type { Choreography } from "@/lib/glyphChoreographies";
import { serviceSlug, type Service } from "@/lib/services";

/**
 * One homepage service card. Split out from the server-rendered page so the
 * glyph's hover trigger can live here — codedgar wires its choreography to
 * the whole card's hover (`data-parent-hover=".service-card"`), not just the
 * icon, so this listens on the same `<Link>` that already carries the
 * card's own existing hover styling and just adds the glyph trigger
 * alongside it; nothing about that existing styling is touched.
 */
export default function ServiceCard({
  service,
  choreography,
}: {
  service: Service;
  choreography: Choreography;
}) {
  const glyphRef = useRef<GlyphHandle>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/services#${serviceSlug(service.title)}`}
      onMouseEnter={() => {
        setHovered(true);
        glyphRef.current?.play();
      }}
      onMouseLeave={() => {
        setHovered(false);
        glyphRef.current?.reset();
      }}
      className="group flex h-full flex-col justify-between gap-10 bg-canvas p-8 transition-colors duration-600 ease-expo hover:bg-bone lg:p-12"
    >
      <div>
        {/* `items-start`, not `items-baseline` — the row was tuned for a
            small text index next to the arrow glyph; a 40px icon has no
            text baseline of its own to align against, and baseline
            alignment left it sitting oddly low next to the arrow. */}
        <div className="flex items-start justify-between gap-4">
          <Glyph
            ref={glyphRef}
            choreography={choreography}
            hovered={hovered}
            className="h-9 w-9"
          />
          <span
            aria-hidden="true"
            className="mt-1 text-ink/20 transition-all duration-600 ease-expo group-hover:translate-x-1 group-hover:text-accent"
          >
            →
          </span>
        </div>
        <h3 className="mt-8 text-title font-medium transition-colors duration-400 ease-expo group-hover:text-accent">
          {service.label}
        </h3>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/55">{service.short}</p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {service.stack.map((tag) => (
          <li key={tag} className="micro border border-hairline px-2 py-1 text-ink/45">
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}
