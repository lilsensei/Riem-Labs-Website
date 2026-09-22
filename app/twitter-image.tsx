import { alt, contentType, renderOgImage, size } from "@/lib/og-image";

/**
 * The same card as the Open Graph one. Declared as its own route rather than
 * left to fall back, so twitter:image is emitted explicitly and does not
 * depend on how Next chooses to inherit it.
 */
export { alt, contentType, size };

export default function TwitterImage() {
  return renderOgImage();
}
