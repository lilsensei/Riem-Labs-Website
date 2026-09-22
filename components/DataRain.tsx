"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

/**
 * Full-width katakana, digits, and a handful of symbols — the classic
 * "Matrix" glyph set, matching codedgar.com's own character source exactly
 * (confirmed by reading its shipped JS directly, not guessed).
 */
const CHARS =
  "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789@#$%&*+=";

/**
 * Depth tiers, transcribed from codedgar's source — each spawning stream
 * rolls one of these, which is what gives the field a sense of depth
 * instead of a uniform wall of text. Selection is weighted (25/45/30),
 * not uniform.
 */
const TIERS = [
  { weight: 0.25, fontScale: 1.2, maxOpacity: 0.45, speedScale: 0.5 },
  { weight: 0.45, fontScale: 1.6, maxOpacity: 0.75, speedScale: 0.8 },
  { weight: 0.3, fontScale: 2.3, maxOpacity: 1, speedScale: 1.1 },
];

const BASE_SPEED = 0.4;
const GAP = 22;
const BASE_FONT_SIZE = 13;
/** Normalised 0-1 form of the site's 0-100 data-rain-density — 100 on codedgar. */
const DENSITY = 1;

function randomChar() {
  return CHARS[(Math.random() * CHARS.length) | 0];
}

function pickTier() {
  const roll = Math.random();
  let sum = 0;
  for (let i = 0; i < TIERS.length; i++) {
    sum += TIERS[i].weight;
    if (roll < sum) return i;
  }
  return TIERS.length - 1;
}

function randomLength() {
  return 5 + ((Math.random() * 23) | 0);
}

type Stream = {
  headRow: number;
  length: number;
  speed: number;
  accumulator: number;
  glyphs: string[];
  active: boolean;
  spacing: number;
  headChar: string;
  tier: number;
  fontSize: number;
  maxOpacity: number;
};

function createStream(height: number): Stream {
  const tier = pickTier();
  const t = TIERS[tier];
  return {
    // Spawns somewhere above the visible area, at a distance proportional to
    // its own (scaled) character height, so tiers don't all start in sync.
    headRow: -Math.floor((Math.random() * height * 2) / (BASE_FONT_SIZE * t.fontScale)),
    length: randomLength(),
    speed: (0.3 + Math.random() * 0.9) * BASE_SPEED * t.speedScale,
    accumulator: 0,
    glyphs: [],
    active: true,
    spacing: 0,
    headChar: randomChar(),
    tier,
    fontSize: Math.round(BASE_FONT_SIZE * t.fontScale),
    maxOpacity: t.maxOpacity,
  };
}

function resetStream(s: Stream) {
  const tier = pickTier();
  const t = TIERS[tier];
  s.length = randomLength();
  s.speed = (0.3 + Math.random() * 0.9) * BASE_SPEED * t.speedScale;
  s.accumulator = 0;
  s.glyphs = [];
  s.active = false;
  // A pause before the column respawns — this staggered gap is what keeps
  // it reading as scattered streams rather than a rigid grid resetting in
  // lockstep every time one falls off the bottom.
  s.spacing = 4 + ((Math.random() * 26) | 0);
  s.headRow = 0;
  s.headChar = randomChar();
  s.tier = tier;
  s.fontSize = Math.round(BASE_FONT_SIZE * t.fontScale);
  s.maxOpacity = t.maxOpacity;
}

type Tone = "ambient" | "bright";

/**
 * Falling-character background, ported from codedgar.com's own shipped JS
 * (its class-based implementation converted to a plain draw loop here).
 * Two independent instances are used in HeroSpotlight:
 *
 *   "ambient" sits inside the hero's base layer, drawn in dark ink
 *   (`#191818`, codedgar's own fill colour) and dimmed further by a CSS
 *   `--rain-opacity` on the container — this is on top of, not instead of,
 *   each character's own tier-based alpha. (An earlier pass here assumed
 *   codedgar always draws at full alpha and dims purely via CSS; reading
 *   the actual source shows per-tier and per-trail-position alpha baked
 *   into the draw calls too — `#191818` at that alpha, dimmed again by the
 *   container, is what actually produces the barely-there look.)
 *
 *   "bright" sits inside the hero's existing accent reveal layer — the same
 *   clipped panel HeroSpotlight already uses to invert the headline under
 *   the cursor — drawn mist-coloured, undimmed. It needs no mask, opacity
 *   transition, or pointer listener of its own: it inherits whatever
 *   clip-path that layer already has, so it brightens and fades exactly in
 *   step with the text reveal it sits behind.
 *
 * The two run independent random stream state rather than a shared one —
 * visually indistinguishable at this density, and far simpler than
 * threading shared state across two separate DOM subtrees.
 */
