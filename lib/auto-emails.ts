import { prisma } from "@/lib/db";
import { getSendmsgDefaultSender } from "@/lib/app-settings";
import {
  cancelScheduledEmail,
  getResendApiKey,
  getResendFrom,
  sendTransactionalEmail,
} from "@/lib/resend";
import type { CampaignConfig } from "@/lib/campaign-schema";
import {
  type AutoKind,
  type CampaignRow,
  buildConfirmationEmail,
  buildReminderEmail,
  israelLocalLiteral,
  parseConfig,
  REMINDERS,
} from "@/lib/auto-email-content";

export type { AutoKind } from "@/lib/auto-email-content";
export { israelLocalLiteral, buildConfirmationEmail, buildReminderEmail } from "@/lib/auto-email-content";


/**
 * The From address. RESEND_FROM wins; the שלח מסר default sender is the
 * fallback, and it lives in the database — so this must tolerate the database
 * being unreachable, or a confirmation would be lost to an unrelated outage.
 */
async function senderAddress(): Promise<string | null> {
  let sender: { email: string | null; name: string | null } | null = null;
  try {
    sender = await getSendmsgDefaultSender();
  } catch {
    // Fall back to RESEND_FROM alone.
  }
  return getResendFrom(sender?.name ?? undefined, sender?.email ?? undefined);
}

/**
 * Confirmation mail for one registrant. Never throws — a mail problem must not
 * turn a successful registration into an error for the visitor.
 */
export async function sendConfirmationEmail(
  campaign: CampaignRow,
  lead: { name: string; email: string },
): Promise<void> {
  const apiKey = getResendApiKey();
  if (!apiKey) return; // transactional mail not configured

  const from = await senderAddress();
  if (!from) {
    console.warn("[auto-emails] no RESEND_FROM and no default sender — skipping confirmation");
    return;
  }

  try {
    const cfg = parseConfig(campaign);
    const { subject, html } = buildConfirmationEmail(campaign, cfg, lead);
    const { id } = await sendTransactionalEmail(apiKey, {
      to: lead.email,
      from,
      subject,
      html,
    });
    console.log(`[auto-emails] confirmation sent to ${lead.email} (resend id ${id ?? "?"})`);
  } catch (e) {
    console.error("[auto-emails] confirmation failed:", e);
  }
}

// ---------- Reminders (Resend, scheduled per registrant) ----------

/**
 * Reminders are scheduled the moment someone registers, one Resend delivery
 * per person with `scheduledAt`.
 *
 * The earlier design queued a broadcast to the שלח מסר list instead. Handing
 * each registrant their own scheduled mail is better in three ways: someone
 * who signs up an hour before the webinar still gets the one-hour reminder,
 * nothing depends on שלח מסר credentials, and Resend can cancel a scheduled
 * mail — so moving the webinar no longer leaves a reminder that cannot be
 * recalled.
 *
 * They only ever go out once a join link exists, as the client asked: a
 * reminder whose whole job is to hand over the link is worse than none.
 */

/** A reminder must be far enough out that scheduling it still means something. */
const MIN_LEAD_MINUTES = 5;

function reminderTimes(startsAt: Date): { kind: AutoKind; at: Date }[] {
  const cutoff = Date.now() + MIN_LEAD_MINUTES * 60 * 1000;
  return REMINDERS.map(({ kind, hoursBefore }) => ({
    kind,
    at: new Date(startsAt.getTime() - hoursBefore * 60 * 60 * 1000),
  })).filter((r) => r.at.getTime() > cutoff);
}

/** The webinar's start, or null when it is unset, unparseable or already past. */
function upcomingStart(cfg: CampaignConfig | null): Date | null {
  const startsAt = new Date(cfg?.webinar?.dateISO || "");
  if (Number.isNaN(startsAt.getTime())) return null;
  return startsAt.getTime() > Date.now() ? startsAt : null;
}

/**
 * Schedules this registrant's reminders. Returns the Resend ids, or an empty
 * array when there is nothing to schedule — no join link, no future date, or
 * transactional mail unconfigured. Never throws.
 */
