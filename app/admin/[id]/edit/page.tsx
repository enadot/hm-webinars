import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { safeParseConfig } from "@/lib/campaign-schema";
import { VisualEditor } from "./_components/visual-editor";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) notFound();

  const parsed = safeParseConfig(JSON.parse(campaign.config));
  if (!parsed.ok) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-destructive mb-2">קונפיגורציה לא תקינה</h1>
        <p className="text-sm text-slate-600 mb-6">{parsed.error}</p>
      </div>
    );
  }

  return (
    <VisualEditor
      campaign={{
        id: campaign.id,
        slug: campaign.slug,
        name: campaign.name,
        templateId: campaign.templateId,
        published: campaign.published,
        leadsWebhookUrl: campaign.leadsWebhookUrl ?? "",
        config: parsed.data,
      }}
    />
  );
}
