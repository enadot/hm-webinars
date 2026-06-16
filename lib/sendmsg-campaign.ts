import "server-only";

import { prisma } from "@/lib/db";
import { safeParseConfig, type CampaignConfig } from "@/lib/campaign-schema";
import {
  createMailingList,
  SendmsgError,
  type SendmsgCreds,
} from "@/lib/sendmsg";

export type CampaignForList = {
  id: string;
  slug: string;
  name: string;
  config: string;
};

/**
 * Returns the cached sendmsg list ID for this campaign, creating the list if
 * it doesn't exist yet (and persisting the new ID back to the campaign's
 * config JSON). Returns null on failure or when the campaign has opted out.
 */
export async function ensureCampaignList(
  creds: SendmsgCreds,
  campaign: CampaignForList,
): Promise<number | null> {
  const parsed = safeParseConfig(JSON.parse(campaign.config));
  if (!parsed.ok) {
    console.error("[sendmsg-campaign] invalid config:", parsed.error);
    return null;
  }
  const cfg = parsed.data;
  const sm = cfg.integrations?.sendmsg;
  if (sm && sm.enabled === false) return null;
  if (sm?.listId) return sm.listId;

  const listName = (sm?.listName || "").trim() || campaign.name || campaign.slug;
  let listId: number;
  try {
    listId = await createMailingList(creds, listName, `Auto-created from /${campaign.slug}`);
  } catch (e) {
    logSendmsg("createMailingList", e);
    return null;
  }

  const nextConfig: CampaignConfig = {
    ...cfg,
    integrations: {
      ...(cfg.integrations ?? { sendmsg: { enabled: true, listName: "" } }),
      sendmsg: {
        ...(cfg.integrations?.sendmsg ?? { enabled: true, listName: "" }),
        listId,
      },
    },
  };
  try {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { config: JSON.stringify(nextConfig) },
    });
  } catch (e) {
    console.error("[sendmsg-campaign] failed to cache listId:", e);
  }

  return listId;
}

export function logSendmsg(op: string, e: unknown): void {
  if (e instanceof SendmsgError) {
    console.error(`[sendmsg] ${op} failed (${e.status ?? "?"}):`, e.message, e.body);
  } else {
    console.error(`[sendmsg] ${op} failed:`, e);
  }
}