export async function scheduleRemindersForLead(
  campaign: CampaignRow,
  lead: { email: string },
): Promise<string[]> {
  const apiKey = getResendApiKey();
  const joinUrl = (campaign.webinarJoinUrl || "").trim();
  if (!apiKey || !joinUrl) return [];

  const cfg = parseConfig(campaign);
  const startsAt = upcomingStart(cfg);
  if (!startsAt) return [];

  const from = await senderAddress();
  if (!from) return [];

  const ids: string[] = [];
  for (const { kind, at } of reminderTimes(startsAt)) {
    try {
      const { subject, html } = buildReminderEmail(kind, campaign, cfg, joinUrl);
      const { id } = await sendTransactionalEmail(apiKey, {
        to: lead.email,
        from,
        subject,
        html,
        scheduledAt: at.toISOString(),
      });
      if (id) ids.push(id);
      console.log(`[auto-emails] ${kind} queued for ${lead.email} at ${at.toISOString()}`);
    } catch (e) {
      console.error(`[auto-emails] could not schedule ${kind} for ${lead.email}:`, e);
    }
  }
  return ids;
}

/** Schedules a lead's reminders and records the ids against them. */
export async function scheduleAndStoreReminders(
  campaign: CampaignRow,
  lead: { id: string; email: string },
): Promise<void> {
  const ids = await scheduleRemindersForLead(campaign, lead);
  if (ids.length === 0) return;
  try {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { reminderEmailIds: JSON.stringify(ids) },
    });
  } catch (e) {
    // The mail is already queued; losing the ids only costs us cancellation.
    console.error("[auto-emails] could not store reminder ids:", e);
  }
}

export type ReminderSyncResult = {
  scheduled: number;
  alreadyScheduled: number;
  note?: string;
};

/**
 * Backfills reminders for people who registered before the join link existed,
 * and is safe to call on every admin save.
 *
 * Leads that already carry reminder ids are left alone, so re-saving a
 * campaign never queues a second copy. When the link is removed, any reminder
 * still pending is cancelled at Resend rather than left to arrive.
 */
export async function syncAutoReminders(campaignId: string): Promise<ReminderSyncResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) return { scheduled: 0, alreadyScheduled: 0, note: "Resend לא מוגדר — לא נקבעו תזכורות" };

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, slug: true, name: true, config: true, webinarJoinUrl: true },
  });
  if (!campaign) return { scheduled: 0, alreadyScheduled: 0, note: "campaign not found" };

  const joinUrl = (campaign.webinarJoinUrl || "").trim();
  const leads = await prisma.lead.findMany({
    where: { campaignId },
    select: { id: true, email: true, reminderEmailIds: true },
  });

  if (!joinUrl) {
    let cancelled = 0;
    for (const lead of leads.filter((l) => l.reminderEmailIds)) {
      for (const id of safeIds(lead.reminderEmailIds)) {
        if (await cancelScheduledEmail(apiKey, id)) cancelled++;
      }
      await prisma.lead.update({ where: { id: lead.id }, data: { reminderEmailIds: null } });
    }
    return {
      scheduled: 0,
      alreadyScheduled: 0,
      note: cancelled
        ? `אין קישור לוובינר — ${cancelled} תזכורות ממתינות בוטלו`
        : "אין קישור לוובינר — לא נקבעו תזכורות אוטומטיות",
    };
  }

  if (!upcomingStart(parseConfig(campaign))) {
    return { scheduled: 0, alreadyScheduled: 0, note: "אין תאריך עתידי לוובינר — לא נקבעו תזכורות" };
  }

  let scheduled = 0;
  let alreadyScheduled = 0;
  for (const lead of leads) {
    if (lead.reminderEmailIds) {
      alreadyScheduled++;
      continue;
    }
    const before = scheduled;
    await scheduleAndStoreReminders(campaign, lead);
    const updated = await prisma.lead.findUnique({
      where: { id: lead.id },
      select: { reminderEmailIds: true },
    });
    if (updated?.reminderEmailIds) scheduled++;
    if (scheduled === before && !updated?.reminderEmailIds) {
      // Nothing queued for this lead (all reminder times already passed).
    }
  }
  return { scheduled, alreadyScheduled };
}

function safeIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}
