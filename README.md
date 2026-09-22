# Riem Labs

A multi-page web design studio platform — Next.js App Router, TypeScript, Tailwind CSS, GSAP + ScrollTrigger, and Lenis inertia scrolling.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run typecheck
npm run indexnow # ping IndexNow after a production content change
```

## Routes

| Route       | Contents                                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| `/`         | Hero, Signal, Selected Work, Practice (Surface vs System), Services, CTA        |
| `/about`    | Story, operating principles, metric grid, practice/team, process                |
| `/work`     | Filterable project index with in-page preview modal                             |
| `/services` | Expandable service accordions, engagement models, process                       |
| `/contact`  | Inquiry form (budget selector, scope multi-select), direct metadata, FAQ        |
| `/terms` `/privacy` `/refund` | Legal pages, as expanding sections                           |

`POST /api/inquiry` validates a submission and sends it on as mail. It rate-limits by client, drops anything that trips the honeypot, and answers a bot exactly as it answers a person. Credentials come from the environment — see [.env.example](.env.example).

Search and social metadata is built in [lib/seo.ts](lib/seo.ts), structured data in [lib/schema.ts](lib/schema.ts), and [sitemap.ts](app/sitemap.ts) / [robots.ts](app/robots.ts) serve the crawler files. The canonical origin lives once, in [`site.url`](lib/site.ts).

## Design tokens

Defined once in [tailwind.config.ts](tailwind.config.ts) and mirrored as CSS variables in [globals.css](app/globals.css).

| Token      | Value     | Used for                                                          |
| ---------- | --------- | ----------------------------------------------------------------- |
| `canvas`   | `#FFFFFF` | Primary surface                                                   |
| `bone`     | `#F4F4F0` | Alternating section surface                                       |
| `ink`      | `#0D0D0D` | Headlines, body, inverted surfaces                                |
| `hairline` | `#E0E0DC` | 1px structural rules and grid lines                               |
| `accent`   | `#1B17FF` | **Interactive only** — hover states, indices, brackets, live time |
| `mist`     | `#F6F6F4` | Hero base surface, and inverted text on the reveal layer          |
| `graphite` | `#121210` | Hero typography                                                   |
| `stone`    | `#706E63` | Hero intro paragraph                                              |

The accent is never decorative. If an element is not a state, an index, a bracket, or a ticker, it does not get the accent.

`mist` / `graphite` / `stone` are scoped to the hero's dual-layer system; the rest of the site runs on `canvas` / `ink`.

Typography is a fluid editorial scale — `hero`, `display`, `headline`, `title`, `lede`, `intro`, `meta`, `micro` — set in Inter (the open stand-in for PP Neue Montreal) with JetBrains Mono for all uppercase metadata. `gutter` is the shared vertical grid margin the logo and hero headline both sit on.

Every transition uses one easing curve: `cubic-bezier(0.16, 1, 0.3, 1)`, exposed as the `ease-expo` Tailwind utility and as GSAP's `expo.out`.

## Motion

- **[SmoothScrollProvider](components/SmoothScrollProvider.tsx)** — one Lenis instance driven by GSAP's ticker, with `ScrollTrigger.update` bound to its scroll event so both libraries agree on position. Skipped entirely under `prefers-reduced-motion`.
- **[useReveal](hooks/useReveal.ts)** — the section-level reveal driver. Wrap any section in [`RevealSection`](components/RevealSection.tsx), then mark content inside it:

  | Attribute                     | Behaviour                                     |
  | ----------------------------- | --------------------------------------------- |
  | `[data-reveal-block]`         | One animation group (defaults to the section) |
  | `[data-reveal-block="load"]`  | Plays on mount rather than on scroll          |
  | `[data-reveal-line] > span`   | Masked line, `translateY(110%) → 0`           |
  | `[data-reveal-fade]`          | Block fade + 18px rise                        |

  In practice you use the [`RevealLines`, `RevealBlock`, `Fade`](components/RevealText.tsx) helpers, which emit those attributes. Headings are split into authored lines rather than measured at runtime, so break points stay intentional.

  `y: 0` in the initial `gsap.set` is load-bearing: GSAP resolves the CSS pre-hide's `translateY(110%)` into a *pixel* offset and applies `yPercent` on top of it rather than replacing it. Drop the `y: 0` and every masked line ends up parked just below its own mask.

- **[HeroSpotlight](components/HeroSpotlight.tsx)** — the dual-layer cursor reveal. Two identical copies of [`HeroContent`](components/HeroContent.tsx) are stacked: `mist`/`graphite` underneath, `accent`/`mist` on top. The upper layer is clipped to a vertical band centred on `--reveal-position`, so it reads as an inversion of whatever it passes over.

  | Property             | Behaviour                                                     |
  | -------------------- | ------------------------------------------------------------- |
  | `--reveal-position`  | Cursor X as a percentage of the viewport                       |
  | `--reveal-width`     | `112px` while moving, `1px` after 680ms at rest                |
  | `[data-reveal-anchor="menu"]` | Snaps the band under the Menu button while hovered    |
  | `[data-wiping]`      | Set during the scroll wipe; drops the transition so the scrub doesn't lag |

  Both are registered with `@property` so position and width can transition on independent curves from one `clip-path` declaration. The entrance animation is deliberately CSS (`.hero-rise`), not GSAP — both layers run the same keyframes in the same commit, which is what keeps them in pixel register. A JS tween driving only the base layer would tear.

  The layer is hidden entirely unless the script enables it (`[data-active]`), so coarse-pointer, no-JS, and reduced-motion visitors never see a stray band.

- **Menu drawer** — an inline `clip-path` panel in [Header](components/Header.tsx), not a modal sheet. A full-width `bg-accent` element is revealed only by its clip: `inset(0 0 0 calc(100% - 7rem))` closed, `inset(0 0 0 calc(100% - 25rem))` open, over `0.52s`.

  Both the `clip-path` and `opacity` transitions must stay in the single `.drawer-panel` rule. A Tailwind `transition-opacity` utility on the same element emits the `transition` shorthand from a later cascade layer and silently drops the clip-path transition, making the panel snap.

Pre-hidden states are scoped to a `.js` class set on `<html>` before first paint, so nothing flashes on load **and** the whole site stays readable with JavaScript disabled.

## Components

`Header` · `Footer` · `HeroSpotlight` · `HeroContent` · `SectionHeader` · `ProjectCard` · `ProjectPreview` · `WorkGallery` · `ServiceAccordion` · `ContactForm` · `BracketLink` · `LiveClock` · `LogoMarquee` · `PageIntro` · `CTABanner` · `SmoothScrollProvider` · `RevealSection` / `RevealText`

Content lives in [lib/](lib/) — [`projects.ts`](lib/projects.ts), [`services.ts`](lib/services.ts), [`site.ts`](lib/site.ts). Add a project or service there and every page that lists it updates.

## Notes

- **Lenis package name.** The brief specified `@studio-freight/lenis`; that name is deprecated and frozen at 1.0.42. This uses `lenis`, the same library under its current name, so it keeps receiving fixes. The import is `import Lenis from "lenis"`.
- **Imagery.** Project covers are screenshots of the delivered sites, in [public/work/](public/work/) and referenced by `image` in [projects.ts](lib/projects.ts). No stock photography, nothing to license.
- **Fonts.** PP Neue Montreal is commercially licensed and not bundled. Inter is loaded via `next/font` and PP Neue Montreal sits ahead of it in the CSS stack, so dropping in the licensed files is a font-face declaration away.
