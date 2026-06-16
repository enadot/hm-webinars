import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { safeParseConfig } from "@/lib/campaign-schema";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

/**
 * POST /api/admin/campaigns/[id]/emails/presets
 *
 * Generates a starter set of webinar reminders for this campaign, scheduled
 * relative to config.webinar.dateISO. The user can edit each one before
 * sending.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true, slug: true, name: true, config: true },
  });
  if (!campaign) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const parsed = safeParseConfig(JSON.parse(campaign.config));
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const { webinar, hero, brand } = parsed.data;
  const baseISO = webinar.dateISO;
  if (!baseISO) {
    return NextResponse.json(
      { ok: false, error: "אין תאריך לוובינר. הגדירו תאריך בעורך לפני יצירת תזכורות." },
      { status: 400 },
    );
  }

  const title = hero.headline || campaign.name;
  const brandName = brand.name || campaign.name;
  const registerUrl = `https://hm-webinars.vercel.app/${campaign.slug}`;
  const dateLabel = webinar.dateLabel || "";
  const timeLabel = webinar.time || "";

  const presets = [
    {
      name: "אישור הרשמה",
      subject: `נרשמתם בהצלחה: ${title}`,
      offsetMinutes: null, // not scheduled (used as welcome — sent manually)
      html: welcomeHtml({ title, dateLabel, timeLabel, brandName, registerUrl }),
    },
    {
      name: "תזכורת — 24 שעות לפני",
      subject: `תזכורת: ${title} מתחיל מחר ב-${timeLabel}`,
      offsetMinutes: -24 * 60,
      html: reminderHtml({
        title, dateLabel, timeLabel, brandName, registerUrl,
        heading: "מתחילים מחר!",
        body: "רק להזכיר — הוובינר שלכם נפתח מחר. הוסיפו ליומן כדי לא לפספס.",
      }),
    },
    {
      name: "תזכורת — שעה לפני",
      subject: `מתחילים בעוד שעה: ${title}`,
      offsetMinutes: -60,
      html: reminderHtml({
        title, dateLabel, timeLabel, brandName, registerUrl,
        heading: "עוד שעה ומתחילים!",
        body: "תבדקו את החיבור לאינטרנט והקליקו על הקישור כשהוובינר מתחיל.",
      }),
    },
    {
      name: "מתחילים עכשיו",
      subject: `אנחנו מתחילים! היכנסו עכשיו: ${title}`,
      offsetMinutes: 0,
      html: reminderHtml({
        title, dateLabel, timeLabel, brandName, registerUrl,
        heading: "אנחנו ממש מתחילים",
        body: "לחצו על הקישור כדי להצטרף.",
      }),
    },
    {
      name: "אחרי הוובינר — תודה",
      subject: `תודה שהשתתפתם: ${title}`,
      offsetMinutes: 24 * 60,
      html: thanksHtml({ title, brandName }),
    },
  ];

  // Skip presets that already exist (by exact name) so re-running doesn't duplicate.
  const existing = await prisma.emailTemplate.findMany({
    where: { campaignId: id },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((e) => e.name));

  const created = [];
  for (const p of presets) {
    if (existingNames.has(p.name)) continue;
    const scheduledAt =
      p.offsetMinutes === null ? null : addMinutesAsIsraelLocal(baseISO, p.offsetMinutes);
    const row = await prisma.emailTemplate.create({
      data: {
        campaignId: id,
        name: p.name,
        subject: p.subject,
        html: p.html,
        scheduledAt,
      },
    });
    created.push(row);
  }

  return NextResponse.json({ ok: true, created });
}

function addMinutesAsIsraelLocal(baseISO: string, minutes: number): string | null {
  const d = new Date(baseISO);
  if (Number.isNaN(d.getTime())) return null;
  d.setMinutes(d.getMinutes() + minutes);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

// ---- Skeleton HTML templates (inline styles for email-client compatibility) ----

function shell(body: string, brandName: string): string {
  return `<!doctype html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><title></title></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;direction:rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,.08);">
        <tr><td style="padding:32px 32px 8px 32px;">
          ${body}
        </td></tr>
        <tr><td style="padding:24px 32px;background:#0B1437;color:#cbd5e1;text-align:center;font-size:13px;">
          ${escapeHtml(brandName)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function welcomeHtml(p: { title: string; dateLabel: string; timeLabel: string; brandName: string; registerUrl: string }) {
  return shell(
    `<h1 style="font-size:24px;font-weight:800;margin:0 0 16px;color:#0B1437">תודה שנרשמתם!</h1>
     <p style="font-size:16px;line-height:1.6;margin:0 0 12px">שמרנו לכם מקום לוובינר <strong>${escapeHtml(p.title)}</strong>.</p>
     <p style="font-size:16px;line-height:1.6;margin:0 0 24px"><strong>מתי:</strong> ${escapeHtml(p.dateLabel)} בשעה ${escapeHtml(p.timeLabel)}</p>
     <a href="${escapeHtml(p.registerUrl)}" style="display:inline-block;background:#F5B500;color:#0B1437;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:10px">לעמוד הוובינר</a>
     <p style="font-size:13px;color:#64748b;margin:32px 0 0">נשלח אליכם כי נרשמתם לוובינר.</p>`,
    p.brandName,
  );
}

function reminderHtml(p: {
  title: string; dateLabel: string; timeLabel: string; brandName: string; registerUrl: string;
  heading: string; body: string;
}) {
  return shell(
    `<h1 style="font-size:24px;font-weight:800;margin:0 0 12px;color:#0B1437">${escapeHtml(p.heading)}</h1>
     <p style="font-size:16px;line-height:1.6;margin:0 0 12px">${escapeHtml(p.body)}</p>
     <p style="font-size:16px;line-height:1.6;margin:0 0 24px"><strong>${escapeHtml(p.title)}</strong><br>${escapeHtml(p.dateLabel)} · ${escapeHtml(p.timeLabel)}</p>
     <a href="${escapeHtml(p.registerUrl)}" style="display:inline-block;background:#F5B500;color:#0B1437;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:10px">להצטרפות</a>`,
    p.brandName,
  );
}

function thanksHtml(p: { title: string; brandName: string }) {
  return shell(
    `<h1 style="font-size:24px;font-weight:800;margin:0 0 16px;color:#0B1437">תודה שהשתתפתם</h1>
     <p style="font-size:16px;line-height:1.6;margin:0 0 12px">הוובינר <strong>${escapeHtml(p.title)}</strong> הסתיים.</p>
     <p style="font-size:16px;line-height:1.6;margin:0 0 12px">[הוסיפו כאן קישור להקלטה / החומרים / הצעת המשך]</p>`,
    p.brandName,
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]!));
}
