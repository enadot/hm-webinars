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
  try {
    const cfg = JSON.parse(campaign.config);
    return {
      title: cfg?.meta?.title ?? campaign.name,
      description: cfg?.meta?.description,
    };
  } catch {
    return { title: campaign.name };
  }
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
