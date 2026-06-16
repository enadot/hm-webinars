# מערכת דיוור — שלח מסר (sendmsg) Integration

מסמך טכני לסיכום האינטגרציה הקיימת מול שלח מסר, gotchas שלמדנו בדרך הקשה,
ו**Roadmap** מסודר לפיצ'רים הבאים (vars מובנים, ספריית קומפוננטות, עורך
ויזואלי).

> בסיס הקוד: lib/sendmsg.ts · lib/sendmsg-campaign.ts · lib/app-settings.ts ·
> app/api/admin/campaigns/[id]/emails/ · app/admin/[id]/emails/

---

## 1. מה כבר עובד

| יכולת | קובץ עיקרי | סטטוס |
|---|---|---|
| הגדרת אישורי חיבור + "שולח ברירת מחדל" | `/admin/settings` ([page.tsx](../app/admin/(panel)/settings/page.tsx)) | ✅ |
| בדיקת חיבור (POST /token) | [api/admin/sendmsg/test](../app/api/admin/sendmsg/test/route.ts) | ✅ |
| יצירת רשימת תפוצה פר קמפיין + cache של listId | [lib/sendmsg-campaign.ts](../lib/sendmsg-campaign.ts) | ✅ |
| סנכרון אוטומטי של ליד מטופס → רשימת תפוצה | [api/leads](../app/api/leads/route.ts) | ✅ |
| ניהול תבניות מייל פר קמפיין (CRUD) | [api/admin/campaigns/[id]/emails](../app/api/admin/campaigns/[id]/emails/) | ✅ |
| שליחה מיידית + תזמון | [emails/[emailId]/send](../app/api/admin/campaigns/[id]/emails/[emailId]/send/route.ts) | ✅ |
| סט תזכורות סטנדרטי לוובינר (preset) | [emails/presets](../app/api/admin/campaigns/[id]/emails/presets/route.ts) | ✅ |
| תיאום סטטוס "מתוזמן → נשלח" כשהזמן עבר | [/admin/[id]/emails](../app/admin/[id]/emails/page.tsx) | ✅ |
| סטטיסטיקות (פתיחות/קליקים/החזרות) | [emails/[emailId]/stats](../app/api/admin/campaigns/[id]/emails/[emailId]/stats/route.ts) | ✅ |
| כלי דיבוג אינטראקטיבי | [sendmsg-debug](../app/api/admin/campaigns/[id]/sendmsg-debug/route.ts) | ✅ |
| משתני personalization בעורך (Phase A) | [_emails-client.tsx](../app/admin/[id]/emails/_emails-client.tsx) + [lib/email-blocks.ts](../lib/email-blocks.ts) | ✅ |
| בלוקי HTML + תבניות פתיחה (Phase B) | [lib/email-blocks.ts](../lib/email-blocks.ts) | ✅ |

---

## 2. ה-API של שלח מסר — תקציר

**Base URL:** `https://gconvertrest.sendmsg.co.il/api/Sendmsg`
**מסמכים פומביים:** https://sendmsgapi.docs.apiary.io (לא מלאים — חלק ניכר
מה-shapes לא מתועד וגילינו ניסיונית).

### 2.1 אימות

זרימה: **siteID + password → token**. אין "API key" יחיד.

```
POST /token
Body: { "siteID": 1687, "password": "..." }
→ { "Token": "uuid-like-string" }
```

הטוקן תקף ל-12 שעות. אצלנו cache in-memory ל-11 שעות
([lib/sendmsg.ts → getToken](../lib/sendmsg.ts)). שולחים בכל קריאה אחרת:

```
Authorization: <token>
Content-Type: application/json
```

> **איך משיגים את הסיסמה?** דרך support@sendmsg / send.help@comstar.co.il —
> זו לא סיסמת ההתחברות לדשבורד, זו "API password" נפרדת.

### 2.2 פורמט תגובה (חשוב)

sendmsg **תמיד** מחזיר HTTP 200. הצלחה/כשלון נקבעת לפי שדה `success`:

```jsonc
// הצלחה
{
  "success": true,
  "res": true,
  "result": { "Pages": null, "ResultID": 231, "ResultMessage": "...", "Tin": "" },
  "data":   { ... payload ספציפי לאנדפוינט ... }
}
```

```jsonc
// כשלון
{
  "success": false,
  "res": false,
  "result": { "ResultMessage": "Passed OK\n1 users were found...\nError Sending Message..." },
  "data":   null
}
```

