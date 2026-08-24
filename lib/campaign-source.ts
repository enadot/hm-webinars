import { cache } from "react";
import { prisma, isConnectionError } from "@/lib/db";
import fallbackCampaigns from "@/lib/campaign-fallback.generated.json";

/**
 * The subset of a Campaign the public pages read. The admin never renders from
 * here, so leads/emails and the webhook URL are deliberately out of scope.
 */
export type PublicCampaign = {
  slug: string;
  name: string;
  templateId: string;
  config: string;
  published: boolean;
  /** True when this came from the in-repo snapshot because the DB was down. */
  fromFallback: boolean;
};

type FallbackRow = { id: string; slug: string; name: string; templateId: string; config: string };
const FALLBACK = fallbackCampaigns as Record<string, FallbackRow>;

function fallbackFor(slug: string): PublicCampaign | null {
  const row = FALLBACK[slug];
  return row ? { ...row, published: true, fromFallback: true } : null;
}

/**
 * Reads a campaign for a public page.
 *
 * The database (Neon) can be unreachable — its serverless compute suspends when
 * idle and can be disabled outright when the plan's limits are hit. lib/db.ts
 * already retries those failures, but once the retries are exhausted the page
 * used to throw and every visitor got Next's "a server error occurred" screen.
 *
 * Campaigns seeded from a migration are also committed to the repo
 * (lib/campaign-fallback.generated.json), so a landing page can still be served
 * from that snapshot rather than lost. This is an emergency path only: a
 * reachable database always wins, so admin edits are never shadowed by it.
 *
 * Wrapped in React's cache() so generateMetadata and the page itself share one
 * query per request instead of hitting the database twice.
 */
export const getPublicCampaign = cache(async (slug: string): Promise<PublicCampaign | null> => {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { slug } });
    if (!campaign) return null;
    return {
      slug: campaign.slug,
      name: campaign.name,
      templateId: campaign.templateId,
      config: campaign.config,
      published: campaign.published,
      fromFallback: false,
    };
  } catch (e) {
    if (!isConnectionError(e)) throw e;
    const snapshot = fallbackFor(slug);
    console.error(
      `[campaign] database unreachable for "${slug}" — ` +
        (snapshot ? "serving the in-repo snapshot" : "no snapshot available"),
      e,
    );
    if (!snapshot) throw e;
    return snapshot;
  }
});

/** Published campaigns for the index page, with the same fallback behaviour. */
export async function listPublicCampaigns(): Promise<PublicCampaign[]> {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { slug: true, name: true, templateId: true, config: true, published: true },
    });
    return campaigns.map((c) => ({ ...c, fromFallback: false }));
  } catch (e) {
    if (!isConnectionError(e)) throw e;
    console.error("[campaign] database unreachable — listing the in-repo snapshot", e);
    return Object.values(FALLBACK).map((row) => ({ ...row, published: true, fromFallback: true }));
  }
}

/** The in-repo snapshot for a slug, or null when that campaign was never seeded. */
export function getFallbackCampaign(slug: string): FallbackRow | null {
  return FALLBACK[slug] ?? null;
}
