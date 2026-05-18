"use client";

import { EditProvider } from "@/lib/edit-context";
import { getTemplate } from "@/lib/templates";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function PublicCampaign({
  templateId,
  config,
  slug,
}: {
  templateId: string;
  config: CampaignConfig;
  slug: string;
}) {
  const template = getTemplate(templateId);
  if (!template) return null;
  const Component = template.Component;

  return (
    <EditProvider value={{ enabled: false, config, update: () => {} }}>
      <Component config={config} slug={slug} />
    </EditProvider>
  );
}
