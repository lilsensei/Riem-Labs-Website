"use client";

import { useEffect, useState } from "react";
import { currentQuarter } from "@/lib/site";

/**
 * The current quarter, under the availability badge as plain context — the old
 * "— slots open." suffix read as a capacity promise the studio has not made.
 *
 * The quarter itself comes from `currentQuarter`, which derives it from the
 * date in Nairobi; this component only decides *when* to ask. It asks on mount
 * rather than during the server render because the page is statically
 * generated, and a value baked at build time would be wrong from the first
 * quarter boundary onwards. Nothing is scheduled and nothing is stored: the
 * label is correct on every load because it is computed on every load.
 */
export default function AvailabilityLine() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(currentQuarter());
  }, []);

  return (
    <p className="mt-4 text-sm leading-relaxed text-ink/55">
      <span suppressHydrationWarning>{label}</span>
    </p>
  );
}