הקוד שלנו ([postJson ב-sendmsg.ts](../lib/sendmsg.ts)) זורק `SendmsgError`
כאשר `success === false` ומכניס את `result.ResultMessage` לתוך ה-message.
**אל תסתמכו על HTTP status — תמיד 200.**

### 2.3 האנדפוינטים שאנחנו משתמשים בהם

| Endpoint | מטרה | פונקציה ב-lib/sendmsg.ts |
|---|---|---|
| `POST /token` | אישור אישורים, קבלת טוקן | `getToken`, `testConnection` |
| `POST /CreateMalingList` (typo במקור) | יצירת רשימה חדשה | `createMailingList` |
| `POST /AddUsersToLists` | הוספת מנוי לרשימה | `addUserToList` |
| `POST /SendEmailToMailingLists` | שליחה / תזמון לרשימה | `sendEmailToList`, `dispatchMessageToList` |
| `GET /GetMsgFullStatistics?messageID=N` | סטטיסטיקות הודעה | `getMessageStats` |
| `GET /GetAllMalingLists` | רשימה של כל הרשימות (fallback) | `getAllMailingLists` |

### 2.4 גופי ה-request החשובים

**יצירת רשימה:**
```json
{ "IsNewList": true, "NewListName": "וובינר X", "NewListDescription": "..." }
```
**תגובה:** `data.mailingLists[0]` ← זה ה-listId. (לפעמים גם מופיע כמספר מילולי
ב-`result.ResultMessage`: "mailingList created IDs:341376".)

**הוספת מנוי:**
```json
{
  "users": [{
    "EmailAddress": "u@x.com",
    "FirstName": "...",
    "LastName": "...",
    "Cellphone": "0501234567"
  }],
  "mailingLists": [{ "ExistingListID": 341376 }]
}
```

**שליחה לרשימה (mailing list):**
```json
{
  "MalingListIDs": [341376],
  "Message": {
    "MessageContent": "<html>...</html>",
    "MessageSubject": "...",
    "MessageInnerName": "internal-label-ascii",
    "MessageDirection": 1,
    "SenderEmailAddress": "sender@verified-domain.com",
    "SenderName": "...",
    "MessageBackColor": "#ffffff",
    "AddFacebook": false, "AddForward": false, "AddShowMessage": true,
    "PostponeSendTime": "2026-06-20 14:00:00"
  }
}
```

`PostponeSendTime` הוא Israel local ב-`YYYY-MM-DD HH:mm:ss`. בלעדיו → שליחה
מיידית.

---

## 3. Gotchas שלמדנו בדרך הקשה

> כל אחד מאלה גרם לנו לבאג בפרודקשן. תיעוד פרגמטי, לא טהור.

### 3.1 `Phone` לא קיים — צריך `Cellphone`
המסמכים בתוך טבלת ה-AddOrUpdateUsers ברורים, אבל הדוגמאות באנגלית בכוסת
אחרת. שדה הטלפון הוא `Cellphone`. תוקן ב-commit `2aa418f`.

### 3.2 listId לא ב-`NewListID` — ב-`data.mailingLists[0]`
ניחשנו תחילה שמות שדה כמו `NewListID`/`ListID`. בפועל ה-shape הוא:
```
data.mailingLists: [341376]
```
ה-extractor שלנו מנסה גם variants ישנים + regex על `ResultMessage`.

### 3.3 בלי `SenderEmailAddress` השרת זורק NullReferenceException
ההודעה מצידם תהיה: `"Error Sending Message Object reference not set to an
instance of an object."` הקוד שלנו מסרב לשלוח בלי שולח (פר תבנית או דיפולט
ב-AppSettings) עם שגיאה בעברית במקום לבזבז קריאה.

### 3.4 `MessageInnerName` ב-Hebrew נחשד כגורם NRE
ההמלצה: ASCII בלבד. השם הזה מופיע בדשבורד של sendmsg בלבד; אצלנו
`${campaign.slug}-${email.id.slice(0,6)}`.

### 3.5 אין endpoint שמחזיר "מה הסטטוס הנוכחי של ההודעה"
לכן הסטטוס "נשלח" אצלנו הוא **inference**: על טעינת הדף, "מתוזמן" עם
`scheduledAt` שעבר ⟶ "נשלח". זה לא מאמת ש-sendmsg באמת שלחו, רק שזמן
השליחה עבר. הסטטיסטיקות (`/GetMsgFullStatistics`) הן הדרך לאמת אחרי
המעבר ל-"נשלח".

