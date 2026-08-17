import { prisma } from "@/lib/db";
import { ogPaletteFor } from "@/lib/og-theme";
import { OG_SIZE, clampWords, visualLines, renderOgCard, type OgFont } from "@/lib/og-card";
import type { CampaignConfig } from "@/lib/campaign-schema";

export const alt = "כרטיס שיתוף לדף הוובינר";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Heebo is colocated with this route because satori needs a real TTF/OTF
 * buffer (it cannot read the woff2 files the site itself uses), and a URL built
 * from import.meta.url is the form Next's bundler traces reliably.
 */
async function loadFonts(): Promise<OgFont[]> {
  const [regular, bold] = await Promise.all([
    fetch(new URL("./heebo-regular.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL("./heebo-extrabold.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
  ]);
  return [
    { name: "Heebo", data: regular, weight: 400, style: "normal" },
    { name: "Heebo", data: bold, weight: 800, style: "normal" },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug } });

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
