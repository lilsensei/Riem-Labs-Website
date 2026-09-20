"use client";

import Link from "next/link";
import BracketLink from "@/components/BracketLink";
import DataRain from "@/components/DataRain";
import SocialIcon from "@/components/SocialIcon";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";
import { services } from "@/lib/services";
import { legalLinks, navigation, site, socials, WHATSAPP_ENQUIRY, whatsappHref } from "@/lib/site";

// Footer's own selection and order; the Contact page renders the full list.
const FOOTER_SOCIALS = (["linkedin", "instagram", "whatsapp"] as const).map((icon) => {
  const s = socials.find((x) => x.icon === icon)!;
  return icon === "whatsapp" ? { ...s, href: whatsappHref(WHATSAPP_ENQUIRY) } : s;
});

/**
 * One column of the right-hand navigation grid.
 *
 * Plain top-anchored flow — a column is exactly as tall as its own links
 * need it to be. An earlier version stretched every column to the row's
 * shared height and pinned its last link to that shared bottom line, which
 * looked fine for Services (already the tallest, so nothing visibly moved)
 * but pushed Legal's three short links down by however much taller Services
 * happened to be, and did the same to Index — a large, arbitrary gap in any
 * column that wasn't the tallest one in the row. Column length varies with
 * real content (services get renamed, legal pages get added), so pinning a
 * bottom line only ever held up by coincidence.
 */
function Column({
  title,
  children,
  navClassName = "w-40 shrink-0 sm:w-48 lg:w-56",
}: {
  title: string;
  children: React.ReactNode;
  /** Legal overrides this to grow past the fixed 160/192px width through
   *  `lg:` — see its own call site for why. */
  navClassName?: string;
}) {
  return (
    <nav aria-label={title} className={navClassName}>
      <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-ink/35">{title}</p>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </nav>
  );
}

const linkClass =
  "text-[14px] text-ink/70 transition-colors duration-400 ease-expo hover:text-accent";

