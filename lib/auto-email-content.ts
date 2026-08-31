import type { CampaignConfig } from "@/lib/campaign-schema";

/**
 * Pure content for the automatic emails: no database, no transport, no
 * `server-only` imports — so it can be exercised directly in a script.
 */

export type AutoKind = "reminder_24h" | "reminder_1h";

export const REMINDERS: { kind: AutoKind; hoursBefore: number; label: string }[] = [
  { kind: "reminder_24h", hoursBefore: 24, label: "תזכורת — 24 שעות לפני" },
  { kind: "reminder_1h", hoursBefore: 1, label: "תזכורת — שעה לפני" },
];

export type CampaignRow = {
  id: string;
  slug: string;
  name: string;
  config: string;
  webinarJoinUrl: string | null;
};

export function parseConfig(campaign: { config: string }): CampaignConfig | null {
  try {
    return JSON.parse(campaign.config) as CampaignConfig;
  } catch {
    return null;
  }
}

/** Format an instant as the literal Asia/Jerusalem "YYYY-MM-DDTHH:mm" the
 *  EmailTemplate.scheduledAt column and sendmsg's PostponeSendTime expect. */
export function israelLocalLiteral(d: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jerusalem",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Shared RTL shell. Inline styles only — mail clients strip <style> blocks. */
function shell(opts: { title: string; body: string; brandName: string }): string {
  return `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f4f6f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
<tr><td style="background:#162321;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold;">${esc(opts.brandName)}</td></tr>
<tr><td style="padding:28px;color:#1c2b28;font-size:16px;line-height:1.7;" dir="rtl">${opts.body}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function button(href: string, text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr><td style="background:#74DF93;border-radius:999px;">
<a href="${esc(href)}" style="display:inline-block;padding:13px 26px;color:#162321;font-weight:bold;font-size:16px;text-decoration:none;">${esc(text)}</a>
</td></tr></table>`;
}

function whenLine(cfg: CampaignConfig | null): string {
  const w = cfg?.webinar;
  if (!w) return "";
  const bits = [w.dateLabel || [w.dayShort, w.dateShort].filter(Boolean).join(" "), w.time, w.venue]
    .map((b) => (b || "").trim())
    .filter(Boolean);
  return bits.length ? `<p style="margin:0 0 6px;"><b>מתי:</b> ${esc(bits.join(" · "))}</p>` : "";
}

// ---------- Confirmation (Resend, per registrant) ----------

export function buildConfirmationEmail(
  campaign: CampaignRow,
  cfg: CampaignConfig | null,
  lead: { name: string },
): { subject: string; html: string } {
  const title = cfg?.meta?.title || campaign.name;
  const brandName = cfg?.brand?.name || campaign.name;
  const firstName = lead.name.split(" ")[0] || "";
  const join = (campaign.webinarJoinUrl || "").trim();

  const body = `
<p style="margin:0 0 14px;font-size:20px;font-weight:bold;">${esc(firstName ? `${firstName}, המקום שלך נשמר 🎉` : "המקום שלך נשמר 🎉")}</p>
<p style="margin:0 0 16px;">${esc(title)}</p>
${whenLine(cfg)}
${
  join
    ? `<p style="margin:14px 0 0;">אפשר להיכנס דרך הקישור הזה כשמתחילים:</p>${button(join, "כניסה לוובינר")}
<p style="margin:0;font-size:13px;color:#5c6b67;">שמרו את המייל — זה הקישור שלכם. נשלח גם תזכורת לפני שמתחילים.</p>`
    : `<p style="margin:14px 0 0;">נשלח לכם את הקישור להשתתפות במייל נפרד לפני המפגש, יחד עם תזכורת.</p>`
}`;

  return { subject: `נרשמתם בהצלחה: ${title}`, html: shell({ title, body, brandName }) };
}

export function buildReminderEmail(
  kind: AutoKind,
  campaign: CampaignRow,
  cfg: CampaignConfig | null,
  joinUrl: string,
): { subject: string; html: string } {
  const title = cfg?.meta?.title || campaign.name;
  const brandName = cfg?.brand?.name || campaign.name;
  const soon = kind === "reminder_1h";

  const body = `
<p style="margin:0 0 14px;font-size:20px;font-weight:bold;">${soon ? "מתחילים בעוד שעה" : "מזכירים — מחר אנחנו נפגשים"}</p>
<p style="margin:0 0 16px;">${esc(title)}</p>
${whenLine(cfg)}
<p style="margin:14px 0 0;">${soon ? "אפשר להיכנס כבר עכשיו:" : "שמרו את הקישור — זו הכניסה שלכם:"}</p>
${button(joinUrl, "כניסה לוובינר")}
<p style="margin:0;font-size:13px;color:#5c6b67;">נתקלתם בבעיה בכניסה? פשוט השיבו למייל הזה.</p>`;

  return {
    subject: soon ? `מתחילים בעוד שעה: ${title}` : `תזכורת: ${title} מתחיל מחר`,
    html: shell({ title, body, brandName }),
  };
}

