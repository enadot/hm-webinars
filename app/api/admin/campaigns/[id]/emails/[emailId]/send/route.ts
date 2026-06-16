import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { getSendmsgConfig, getSendmsgDefaultSender } from "@/lib/app-settings";
import {
  dispatchMessageToList,
  SendmsgError,
  type SendmsgMessage,
} from "@/lib/sendmsg";
import { ensureCampaignList } from "@/lib/sendmsg-campaign";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

/**
 * POST /api/admin/campaigns/[id]/emails/[emailId]/send
 *
 * Dispatches the template via שלח מסר. If the template has scheduledAt set,
 * sends scheduled; otherwise immediate.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; emailId: string }> },
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, emailId } = await params;

  const email = await prisma.emailTemplate.findFirst({
    where: { id: emailId, campaignId: id },
  });
  if (!email) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (email.status === "sent") {
    return NextResponse.json(
      { ok: false, error: "Already sent" },
      { status: 400 },
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true, slug: true, name: true, config: true },
  });
  if (!campaign) {
    return NextResponse.json({ ok: false, error: "Campaign not found" }, { status: 404 });
  }

  const creds = await getSendmsgConfig();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "שלח מסר אינו מוגדר. עברו ל/admin/settings." },
      { status: 400 },
    );
  }

  const listId = await ensureCampaignList(creds, campaign);
  if (!listId) {
    return NextResponse.json(
      { ok: false, error: "לא ניתן להבטיח רשימת תפוצה (בדקו את הלוגים בעורך השלנו)." },
      { status: 502 },
    );
  }

  // Sender: prefer per-template override, fall back to the global default.
  // Without a sender at all, sendmsg returns a server-side NRE
  // ("Object reference not set"), so we refuse with a clear error first.
  const sender = await getSendmsgDefaultSender();
  const senderEmail = (email.senderEmail || sender.email || "").trim();
  const senderName = (email.senderName || sender.name || campaign.name || "").trim();
  if (!senderEmail) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "אימייל שולח לא הוגדר. הזינו אחד בתבנית, או הגדירו שולח ברירת מחדל ב-/admin/settings.",
      },
      { status: 400 },
    );
  }

  // ASCII-only InnerName (Hebrew in this internal label has caused parsing
  // failures in the sendmsg dashboard — slug only).
  const innerName = `${campaign.slug}-${email.id.slice(0, 6)}`;

  const message: SendmsgMessage = {
    subject: email.subject,
    content: email.html,
    innerName,
    senderEmail,
    senderName,
    direction: 1, // RTL (Hebrew)
  };

  try {
    const { messageId } = await dispatchMessageToList(creds, listId, message, {
      scheduledAtLocal: email.scheduledAt ?? undefined,
    });
    const scheduled = !!email.scheduledAt;
    const updated = await prisma.emailTemplate.update({
      where: { id: emailId },
      data: {
        status: scheduled ? "scheduled" : "sent",
        sentAt: scheduled ? null : new Date(),
        sendmsgMessageId: messageId ?? null,
        errorMessage: null,
      },
    });
    return NextResponse.json({ ok: true, email: updated });
  } catch (e) {
    const msg = e instanceof SendmsgError ? `${e.message} ${JSON.stringify(e.body ?? "")}` : String(e);
    await prisma.emailTemplate.update({
      where: { id: emailId },
      data: { status: "failed", errorMessage: msg.slice(0, 1000) },
    });
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
