import { prisma } from "@/lib/db";
import { getSendmsgConfig, getSendmsgDefaultSender } from "@/lib/app-settings";
import { dispatchMessageToList } from "@/lib/sendmsg";
import { ensureCampaignList, logSendmsg } from "@/lib/sendmsg-campaign";
import { getResendApiKey, getResendFrom, sendTransactionalEmail } from "@/lib/resend";
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

/** A scheduled send must be far enough out that sendmsg can still act on it. */
const MIN_LEAD_MINUTES = 10;

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

  let sender: { email: string | null; name: string | null } | null = null;
  try {
    sender = await getSendmsgDefaultSender();
  } catch {
    // Settings live in the database; fall back to RESEND_FROM alone.
  }
  const from = getResendFrom(sender?.name ?? undefined, sender?.email ?? undefined);
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

// ---------- Reminders (sendmsg, broadcast to the campaign list) ----------

export type ReminderSyncResult = {
  scheduled: AutoKind[];
  skipped: { kind: AutoKind; reason: string }[];
  note?: string;
};

/**
 * Schedules the automatic reminders for a campaign, and is safe to call on
 * every admin save.
 *
 * Reminders only ever go out once a join link exists — a reminder whose whole
 * job is to hand over the link is worse than no reminder at all. The send is a
 * scheduled broadcast to the campaign's שלח מסר list, so registrations that
 * arrive after scheduling are still covered.
 *
 * Each reminder is dispatched once. sendmsg has no recall endpoint here, so if
 * the date or link changes after a reminder was handed over, this records the
 * conflict instead of quietly queueing a second copy of it.
 */
export async function syncAutoReminders(campaignId: string): Promise<ReminderSyncResult> {
  const result: ReminderSyncResult = { scheduled: [], skipped: [] };

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, slug: true, name: true, config: true, webinarJoinUrl: true },
  });
  if (!campaign) return { ...result, note: "campaign not found" };

  const joinUrl = (campaign.webinarJoinUrl || "").trim();
  if (!joinUrl) {
    // Nothing has been handed to sendmsg yet for un-dispatched reminders, so
    // clear them; anything already dispatched is left alone and reported.
    const removed = await prisma.emailTemplate.deleteMany({
      where: { campaignId, autoKind: { not: null }, status: { in: ["draft", "failed"] } },
    });
    return {
      ...result,
      note:
        removed.count > 0
          ? "אין קישור לוובינר — התזכורות האוטומטיות הוסרו"
          : "אין קישור לוובינר — לא נקבעו תזכורות אוטומטיות",
    };
  }

  const cfg = parseConfig(campaign);
  const startsAt = new Date(cfg?.webinar?.dateISO || "");
  if (Number.isNaN(startsAt.getTime())) {
    return { ...result, note: "לא הוגדר תאריך לוובינר — לא נקבעו תזכורות" };
  }

  const creds = await getSendmsgConfig();
  if (!creds) return { ...result, note: "שלח מסר לא מוגדר — לא נקבעו תזכורות" };

  const sender = await getSendmsgDefaultSender();
  const now = Date.now();

  for (const { kind, hoursBefore, label } of REMINDERS) {
    const sendAt = new Date(startsAt.getTime() - hoursBefore * 60 * 60 * 1000);
    if (sendAt.getTime() < now + MIN_LEAD_MINUTES * 60 * 1000) {
      result.skipped.push({ kind, reason: "המועד כבר עבר" });
      continue;
    }
    const scheduledAt = israelLocalLiteral(sendAt);
    const existing = await prisma.emailTemplate.findUnique({
      where: { campaignId_autoKind: { campaignId, autoKind: kind } },
    });

    if (existing && (existing.status === "sent" || existing.status === "scheduled")) {
      if (existing.scheduledAt === scheduledAt) {
        result.skipped.push({ kind, reason: "כבר מתוזמנת" });
      } else {
        await prisma.emailTemplate.update({
          where: { id: existing.id },
          data: {
            errorMessage:
              `התזכורת כבר נמסרה לשלח מסר ל-${existing.scheduledAt}, ` +
              `והמועד החדש הוא ${scheduledAt}. אין ביטול דרך ה-API — ` +
              `בטלו את ההודעה בממשק שלח מסר וקבעו מחדש.`,
          },
        });
        result.skipped.push({ kind, reason: "נמסרה כבר במועד אחר — נדרש טיפול ידני" });
      }
      continue;
    }

    const { subject, html } = buildReminderEmail(kind, campaign, cfg, joinUrl);
    const row = await prisma.emailTemplate.upsert({
      where: { campaignId_autoKind: { campaignId, autoKind: kind } },
      create: {
        campaignId,
        autoKind: kind,
        name: label,
        subject,
        html,
        senderEmail: sender?.email || null,
        senderName: sender?.name || null,
        scheduledAt,
        status: "draft",
      },
      update: {
        name: label,
        subject,
        html,
        senderEmail: sender?.email || null,
        senderName: sender?.name || null,
        scheduledAt,
        status: "draft",
        errorMessage: null,
      },
    });

    try {
      const listId = await ensureCampaignList(creds, campaign);
      if (!listId) {
        result.skipped.push({ kind, reason: "לא נוצרה רשימת תפוצה" });
        continue;
      }
      const { messageId } = await dispatchMessageToList(
        creds,
        listId,
        {
          subject,
          content: html,
          innerName: `${campaign.slug} · ${label}`,
          senderEmail: sender?.email ?? undefined,
          senderName: sender?.name ?? undefined,
        },
        { scheduledAtLocal: scheduledAt },
      );
      await prisma.emailTemplate.update({
        where: { id: row.id },
        data: { status: "scheduled", sendmsgMessageId: messageId ?? undefined },
      });
      result.scheduled.push(kind);
    } catch (e) {
      logSendmsg(`schedule ${kind}`, e);
      await prisma.emailTemplate.update({
        where: { id: row.id },
        data: { status: "failed", errorMessage: e instanceof Error ? e.message : String(e) },
      });
      result.skipped.push({ kind, reason: "שגיאה בשליחה לשלח מסר" });
    }
  }

  return result;
}
