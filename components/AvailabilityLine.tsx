"use client";

import { useEffect, useState } from "react";

function quarterOf(date: Date) {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

/**
 * The current quarter, computed from the real date on mount so it advances
 * on its own instead of needing a manual copy edit. It sits under the
 * "Available for select projects" badge as plain context — the old
 * "— slots open." suffix read as a capacity promise the studio has not made.
 * The page is statically rendered, so a value computed during the server
 * render would stay frozen at build time — this reads the visitor's actual
 * clock in the browser instead, which is why it's a client component rather
 * than plain text on the page.
 */
export default function AvailabilityLine() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(quarterOf(new Date()));
  }, []);

  return (
    <p className="mt-4 text-sm leading-relaxed text-ink/55">
      <span suppressHydrationWarning>{label}</span>
    </p>
  );
}
