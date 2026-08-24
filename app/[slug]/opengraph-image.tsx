import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPublicCampaign } from "@/lib/campaign-source";
import { ogPaletteFor } from "@/lib/og-theme";
import { OG_SIZE, clampWords, visualLines, renderOgCard, type OgFont } from "@/lib/og-card";
import type { CampaignConfig } from "@/lib/campaign-schema";

export const alt = "כרטיס שיתוף לדף הוובינר";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Heebo is colocated with this route because satori needs a real TTF/OTF buffer
 * (it cannot read the woff2 files the site itself uses).
 *
 * Read from disk, not fetch(): Next 16's server runtime does not implement
 * fetch() over file:// URLs, so `fetch(new URL(..., import.meta.url))` threw
 * "not implemented... yet..." and the route 500'd on every request. The path is
 * built at runtime, so next.config.mjs traces these files in explicitly.
 */
async function loadFonts(): Promise<OgFont[]> {
  const dir = join(process.cwd(), "app", "[slug]");
  const [regular, bold] = await Promise.all([
    readFile(join(dir, "heebo-regular.ttf")),
    readFile(join(dir, "heebo-extrabold.ttf")),
  ]);
  return [
    { name: "Heebo", data: regular, weight: 400, style: "normal" },
    { name: "Heebo", data: bold, weight: 800, style: "normal" },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Through the shared reader, so the share card still renders from the
  // in-repo snapshot while the database is unreachable.
  const campaign = await getPublicCampaign(slug);

  let config: CampaignConfig | null = null;
  try {
    config = campaign ? (JSON.parse(campaign.config) as CampaignConfig) : null;
  } catch {
    config = null;
  }

  return renderOgCard({
    palette: ogPaletteFor(campaign?.templateId ?? "", config),
    content: {
      brand: clampWords(config?.brand?.name ?? "", 40),
      eyebrow: clampWords(config?.hero?.eyebrow ?? "", 70),
      headline: visualLines(config?.hero?.headline || campaign?.name || "וובינר", 30),
      accentLine: visualLines(config?.hero?.headlineAccent ?? "", 30),
      dateLabel: clampWords(config?.webinar?.dateLabel ?? "", 80),
      cta: clampWords(config?.hero?.ctaText ?? "", 34),
    },
    fonts: await loadFonts(),
  });
}
