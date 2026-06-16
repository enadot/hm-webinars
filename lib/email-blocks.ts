// ספריית בלוקים + משתני personalization לעורך המייל.
//
// כל ה-HTML כאן email-safe (table-based, inline styles, RTL) ומתיישר עם
// הסגנון של defaultSkeleton ב-_emails-client.tsx (Arial, #0B1437, #F5B500).
//
// Phase A — PERSONALIZATION_VARS: placeholders של שלח מסר ("system fields").
//   sendmsg מחליף את [|[FirstName]|] וכו' בצד שלהם בעת השליחה לרשימה, אז
//   מבחינתנו זו פשוט הזרקת טקסט ל-cursor — אין שינוי ב-pipeline השליחה.
// Phase B — BLOCKS / TEMPLATES: HTML מוכן להזרקה / החלפת כל המסמך.

export type PersonalizationVar = {
  /** תווית בעברית לכפתור */
  label: string;
  /** ה-token שמוזרק לתוך ה-HTML */
  token: string;
  /** הסבר קצר (tooltip) */
  hint?: string;
};

/**
 * השדות הסטנדרטיים של שלח מסר. FirstName/LastName מתועדים רשמית; EmailAddress
 * ו-Cellphone תואמים לשמות השדות שאנחנו שולחים ב-addUserToList (lib/sendmsg.ts).
 * אם sendmsg לא מחליף אחד מהם — אפשר לאמת מול שם השדה דרך "בדיקת סנכרון".
 */
export const PERSONALIZATION_VARS: PersonalizationVar[] = [
  { label: "שם פרטי", token: "[|[FirstName]|]", hint: "שם פרטי של הנמען" },
  { label: "שם משפחה", token: "[|[LastName]|]", hint: "שם משפחה של הנמען" },
  { label: "אימייל", token: "[|[EmailAddress]|]", hint: "כתובת המייל של הנמען" },
  { label: "טלפון", token: "[|[Cellphone]|]", hint: "טלפון הנמען (אם קיים)" },
];

// ---------------------------------------------------------------------------
// Phase B — בלוקי תוכן להזרקה ל-cursor
// ---------------------------------------------------------------------------

export type EmailBlock = {
  key: string;
  /** תווית בעברית לכפתור */
  label: string;
  /** שם אייקון מ-lucide-react (ממופה בצד ה-client) */
  icon: string;
  /** מחזיר HTML snippet להזרקה */
  html: () => string;
};

export const BLOCKS: EmailBlock[] = [
  {
    key: "hero",
    label: "כותרת ראשית",
    icon: "Heading",
    html: () => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px">
  <tr><td>
    <h1 style="font-size:26px;font-weight:800;margin:0 0 8px;color:#0B1437">כותרת ראשית</h1>
    <p style="font-size:16px;line-height:1.6;margin:0;color:#1f2937">תיאור קצר שמסביר על מה המייל הזה.</p>
  </td></tr>
</table>
`,
  },
  {
    key: "text",
    label: "פסקה",
    icon: "Type",
    html: () => `<p style="font-size:16px;line-height:1.6;margin:0 0 16px;color:#1f2937">פסקת טקסט. החליפו אותי בתוכן שלכם.</p>
`,
  },
  {
    key: "image",
    label: "תמונה",
    icon: "Image",
    html: () => `<img src="https://placehold.co/560x240" alt="תיאור התמונה" style="display:block;width:100%;max-width:100%;height:auto;border-radius:10px;margin:0 0 16px" />
`,
  },
  {
    key: "button",
    label: "כפתור CTA",
    icon: "MousePointerClick",
    html: () => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px">
  <tr><td style="border-radius:10px;background:#F5B500">
    <a href="https://example.com" style="display:inline-block;padding:13px 26px;font-size:16px;font-weight:800;color:#0B1437;text-decoration:none">לחצו כאן</a>
  </td></tr>
</table>
`,
  },
  {
    key: "list",
    label: "רשימת בולטים",
    icon: "List",
    html: () => `<ul style="font-size:16px;line-height:1.9;margin:0 0 16px;padding:0 20px 0 0;color:#1f2937">
  <li>נקודה ראשונה</li>
  <li>נקודה שנייה</li>
  <li>נקודה שלישית</li>
</ul>
`,
  },
  {
    key: "spacer",
    label: "חוצץ",
    icon: "Minus",
    html: () => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:24px;line-height:24px;font-size:0">&nbsp;</td></tr></table>
`,
  },
  {
    key: "signature",
    label: "חתימה",
    icon: "PenLine",
    html: () => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;border-top:1px solid #e5e7eb">
  <tr><td style="padding:16px 0 0">
    <p style="font-size:14px;line-height:1.6;margin:0;color:#6b7280">בברכה,<br /><strong style="color:#0B1437">הצוות</strong></p>
  </td></tr>
</table>
`,
  },
];

// ---------------------------------------------------------------------------
// Phase B — תבניות פתיחה (מחליפות את כל המסמך)
// ---------------------------------------------------------------------------

export type TemplateArgs = { campaignName: string; campaignSlug: string };

