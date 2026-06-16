import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { getSendmsgConfig } from "@/lib/app-settings";
import { getMessageStats, SendmsgError } from "@/lib/sendmsg";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

/**
 * GET /api/admin/campaigns/[id]/emails/[emailId]/stats
 * Proxies GET /GetMsgFullStatistics on sendmsg and returns the raw body.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; emailId: string }> },
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, emailId } = await params;
  const email = await prisma.emailTemplate.findFirst({
    where: { id: emailId, campaignId: id },
    select: { sendmsgMessageId: true },
  });
  if (!email) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (!email.sendmsgMessageId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "אין מזהה הודעה ב-sendmsg לתבנית הזו — סטטיסטיקות זמינות רק להודעות שנשלחו עם ID חוזר מהשרת.",
      },
      { status: 400 },
    );
  }

  const creds = await getSendmsgConfig();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "שלח מסר אינו מוגדר." },
      { status: 400 },
    );
  }

  try {
    const stats = await getMessageStats(creds, email.sendmsgMessageId);
    return NextResponse.json({ ok: true, stats });
  } catch (e) {
    const msg =
      e instanceof SendmsgError
        ? `${e.message} ${JSON.stringify(e.body ?? "")}`
        : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
