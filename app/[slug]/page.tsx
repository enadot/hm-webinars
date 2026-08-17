import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTemplate } from "@/lib/templates";
import { safeParseConfig } from "@/lib/campaign-schema";
import type { Metadata } from "next";
import { PublicCampaign } from "./_public-campaign";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) return {};

  let cfg: Record<string, any> | null = null;
  try {
    cfg = JSON.parse(campaign.config);
  } catch {
    // Fall through to the campaign name below.
  }

  const title = cfg?.meta?.title || campaign.name;
  const description = cfg?.meta?.description || undefined;
  const siteName = cfg?.brand?.name || undefined;

  // Spell out openGraph and twitter explicitly: Next merges metadata per-field,
  // so a parent openGraph block would otherwise survive and advertise the wrong
  // campaign on every share card.
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "website",
      locale: "he_IL",
      url: `/${slug}`,
      title,
      description,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign || !campaign.published) notFound();

  const template = getTemplate(campaign.templateId);
  if (!template) notFound();

  const parsed = safeParseConfig(JSON.parse(campaign.config));
  if (!parsed.ok) {
    return (
      <div className="p-10 text-center text-destructive">
        קונפיגורציה לא תקינה לקמפיין: {parsed.error}
      </div>
    );
  }

  return <PublicCampaign templateId={campaign.templateId} config={parsed.data} slug={slug} />;
}