### 3.6 `PostponeSendTime` ב-timezone של sendmsg = ישראל
`scheduledAt` נשמר אצלנו כמחרוזת literal `"YYYY-MM-DDTHH:mm"` בלי
timezone math. בעת שליחה — `formatPostponeSendTime` ב-sendmsg.ts ממיר
לפורמט שלהם דרך `Intl.DateTimeFormat({timeZone: "Asia/Jerusalem"})`.

### 3.7 הזרימה הדו-שלבית (CreateMessage → UseDraftID) ⟶ NRE
ניסינו: ליצור draft עם PostponeSendTime, אז לקרוא SendEmailToMailingLists
עם UseDraftID. תוצאה: NRE. החזרנו לזרימה inline — Message מלא + PostponeSendTime
על אותה קריאה אחת ל-SendEmailToMailingLists. עובד.

---

## 4. ארכיטקטורה אצלנו

```
[ Lead form ]
    │ POST /api/leads
    ▼
┌──────────────────────────────────────────────┐
│ /api/leads/route.ts                          │
│  1. שמירת ליד ב-DB                            │
│  2. forward ל-webhook (אם יש)                │
│  3. syncLeadToSendmsg (async, non-blocking)  │
│      → ensureCampaignList(creds, campaign)   │
│        → CreateMalingList (אם אין cache)     │
│        → cache listId על config של הקמפיין   │
│      → AddUsersToLists                       │
└──────────────────────────────────────────────┘

[ Admin: /admin/[id]/emails ]
    │
    ├── EmailTemplate CRUD → /api/admin/campaigns/[id]/emails/*
    ├── "סט תזכורות" preset → ...emails/presets
    ├── "שלח" / "תזמן" → ...emails/[emailId]/send
    │     → dispatchMessageToList → /SendEmailToMailingLists
    └── "סטטיסטיקות" → ...emails/[emailId]/stats
          → getMessageStats → /GetMsgFullStatistics
```

**מודלים ב-Prisma:**
- `AppSetting (key, value)` — אישורי sendmsg + שולח ברירת מחדל
- `Campaign.config (JSON)` — `integrations.sendmsg.{enabled, listName, listId}` cache
- `EmailTemplate` — תבניות, סטטוס, scheduledAt, sentAt, sendmsgMessageId, errorMessage

---

## 5. דיבוג

### 5.1 כשמשהו נכשל בסנכרון ליד
1. כנס ל-`/admin/<id>/emails`.
2. **"בדיקת סנכרון"** (כפתור למעלה מימין).
3. הזן email/name/phone לטסט (או השאר ריק לבדיקת token+list בלבד).
4. תקבל כרטיסי שלב צבעוניים עם **ה-JSON המלא של התגובה** מ-sendmsg.

### 5.2 כשמייל נכשל
- `email.errorMessage` נשמר ב-DB עם ה-`SendmsgError.message` + body.
- מופיע אדום בכרטיס המייל ברשימה.
- ב-Vercel logs יש `console.log` של ה-raw response של כל קריאה
  (`CreateMalingList`, `AddUsersToLists`, `SendEmailToMailingLists`).

### 5.3 קונבנציית ה-token cache
ה-cache הוא in-memory פר instance של lambda. ב-cold start ייצר טוקן חדש.
שלח מסר מגביל לטוקנים בו-זמניים — אם רואים 530 ("Try again later"),
זה כנראה rate limit.

---

## 6. Roadmap — פיצ'רים נוספים למערכת הדיוור

מסודר לפי **עלות לפיתוח / יחס תועלת**, מהמהיר למורכב.

### Phase A — הוספת משתני personalization ✅ בוצע (2026-06-16)

> **סטטוס:** מומש עם **שדות מערכת בלבד** (frontend-only). סרגל "משתנים אישיים"
> מעל ה-textarea מזריק `[|[FirstName]|]` / `[|[LastName]|]` / `[|[EmailAddress]|]` /
> `[|[Cellphone]|]` ב-position של ה-cursor (`insertAtCursor` ב-[_emails-client.tsx](../app/admin/[id]/emails/_emails-client.tsx)).
> הרשימה ב-`PERSONALIZATION_VARS` ב-[lib/email-blocks.ts](../lib/email-blocks.ts).
> התצוגה המקדימה מדגישה את ה-placeholders בצהוב (`highlightPlaceholders`, preview-only).
> `defaultSkeleton` עודכן ל-`[|[FirstName]|]`.
>
> **לא מומש (נדחה):** custom keys דרך `userSendFields` (דורש שינוי backend/DB).
> **לאמת:** שמות השדות `EmailAddress`/`Cellphone` הם best-effort — לאמת מול
> שליחת טסט ב"בדיקת סנכרון" (`FirstName`/`LastName` מתועדים רשמית).