export default function DataRain({
  tone = "ambient",
  fade = true,
  fadeColor = "bg-mist",
  opacity = 0.08,
  className = "",
}: {
  tone?: Tone;
  fade?: boolean;
  /** Tailwind background class the edge-fade blends into — match whatever
   *  surface this instance actually sits on (the hero's mist, the footer's
   *  bone, etc.), since the fade is a masked solid fill, not a gradient
   *  computed from the real background colour behind it. */
  fadeColor?: string;
  /** Ambient-tone-only container opacity, on top of each character's own
   *  tier alpha. 0.08 matches codedgar's own value exactly (see DataRain's
   *  top comment) — it's a prop rather than a hardcoded constant because
   *  the same dark ink on a much busier footer background reads as close
   *  to invisible at that level, even though it holds up fine against the
   *  hero's own emptier field. Has no effect on "bright" tone, which is
   *  already undimmed. */
  opacity?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const color = tone === "bright" ? "#F6F6F4" : "#191818";

    // Canvas's `font` setter parses its string as a standalone CSS font
    // shorthand, outside any element's cascade — `var(--font-mono)` cannot
    // resolve there the way it does in a stylesheet. Resolved once here via
    // the real computed value instead, so this can't quietly fail closed to
    // the context's default `10px sans-serif` and flatten every depth tier
    // to the same small, uniform size regardless of `fontSize`.
    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
      "ui-monospace, SFMono-Regular, monospace";

    let width = 0;
    let height = 0;
    let columnX: number[] = [];
    let streams: Stream[] = [];
    let frame = 0;
    let lastRender = 0;

    const layout = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columns = Math.max(1, Math.floor(width / GAP));
      columnX = Array.from({ length: columns }, (_, i) => (i + 0.5) * GAP);
      streams = Array.from({ length: columns }, () => createStream(height));
    };

    const updateStream = (s: Stream) => {
      if (!s.active) {
        s.spacing -= 1;
        if (s.spacing <= 0) {
          if (Math.random() > DENSITY) {
            s.spacing = 4 + ((Math.random() * 26) | 0);
            return;
          }
          s.active = true;
          s.headRow = -1;
          s.glyphs = [];
        }
        return;
      }
      s.accumulator += s.speed;
      while (s.accumulator >= 1) {
        s.accumulator -= 1;
        s.headRow += 1;
        s.glyphs.push(s.headChar);
        s.headChar = randomChar();
        if (s.glyphs.length > s.length) s.glyphs.shift();
      }
      if (s.headRow - s.length > Math.ceil(height / s.fontSize)) resetStream(s);
    };

    const drawStream = (s: Stream, x: number) => {
      if (!s.active) return;
      ctx.font = `${s.fontSize}px ${fontFamily}`;

      const headY = s.headRow * s.fontSize;
      if (headY >= 0 && headY < height) {
        ctx.globalAlpha = s.maxOpacity;
        ctx.fillText(s.headChar, x, headY);
      }

      // The trail behind the head, fading exponentially (×0.82 per
      // character further back) rather than a hard cutoff.
      const n = s.glyphs.length;
      for (let i = 0; i < n - 1; i++) {
        const y = (s.headRow - (n - 1 - i)) * s.fontSize;
        if (y < 0 || y >= height) continue;
        const behind = n - 1 - i;
        const alpha = s.maxOpacity * Math.pow(0.82, behind);
        if (alpha < 0.03) continue;
        ctx.globalAlpha = alpha;
        ctx.fillText(s.glyphs[i], x, y);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = color;

      for (const s of streams) updateStream(s);
      // Drawn back-to-front by tier, so nearer (brighter, larger) streams
      // read as sitting in front of farther ones wherever columns overlap.
      for (let tier = 0; tier < TIERS.length; tier++) {
        for (let i = 0; i < streams.length; i++) {
          if (streams[i].tier === tier) drawStream(streams[i], columnX[i]);
        }
      }
      ctx.globalAlpha = 1;
    };

    const draw = (now: number) => {
      frame = window.requestAnimationFrame(draw);
      // Throttled to ~30fps, matching codedgar's own pace for this effect —
      // plenty smooth for slow-falling ambient text.
      if (now - lastRender < 33) return;
      lastRender = now;
      render();
    };

    /**
     * Only paint while there is something to see.
     *
     * Three of these run at once — the hero's ambient field, the bright copy
     * inside the reveal layer, and the footer's — and each was repainting at
     * 30fps for the whole visit, including while its canvas sat entirely off
     * screen. On a desktop that is invisible; on a retina tablet it is three
     * full-width canvases being rasterised at 2x forever, which is steady work
     * competing with the scroll for exactly the frames the wipe needs.
     *
     * Nothing about the effect changes when it is on screen. The rain simply
     * stops while nobody can see it, and picks up again where it left off —
     * the stream positions live outside this loop, so there is no restart.
     */
    let onScreen = true;
    let pageVisible = !document.hidden;

    const shouldRun = () => onScreen && pageVisible && !reduced.matches;

    const run = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      // Reduced motion gets one static frame rather than a loop.
      if (reduced.matches) {
        render();
        return;
      }
      if (shouldRun()) frame = window.requestAnimationFrame(draw);
    };

    layout();
    run();

    const onResize = () => {
      layout();
      run();
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      run();
    };

    // `rootMargin` starts it a little before it scrolls in, so it is never
    // caught mid-catch-up at the moment it becomes visible.
    const observer = new IntersectionObserver(
      (entries) => {
        const next = entries.some((e) => e.isIntersecting);
        if (next === onScreen) return;
        onScreen = next;
        run();
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", run);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", run);
    };
  }, [tone]);

  const wrapperStyle: CSSProperties | undefined =
    tone === "ambient" ? { ["--rain-opacity" as string]: opacity } : undefined;
  const canvasStyle: CSSProperties | undefined =
    tone === "ambient" ? { opacity: `var(--rain-opacity, ${opacity})` } : undefined;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none overflow-hidden ${className}`}
      style={wrapperStyle}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={canvasStyle} />
      {fade ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${fadeColor}`}
          style={{
            maskImage: "radial-gradient(circle at 50% 50%, transparent 35%, black 90%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 35%, black 90%)",
          }}
        />
      ) : null}
    </div>
  );
}