export default function Footer() {
  const { scrollTo } = useSmoothScroll();
  const year = new Date().getFullYear();

  return (
    <footer className="hairline-t relative bg-bone">
      {/* The same ambient rain as the hero's base layer — no hover reveal
          here (there's nothing playing that role in the footer, unlike the
          hero's cursor band), so it's the plain "ambient" tone, with its own
          radial edge-fade. Opacity bumped well above the hero's 8% — dark
          ink at codedgar's own level reads as nearly invisible against a
          footer this much busier (five nav columns, a wordmark, a status
          bar) even though it holds up fine over the hero's much emptier
          field. z-0 plus an explicit z-10 wrapper below is what keeps it
          under the content: a positioned (absolute) z-0 sibling paints
          ABOVE plain in-flow content by default CSS stacking rules, not
          below it, so leaving the content at its implicit stacking would
          have let this canvas sit on top of the nav links and swallow
          their clicks. */}
      <DataRain tone="ambient" fadeColor="bg-bone" opacity={0.11} className="absolute inset-0 z-0" />

      <div className="shell relative z-10">
        {/* The band is deliberately shallow. Everything in it sits down against
            the rule below rather than floating in the middle of a tall block,
            so the wordmark under that rule reads as the floor of the page. */}
        <div className="pb-5 pt-14 lg:pt-16">
          {/* One flat row, four siblings — the headline block, then the
              three nav columns — sharing a single uniform `gap-x-12`, so the
              gap from the headline to Index is the same width as
              Index-to-Services and Services-to-Legal. That rules out
              `justify-between`, which pours all leftover space into one gap
              and leaves the other two cramped by comparison; the headline
              block instead grows via `flex-1` to soak up the row's
              remaining width itself, up to its own cap.

              `items-start` — every sibling sits at its own natural height
              from the row's top. "Available for new projects" and the three
              column headers land on one shared top line for free, simply by
              being siblings in the same row; nothing below that is forced to
              line up with anything else, so a column's own length is what
              decides where it ends, not the tallest column in the row. */}
          <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
            <div className="min-w-[16rem] max-w-[50rem] flex-1">
              <p className="meta inline-flex items-center gap-2.5 text-ink/45">
                <span className="status-dot" aria-hidden="true" />
                Available for new projects
              </p>

              {/* Authored lines, not measured ones — same convention the
                  reveal headings use elsewhere (see README), so the break
                  lands after the comma at every width. Never `whitespace-nowrap`:
                  on a narrow phone that forced the page wider than the
                  viewport. `text-3xl` on mobile keeps each line to one row. */}
              <h2 className="mt-5 text-balance text-3xl font-medium leading-none tracking-[-0.035em] hyphens-none break-keep lg:text-[3.25rem]">
                <span className="block">Designed around the business,</span>
                <span className="block">not just the brief.</span>
              </h2>

              {/* Pure marks, no bounding box — resting a fixed distance
                  under the headline rather than pinned to any shared row
                  bottom. */}
              <ul className="mt-8 flex items-center gap-5">
                {FOOTER_SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={s.label}
                      className="flex items-center justify-center text-ink/50 transition-colors duration-400 ease-expo hover:text-accent"
                    >
                      <SocialIcon name={s.icon} className="h-5 w-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <Column title="Index">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </Column>

            <Column title="Services">
              {services.map((s) => (
                <li key={s.index}>
                  <Link href="/services" className={linkClass}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </Column>

            {/* w-auto through lg:, back to the shared w-48 once the button
                below is hidden — Legal's own fixed 160px column had no room
                left for "[ Back to top ]" (118px) next to "Refund Policy"
                (64px) in a 12px gap, so it wrapped to two lines. Growing the
                nav itself, rather than trying to fit the button inside a
                width that was never going to hold both, uses the real open
                space the row already has once Legal wraps onto its own
                line at this width — no absolute positioning, no guessing
                Refund Policy's exact vertical offset to match against. */}
            <Column title="Legal" navClassName="w-full shrink-0 lg:w-56">
              {legalLinks.map((link, i) => {
                const isLast = i === legalLinks.length - 1;
                const anchor = (
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                );

                if (!isLast) return <li key={link.href}>{anchor}</li>;

                // Mobile only — the same "Back to top" control already in
                // the status bar below, just reachable here too: on a
                // narrow screen the nav columns wrap well above the
                // copyright bar, making the original one the least visible
                // spot on the page for it. Reuses scrollTo(0) rather than a
                // new control.
                return (
                  <li key={link.href} className="flex items-center justify-between gap-6">
                    {anchor}
                    <span className="lg:hidden">
                      <BracketLink onClick={() => scrollTo(0)} size="sm">
                        Back to top
                      </BracketLink>
                    </span>
                  </li>
                );
              })}
            </Column>
          </div>
        </div>

        {/* Oversized wordmark, sitting on the rule as the page's floor. */}
        <div className="hairline-t overflow-hidden py-6">
          <p
            className="select-none whitespace-nowrap font-medium leading-none text-ink/[0.07]"
            style={{ fontSize: "clamp(3.5rem, 9.8vw, 11.5rem)", letterSpacing: "-0.05em" }}
          >
            {site.name.toUpperCase()}
          </p>
        </div>

        {/* Status bar */}
        <div className="hairline-t flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-6">
          <p className="meta text-ink/40">
            © {year} {site.name} — All rights reserved
          </p>

          <p className="meta text-ink/40">
            Based in {site.city}, {site.country}
          </p>

          {/* Desktop only. Below `lg` the same control already sits beside
              Refund Policy, where the nav columns actually end — two of them
              on one phone screen read as a duplicate, which it was. */}
          <span className="hidden lg:inline-flex">
            <BracketLink onClick={() => scrollTo(0)} size="sm">
              Back to top
            </BracketLink>
          </span>
        </div>
      </div>
    </footer>
  );
}