**מה:** כפתורים מעל ה-HTML textarea שמכניסים placeholder של שלח מסר
בקליק. למשל "שם פרטי" → מכניס ב-cursor `[|[FirstName]|]`.

**איך זה עובד אצל sendmsg:**

| תחביר | מקור |
|---|---|
| `[|[FirstName]|]` | "system field" — sendmsg מחפש שדה אישי עם השם הזה ושותל את הערך |
| `[|[LastName]|]` | system field |
| `[|[customKey]|]` | userSendFields (שולחים פר-משתמש בקריאת ה-send) |

**מימוש פרקטי:**
1. Toolbar מעל ה-textarea ב-[_emails-client.tsx](../app/admin/[id]/emails/_emails-client.tsx)
   עם כפתורים מוגדרים מראש (שם פרטי / שם משפחה / אימייל / טלפון).
2. כל כפתור = `insertAtCursor("[|[FieldName]|]")` על ה-textarea.
3. רשימת השדות תהיה ניתנת להרחבה: ה-admin יוכל להוסיף custom keys
   (ייכנסו ל-`userSendFields` בעת ה-send — צריך להרחיב את
   `SendmsgMessage` ל-`users` array עם custom fields).
4. בתצוגה מקדימה (iframe) — להוסיף הדגשה ויזואלית של ה-placeholders
   (למשל background-color צהוב) שיהיה ברור איפה יוחלף.

**קבצים שמשתנים:** `_emails-client.tsx` (toolbar + EmailEditor), אופציונלית
גם `sendmsg.ts` (תמיכה ב-userSendFields).

### Phase B — ספריית קומפוננטות "הזרק" ✅ בוצע (2026-06-16)

> **סטטוס:** `BLOCKS` ב-[lib/email-blocks.ts](../lib/email-blocks.ts) מספק 7 בלוקים
> (כותרת ראשית, פסקה, תמונה, כפתור CTA, רשימת בולטים, חוצץ, חתימה) שמוזרקים
> ב-cursor. בנוסף `TEMPLATES` מספק 4 תבניות פתיחה מלאות (Hero ממוקד, ניוזלטר,
> מבצע, טקסט פשוט) דרך כפתורי "התחל מתבנית" (עם `confirm` לפני החלפת תוכן).
> הכל email-safe (table-based, inline styles, RTL), בלי תלות חיצונית, התצוגה
> המקדימה ממשיכה לעבוד כרגיל.

**מה:** במקום drag-and-drop מלא, כפתורים שמזריקים בלוקים מוכנים של HTML
לתוך ה-textarea, ב-position של ה-cursor:

- 🟦 **Hero**: כותרת + תיאור + כפתור CTA
- 🟦 **טקסט**: פסקה רגילה
- 🟦 **תמונה**: `<img>` עם max-width 100%
- 🟦 **כפתור**: button table-based
- 🟦 **רשימת בולטים**: `<ul>` מעוצב
- 🟦 **חוצץ (spacer)**: padding/spacer row
- 🟦 **חתימה**: סטנדרט עם שם השולח + ניהול הסרה

**איך:** כל בלוק = פונקציה שמחזירה HTML string, עם placeholders שניתן
לערוך אחרי ההזרקה. לדוגמה ב-`lib/email-blocks.ts`:

```ts
export const BLOCKS = {
  cta: () => `<table ...><tr><td>
    <a href="[CTA_URL]" style="...">[CTA_TEXT]</a>
  </td></tr></table>`,
  hero: (title='כותרת', body='תיאור') => `...`,
  // ...
};
```

ב-UI: רצועה צדדית/עליונה עם אייקונים פר בלוק. לחיצה → insertAtCursor.

**גם:** "התחלה מחדש מתבנית" — כפתור שמחליף את כל ה-HTML באחת מ-N תבניות
מוכנות (Hero-Centric, Newsletter, Promo, Plain-Text). מומלצות להחיל
על preset webinar reminders.

**יתרון:** ללא תלות בספריות חיצוניות, נשאר ב-textarea, התצוגה המקדימה
ממשיכה לעבוד כמו שהיא.

### Phase C — עורך ויזואלי עם drag-and-drop אמיתי (~שבועיים+)

זה הקפיצה הגדולה. יש 3 דרכים:

