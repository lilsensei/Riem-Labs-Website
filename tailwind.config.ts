import type { Config } from "tailwindcss";

/**
 * Riem Labs — design tokens.
 *
 * The palette is deliberately tiny and strictly hierarchical:
 *   canvas/bone  → surfaces
 *   ink/hairline → text + structure
 *   accent       → interactive signal ONLY (never decoration)
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary / canvas surfaces
        canvas: "#FFFFFF",
        bone: "#F4F4F0",
        // Secondary / text + framing
        ink: "#0D0D0D",
        hairline: "#E0E0DC",
        // Accent / interactive token — matches the brand mark exactly.
        // `on-dark` is the same hue and saturation lifted in lightness until
        // it clears WCAG AA (4.5:1) against `ink`; the brand blue itself only
        // reaches 2.42:1 there, which is fine for a 104px headline but not for
        // the 11px index on the inverted CTA. Light surfaces keep the brand
        // blue, which already clears AA comfortably (8.04:1 on canvas).
        accent: {
          DEFAULT: "#1B17FF",
          "on-dark": "#6865FF",
        },
        // Hero dual-layer palette. Layer 1 is mist/graphite; the reveal layer
        // inverts to accent/mist.
        mist: "#F6F6F4",
        graphite: "#121210",
        stone: "#706E63",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "PP Neue Montreal", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Editorial display scale for the interior page mastheads — reached
        // only through PageIntro. Deliberately a step under the home hero
        // (--hero-headline-size, its own token): at 1920 that is 128.6px and
        // this is 112px. The old ceiling put interior heroes ABOVE the home
        // page at wide desktop, which read as a flat hierarchy. The 2.75rem
        // floor is unchanged, so phones keep the size they already had.
        display: ["clamp(2.75rem, 6vw, 7rem)", { lineHeight: "1", letterSpacing: "-0.045em" }],
        // Flush-left hero statement.
        hero: [
          "clamp(2.5rem, 0.75rem + 9.1vw, 5.25rem)",
          { lineHeight: "1", letterSpacing: "-0.04em", fontWeight: "700" },
        ],
        // Hero intro paragraph.
        intro: ["18px", { lineHeight: "1.56" }],
        headline: ["clamp(2rem, 4.4vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.035em" }],
        title: ["clamp(1.5rem, 2.4vw, 2.5rem)", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        lede: ["clamp(1.05rem, 1.45vw, 1.5rem)", { lineHeight: "1.4", letterSpacing: "-0.015em" }],
        meta: ["0.6875rem", { lineHeight: "1.1", letterSpacing: "0.14em" }],
        micro: ["0.625rem", { lineHeight: "1.1", letterSpacing: "0.18em" }],
      },
      transitionTimingFunction: {
        // The single easing curve used across the entire system.
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        // Snappier curve reserved for the magnetic CTA.
        magnet: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
      transitionDuration: {
        180: "180ms",
        400: "400ms",
        520: "520ms",
        600: "600ms",
        800: "800ms",
        1200: "1200ms",
      },
      maxWidth: {
        grid: "112rem",
        intro: "37.5rem",
      },
      spacing: {
        // The shared vertical grid margin — logo and hero headline sit on it.
        gutter: "clamp(1.5rem, 0.607rem + 3.214vw, 3.5rem)",
        section: "clamp(5rem, 11vw, 11rem)",
        drawer: "25rem",
        band: "7rem",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.72)" },
        },
        marquee: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%,0,0)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 2s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        marquee: "marquee 38s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
