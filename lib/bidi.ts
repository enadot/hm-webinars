import bidiFactory from "bidi-js";

const bidi = bidiFactory();

/**
 * Reorder logical text into visual order.
 *
 * satori (the engine behind next/og) honours `direction: rtl` for box layout but
 * does not implement the Unicode bidirectional algorithm, so Hebrew passed to it
 * verbatim renders with its characters reversed. Running UAX#9 here and handing
 * satori pre-ordered text is the supported way around that.
 *
 * Embedded Latin words and digit runs keep their own direction and mirrored
 * characters are flipped, so mixed strings like `29/8 · בשעה 22:00` survive.
 *
 * Only for canvas-style renderers that lack bidi. Never use this for text that
 * reaches the browser — browsers implement bidi themselves, and pre-ordered text
 * would come out reversed there and unreadable to screen readers.
 */
export function toVisualOrder(text: string): string {
  if (!text) return "";
  // Reorder each line independently: a hard break restarts the bidi paragraph.
  return text
    .split("\n")
    .map((line) =>
      line ? bidi.getReorderedString(line, bidi.getEmbeddingLevels(line, "rtl")) : line
    )
    .join("\n");
}
