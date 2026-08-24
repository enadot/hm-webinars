import { cache } from "react";
import { unstable_cache } from "next/cache";
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

/**
 * Neon bills compute time, and its compute stays awake for minutes after each
 * query — so what costs money is how *often* the database is touched, not how
 * many rows come back. Reading a campaign on every page view kept the compute
 * permanently awake for content that changes a few times a week.
 *
 * Public reads therefore go through Next's data cache. Entries are invalidated
 * on demand when the admin saves (revalidateCampaigns below), so edits still
 * appear immediately; the long revalidate is only a backstop for changes made
 * outside the app, such as a seed migration. Keying on the deployment id also
 * gives every deploy a clean cache.
 */
const CACHE_DAY = 86_400;
const deployKey = process.env.VERCEL_DEPLOYMENT_ID ?? "local";

export const CAMPAIGN_LIST_TAG = "campaigns";
export const campaignTag = (slug: string) => `campaign:${slug}`;

type CampaignRow = {
  slug: string;
  name: string;
  templateId: string;
  config: string;
  published: boolean;
};

function readCampaignCached(slug: string): Promise<CampaignRow | null> {
  return unstable_cache(
    () =>
      prisma.campaign.findUnique({
        where: { slug },
        select: { slug: true, name: true, templateId: true, config: true, published: true },
      }),
    ["public-campaign", deployKey, slug],
    { tags: [CAMPAIGN_LIST_TAG, campaignTag(slug)], revalidate: CACHE_DAY },
  )();
}

function listCampaignsCached(): Promise<CampaignRow[]> {
  return unstable_cache(
    () =>
      prisma.campaign.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: { slug: true, name: true, templateId: true, config: true, published: true },
      }),
    ["public-campaign-list", deployKey],
    { tags: [CAMPAIGN_LIST_TAG], revalidate: CACHE_DAY },
  )();
}

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
    const campaign = await readCampaignCached(slug);
    if (!campaign) return null;
    return { ...campaign, fromFallback: false };
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
    const campaigns = await listCampaignsCached();
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

/**
 * Drops the cached public reads after an admin write, so an edit is live on the
 * next request instead of waiting out the backstop revalidate.
 */
export async function revalidateCampaigns(...slugs: (string | null | undefined)[]): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  // expire: 0 — an admin edit must be visible on the very next request, never
  // served stale-while-revalidate.
  const now = { expire: 0 };
  revalidateTag(CAMPAIGN_LIST_TAG, now);
  for (const slug of new Set(slugs.filter((s): s is string => !!s))) {
    revalidateTag(campaignTag(slug), now);
  }
}
