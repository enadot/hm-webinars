import type { CampaignConfig } from "@/lib/campaign-schema";

export type OgPalette = {
  /** Card background. */
  bg: string;
  /** Elevated panel behind the date row. */
  surface: string;
  /** Primary text. */
  fg: string;
  /** Secondary text. */
  muted: string;
  /** Highlight colour — accent bar, dot and the headline accent. */
  accent: string;
  /** Text drawn on top of `accent`. */
  onAccent: string;
};

/**
 * Share-card palettes, keyed by template id. Each one mirrors the hero of the
 * template it belongs to, so a shared link previews in the same colours the
 * visitor lands on. Templates whose hero is light get a dark card anyway —
 * share cards read better on both light and dark chat backgrounds when they
 * carry their own weight.
 */
const PALETTES: Record<string, OgPalette> = {
  "step-change": {
    bg: "#162321",
    surface: "#273533",
    fg: "#EFEFEF",
    muted: "#9CAFA5",
    accent: "#74DF93",
    onAccent: "#162321",
  },
  "editorial-dark": {
    bg: "#0a0b0d",
    surface: "#16181c",
    fg: "#ffffff",
    muted: "#a8acb3",
    accent: "#3d7bff",
    onAccent: "#ffffff",
  },
  wealth: {
    bg: "#052E22",
    surface: "#0B4A36",
    fg: "#ffffff",
    muted: "#A7F3D0",
    accent: "#34D399",
    onAccent: "#052E22",
  },
  "bold-hero": {
    bg: "#0A0E27",
    surface: "#1B2762",
    fg: "#ffffff",
    muted: "#c7cbe0",
    accent: "#F5B500",
    onAccent: "#0A0E27",
  },
  editorial: {
    bg: "#1c1917",
    surface: "#292524",
    fg: "#fafaf9",
    muted: "#a8a29e",
    accent: "#d6d3d1",
    onAccent: "#1c1917",
  },
  energetic: {
    bg: "#18181b",
    surface: "#27272a",
    fg: "#fafafa",
    muted: "#a1a1aa",
    accent: "#a855f7",
    onAccent: "#ffffff",
  },
};

const FALLBACK: OgPalette = {
  bg: "#0A0E27",
  surface: "#1B2762",
  fg: "#ffffff",
  muted: "#c7cbe0",
  accent: "#F5B500",
  onAccent: "#0A0E27",
};

/**
 * Resolve a share-card palette for a campaign. Falls back to the campaign's own
 * theme colours when the template is unknown, so a template added later still
 * gets an on-brand card instead of a generic one.
 */
export function ogPaletteFor(
  templateId: string,
  config?: Pick<CampaignConfig, "theme"> | null
): OgPalette {
  const known = PALETTES[templateId];
  if (known) return known;
  const theme = config?.theme;
  if (!theme) return FALLBACK;
  return {
    bg: theme.dark || FALLBACK.bg,
    surface: theme.primary2 || theme.primary || FALLBACK.surface,
    fg: "#ffffff",
    muted: "#c7cbe0",
    accent: theme.accent || FALLBACK.accent,
    onAccent: theme.dark || FALLBACK.onAccent,
  };
}