#### Option C1: ספרייה מסחרית מוטמעת
- **Unlayer** ([react-email-editor](https://github.com/unlayer/react-email-editor)) — drag-drop, חינמי לבסיס, in-app editor. מייצא HTML מוכן.
- **BEE Plugin** — דומה, מסחרי.

**יתרון:** מוכן לעבודה תוך שעות. **חיסרון:** תלות חיצונית, branding, מחיר.

**אינטגרציה:** מחליפים את ה-textarea+iframe ב-`<EmailEditor onSave={(html) => setHtml(html)}/>`. שומרים את ה-JSON design של Unlayer ב-DB נוסף ל-HTML הסופי כדי לאפשר עריכה חוזרת.

#### Option C2: בנייה מבוססת MJML
- [MJML](https://mjml.io/) = שפת markup → HTML compatible לכל email client.
- מאחורי הקלעים מאחסנים MJML, מציגים HTML בפריוויו, עורכים MJML
  עם editor פשוט (textarea + syntax highlighting).
- לא drag-drop אבל הקוד נקי ועובד בכל לקוח.

#### Option C3: עורך מותאם אישית
- React DnD + רשימת בלוקים מ-Phase B
- כל בלוק = component מנוהל ב-state (`Block[]`)
- Serialize ל-HTML רק בעת save/send
- שליטה מלאה אבל הרבה עבודה

**ההמלצה שלי:** התחל ב-Phase A+B (ימים בודדים, ROI גבוה). אם זה מספיק
ללקוחות שלך — לא ללכת ל-C. אם דורש "wow" של עורך גרפי → C1 (Unlayer)
הוא ה-cost/benefit הכי טוב.

### Phase D — פיצ'רים מתקדמים יותר

| פיצ'ר | קושי | תועלת |
|---|---|---|
| **A/B testing** subject lines | בינוני | בינוני — Insights על מה עובד |
| **segmentation** של רשימת תפוצה (UTM source, תאריך הרשמה) | בינוני-גבוה | גבוה |
| **drip campaigns** — סדרת מיילים שמתחילה X ימים לאחר ההרשמה | בינוני | גבוה — engagement |
| **דוח לידים מצרפי** עם פתיחות/קליקים | בינוני | גבוה |
| **שילוב SMS** (sendmsg גם תומך) | בינוני | תלוי קהל |
| **HTML preview ב-Gmail/Outlook clients** (litmus-like) | גבוה | בינוני |
| **עורך ויזואלי תוך שמירת מצב design** | גבוה | אם C1 — אוטו'; אחרת רב משמעותי |

### Phase E — אופטימיזציה / produciton hardening

- **Webhook bounces/unsubscribes** — אם sendmsg מציעים webhooks (לא הצלחנו
  לאתר ב-Apiary), לחבר לנו כדי לעדכן `Lead.subscribed=false` אוטומטית.
- **Token refresh proactive** — היום ה-cache הוא 11h; ב-cold start יוצרים
  חדש כל פעם. לשקול persistent cache (Redis/Upstash) אם הקריאות צפופות.
- **Rate limiting** + retry/backoff על קריאות sendmsg.
- **Audit log** של כל קריאה (request body + response) ב-DB לדיבוג היסטורי
  (לא רק logs של Vercel שמתפוגגים).
- **תזמון חכם של preset reminders**: היום זה תזכורות יחסיות ל-`webinar.dateISO`.
  אם משנים את תאריך הוובינר, ה-`scheduledAt` של התזכורות לא מתעדכן. צריך
  משיכה (button "עדכן זמני תזכורות" או הזרמת שינויי תאריך לרשומות
  EmailTemplate שיש להן `presetType` field חדש).

---

## 7. תחזוקה — שינויים שכדאי לזכור

- **שינוי שדה ב-CampaignConfig?** צריך לעדכן את `lib/campaign-schema.ts`,
  `lib/default-config.ts`, `prisma/seed.ts`. בלי שדה ב-seed.ts ה-Vercel
  build נכשל ב-TypeScript.
- **שינוי DB?** הוסף migration ב-`prisma/migrations/`. `vercel.json` מריץ
  `prisma migrate deploy` בכל build. DIRECT_URL כבר מוגדר ב-Vercel env.
- **שינוי lib/sendmsg.ts?** רוב הפונקציות מוקפות ב-`console.log` של raw
  request/response — תשמרו את זה, חוסך שעות דיבוג כשתשתנה shape של API.

---

## 8. מקורות

- API Blueprint: https://sendmsgapi.docs.apiary.io
- Apiary blueprint raw: https://jsapi.apiary.io/apis/sendmsgapi.apib
- Support: send.help@comstar.co.il
- Vercel logs: `vercel logs https://hm-webinars.vercel.app` (live stream)
- Vercel inspect deployment: דרך הדשבורד או `vercel inspect <deployment-url>`
