import { ImageResponse } from "next/og";
import type { OgPalette } from "@/lib/og-theme";
import { toVisualOrder } from "@/lib/bidi";

export const OG_SIZE = { width: 1200, height: 630 };

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 800;
  style: "normal";
};

export type OgCardContent = {
  brand: string;
  eyebrow: string;
  headline: string[];
  accentLine: string[];
  dateLabel: string;
  cta: string;
};

/**
 * Trim to a whole word, then reorder to visual order for satori. Truncation has
 * to happen first: it operates on logical text, which is the order the words are
 * actually written in.
 */
export function clampWords(text: string, max: number): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return toVisualOrder(clean);
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
  return toVisualOrder(`${trimmed}…`);
}

/**
 * Word-wrap logical text, then reorder each line for satori.
 *
 * satori must not do the wrapping itself here: it would wrap the already
 * visual-ordered string and emit the lines bottom-to-top. Wrapping in logical
 * order and reordering line by line keeps them in reading order.
 */
export function visualLines(text: string, maxChars: number): string[] {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of clean.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.map((l) => toVisualOrder(l));
}

/**
 * Render the 1200x630 share card. Kept separate from the route so it can be
 * exercised without a database, and reused if other routes need a card later.
 */
export function renderOgCard({
  palette: p,
  content: c,
  fonts,
}: {
  palette: OgPalette;
  content: OgCardContent;
  fonts: OgFont[];
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: p.bg,
          color: p.fg,
          fontFamily: "Heebo",
          padding: "64px 72px",
          direction: "rtl",
        }}
      >
        {/* Accent rule across the top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "100%",
            height: 10,
            background: p.accent,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {c.brand ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: p.accent,
                  display: "flex",
                }}
              />
              <div style={{ fontSize: 30, fontWeight: 800, color: p.fg }}>{c.brand}</div>
            </div>
          ) : null}
          {c.eyebrow ? (
            <div style={{ fontSize: 26, color: p.muted }}>{c.eyebrow}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1010 }}>
          {c.headline.map((line, i) => (
            <div
              key={`h${i}`}
              style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.14, color: p.fg }}
            >
              {line}
            </div>
          ))}
          {c.accentLine.map((line, i) => (
            <div
              key={`a${i}`}
              style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.14, color: p.accent }}
            >
              {line}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {c.dateLabel ? (
            <div
              style={{
                display: "flex",
                background: p.surface,
                color: p.fg,
                fontSize: 26,
                borderRadius: 18,
                padding: "20px 28px",
              }}
            >
              {c.dateLabel}
            </div>
          ) : null}
          {c.cta ? (
            <div
              style={{
                display: "flex",
                background: p.accent,
                color: p.onAccent,
                fontSize: 26,
                fontWeight: 800,
                borderRadius: 999,
                padding: "20px 32px",
              }}
            >
              {c.cta}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