export type EmailTemplateDef = {
  key: string;
  label: string;
  html: (args: TemplateArgs) => string;
};

const SITE = "https://hm-webinars.vercel.app";

function escapeText(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
function escapeAttr(s: string): string {
  return s.replace(/["&]/g, (c) => ({ '"': "&quot;", "&": "&amp;" }[c]!));
}

/** עוטף תוכן פנימי במעטפת מסמך RTL סטנדרטית (card על רקע אפור). */
function shell(inner: string, footer: string, opts?: { bg?: string }): string {
  const bg = opts?.bg ?? "#f5f7fb";
  return `<!doctype html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bg};font-family:Arial,Helvetica,sans-serif;direction:rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="padding:32px">
${inner}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#0B1437;color:#cbd5e1;text-align:center;font-size:13px">
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export const TEMPLATES: EmailTemplateDef[] = [
  {
    key: "hero",
    label: "Hero ממוקד",
    html: ({ campaignName, campaignSlug }) =>
      shell(
        `          <h1 style="font-size:26px;font-weight:800;margin:0 0 16px;color:#0B1437">היי [|[FirstName]|]</h1>
          <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#1f2937">תוכן המייל כאן…</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px">
            <tr><td style="border-radius:10px;background:#F5B500">
              <a href="${SITE}/${escapeAttr(campaignSlug)}" style="display:inline-block;padding:13px 26px;font-size:16px;font-weight:800;color:#0B1437;text-decoration:none">לעמוד הוובינר</a>
            </td></tr>
          </table>`,
        escapeText(campaignName),
      ),
  },
  {
    key: "newsletter",
    label: "ניוזלטר",
    html: ({ campaignName, campaignSlug }) =>
      shell(
        `          <h1 style="font-size:24px;font-weight:800;margin:0 0 8px;color:#0B1437">שלום [|[FirstName]|],</h1>
          <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#1f2937">הנה העדכונים האחרונים שלנו.</p>

          <h2 style="font-size:18px;font-weight:800;margin:0 0 8px;color:#0B1437">כותרת סעיף ראשון</h2>
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px;color:#1f2937">תוכן הסעיף הראשון.</p>

          <h2 style="font-size:18px;font-weight:800;margin:0 0 8px;color:#0B1437">כותרת סעיף שני</h2>
          <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#1f2937">תוכן הסעיף השני.</p>

          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td style="border-radius:10px;background:#F5B500">
              <a href="${SITE}/${escapeAttr(campaignSlug)}" style="display:inline-block;padding:13px 26px;font-size:16px;font-weight:800;color:#0B1437;text-decoration:none">קראו עוד</a>
            </td></tr>
          </table>`,
        escapeText(campaignName),
      ),
  },
  {
    key: "promo",
    label: "מבצע",
    html: ({ campaignName, campaignSlug }) =>
      shell(
        `          <p style="font-size:14px;font-weight:800;letter-spacing:1px;margin:0 0 8px;color:#F5B500;text-transform:uppercase">מבצע מיוחד</p>
          <h1 style="font-size:30px;font-weight:800;margin:0 0 12px;color:#0B1437;line-height:1.2">היי [|[FirstName]|], הזדמנות אחרונה!</h1>
          <p style="font-size:17px;line-height:1.6;margin:0 0 24px;color:#1f2937">אל תפספסו — ההצעה בתוקף לזמן מוגבל.</p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td style="border-radius:12px;background:#0B1437">
              <a href="${SITE}/${escapeAttr(campaignSlug)}" style="display:inline-block;padding:15px 32px;font-size:17px;font-weight:800;color:#ffffff;text-decoration:none">אני רוצה להירשם</a>
            </td></tr>
          </table>`,
        escapeText(campaignName),
      ),
  },
  {
    key: "plain",
    label: "טקסט פשוט",
    html: ({ campaignName, campaignSlug }) =>
      `<!doctype html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;direction:rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
        <tr><td style="padding:8px">
          <p style="font-size:16px;line-height:1.7;margin:0 0 16px;color:#1f2937">היי [|[FirstName]|],</p>
          <p style="font-size:16px;line-height:1.7;margin:0 0 16px;color:#1f2937">תוכן המייל כאן…</p>
          <p style="font-size:16px;line-height:1.7;margin:0 0 16px;color:#1f2937">
            פרטים נוספים בעמוד הוובינר:<br />
            <a href="${SITE}/${escapeAttr(campaignSlug)}" style="color:#0B1437;font-weight:700">${SITE}/${escapeText(campaignSlug)}</a>
          </p>
          <p style="font-size:16px;line-height:1.7;margin:24px 0 0;color:#6b7280">בברכה,<br />${escapeText(campaignName)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
];

/**
 * עוטף placeholders של שלח מסר בהדגשה צהובה — לשימוש בתצוגה המקדימה בלבד
 * (לא נשמר / לא נשלח). מיועד ל-placeholders שמופיעים בתוכן טקסטואלי.
 */
export function highlightPlaceholders(src: string): string {
  return src.replace(
    /\[\|\[(.+?)\]\|\]/g,
    (m) => `<span style="background:#fde68a;border-radius:3px;padding:0 2px">${m}</span>`,
  );
}
