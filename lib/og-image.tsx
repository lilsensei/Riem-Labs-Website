import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";
import { site } from "./site";

/**
 * The social card, shared by the Open Graph and Twitter image routes.
 *
 * It is the site's own furniture and nothing else: canvas white, the brand
 * mark, one hairline rule and the studio's offering — the same line the card's
 * alt text carries, so what the image says and what it is described as saying
 * are one string. No claim appears here that is not already on the site, and
 * the brand itself is untouched — the wordmark is the real logo file, not a
 * re-set approximation.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.offering}`;

/**
 * Read off disk and inlined rather than fetched: this runs at build time,
 * when there is no server to fetch `/riem-labs-logo.png` from yet.
 */
const LOGO = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "riem-labs-logo.png"),
).toString("base64")}`;

/** The tokens this card uses, matching tailwind.config.ts exactly. */
const CANVAS = "#FFFFFF";
const HAIRLINE = "#E0E0DC";
const STONE = "#706E63";
const ACCENT = "#1B17FF";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: CANVAS,
          padding: "88px 96px",
        }}
      >
        {/* The logo at a third of the card's width: the wordmark stays
            legible at the size a timeline actually renders this. */}
        <img src={LOGO} width={400} height={106} alt="" />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* The same hairline the site rules its sections with. */}
          <div style={{ display: "flex", height: 1, backgroundColor: HAIRLINE }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: STONE,
              }}
            >
              {site.offering}
            </div>
            {/* The origin, in the accent the site reserves for signal. */}
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: "0.04em",
                color: ACCENT,
              }}
            >
              {site.url.replace("https://", "")}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
