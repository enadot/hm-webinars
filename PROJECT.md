# מערכת ניהול דפי נחיתה לוובינרים

מערכת קלת-משקל לניהול ויצירת דפי נחיתה לוובינרים של לקוחות, עם עורך ויזואלי inline ו-3 תבניות עיצוב.

---

## סקירה כללית

המערכת מאפשרת למנהלת השיווק:
1. **ליצור** דף נחיתה חדש לקמפיין וובינר תוך פחות מדקה (שם → slug → בחירת תבנית).
2. **לערוך** את כל הטקסטים והתמונות בלחיצה ישירה על הדף (visual editing).
3. **להוסיף/למחוק** מרצים ובולטים inline בלחיצה אחת.
4. **לשנות** תבנית, צבעים, תאריך, ו-SEO דרך פאנל הגדרות צדדי.
5. **לפרסם** את הדף בכתובת `/<slug>` עם טופס לידים שמתחבר ל-webhook ייעודי.
6. **לאסוף לידים** למסד נתונים ולשלוח ל-Zapier/Make/CRM אוטומטית.

---

## סטאק טכנולוגי

- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn-ui (Button, Input, Label, Card)
- **DB**: Prisma + SQLite (Dev) / PostgreSQL (Production - Neon מומלץ)
- **אימות**: סיסמה משותפת + cookie חתום (HMAC SHA-256 ב-Web Crypto, תואם Edge)
- **תמונות**: Vercel Blob ב-Production / `/public/uploads/` ב-Dev
- **פונטים**: Google Sans + Heebo (Google Fonts)
- **אייקונים**: lucide-react
- **Validation**: Zod (schema לקמפיין)

---

## מבנה הפרויקט

```
hm-webinars/
├── prisma/
│   ├── schema.prisma           # Campaign + Lead models
│   ├── seed.ts                 # קמפיין ברירת מחדל (נדל"ן 10/6/2026)
│   └── migrations/             # היסטוריית סכמה
│
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # HMAC sessions (Edge-compatible)
│   ├── campaign-schema.ts      # Zod schema + types ל-CampaignConfig
│   ├── default-config.ts       # config ריק לקמפיין חדש
│   ├── templates.ts            # registry של 3 התבניות
│   ├── edit-context.tsx        # context לעריכה ויזואלית
│   ├── path-utils.ts           # getByPath / setByPath
│   └── utils.ts                # cn helper
│
├── components/
│   ├── ui/                     # shadcn primitives
│   │   ├── button.tsx          # עם variants: brand, gold, purple, etc.
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── editable/               # primitives לעריכה inline
│       ├── text.tsx            # EditableText (contentEditable מנוהל)
│       ├── image.tsx           # EditableImage (hover overlay + upload)
│       └── list.tsx            # EditableItemControls + EditableAddItem
│
├── templates/
│   ├── bold-hero/              # תבנית כהה דרמטית (refactored לעריכה inline ✓)
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── hero.tsx
│   │       ├── intro.tsx
│   │       ├── speakers.tsx
│   │       ├── bullets.tsx
│   │       ├── commitments.tsx
│   │       ├── lead-form.tsx
│   │       ├── footer.tsx
│   │       └── countdown.tsx
│   │
│   ├── editorial/              # תבנית מגזינית (טרם רופקטרה לעריכה inline)
│   │   ├── index.tsx
│   │   └── components/lead-form.tsx
│   │
│   └── energetic/              # תבנית תוססת (טרם רופקטרה לעריכה inline)
│       ├── index.tsx
│       └── components/lead-form.tsx
│
├── app/
│   ├── layout.tsx              # RTL + Google Sans + Heebo
│   ├── page.tsx                # דף בית (רשימת קמפיינים או redirect ליחיד)
│   ├── globals.css             # Tailwind + theme tokens
│   │
│   ├── [slug]/                 # דף הנחיתה הציבורי
│   │   ├── page.tsx
│   │   ├── _public-campaign.tsx # עוטף ב-EditProvider עם enabled=false
│   │   └── thank-you/page.tsx
│   │
│   ├── admin/
│   │   ├── login/page.tsx      # מסך כניסה
│   │   ├── (panel)/            # route group - לוח ניהול עם header
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # רשימת קמפיינים
│   │   │   ├── new/
│   │   │   │   ├── page.tsx
│   │   │   │   └── _wizard.tsx # 3-fields wizard
│   │   │   └── _components/
│   │   │       └── logout-button.tsx
│   │   │
│   │   └── [id]/edit/          # עורך ויזואלי full-screen
│   │       ├── page.tsx
│   │       └── _components/
│   │           ├── visual-editor.tsx
│   │           └── settings-panel.tsx
│   │
│   └── api/
│       ├── leads/route.ts      # קבלת לידים + forward ל-webhook
│       └── admin/
│           ├── auth/route.ts            # login/logout
│           ├── campaigns/route.ts       # POST: create
│           ├── campaigns/[id]/route.ts  # PATCH/DELETE
│           └── upload/route.ts          # העלאת תמונות
│
├── middleware.ts               # הגנה על /admin/*
├── .env.local.example          # תיעוד משתני סביבה
└── PROJECT.md                  # המסמך הזה
```

---

## מה נבנה - כרונולוגיה של איטרציות

### 1. דף נחיתה סטטי ראשון
- Hero, מרצים, "מה תקבלו" עם 4 נקודות, "10 הדברות", טופס רישום, footer
- RTL מלא, Google Sans + Heebo, mesh gradients, animated blobs
- Countdown לייב לתאריך 10/6/2026 20:00
- טופס עם validation client+server side
- API route `/api/leads` שמעביר ל-webhook

### 2. שיפור עיצוב דרמטי
- פונטים גדולים פי 2-3 (עד `text-[10rem]` ב-Hero)
- פלטת צבעים תוססת יותר (`#0B1437`, `#F5B500`, `#7C3AED`)
- Gradient text effects (`text-gradient-gold`, `text-gradient-cool`)
- Hover lift + glow shadows + active scale על כפתורים
- Section padding גדול יותר, container רחב יותר

### 3. הוספת לוגואים
- בר עליון לבן עם לוגו "המחדש"
- Pill לבן עם לוגו "Zoom Webinar" במקום הבאדג' הזהוב

### 4. הפיכה למערכת מולטי-קמפיין
- Prisma + SQLite + מודל Campaign/Lead
- 3 תבניות: **Bold Hero** (קיים, refactor), **Editorial** (מגזיני), **Energetic** (תוסס)
- ראוט דינמי `/[slug]` שטוען מה-DB ובוחר תבנית
- API CRUD לקמפיינים
- העלאת תמונות (Vercel Blob / local fallback)
- אימות אדמין (סיסמה + cookie חתום)

### 5. עורך ויזואלי inline (גרסה נוכחית)
- **Visual editing**: לחיצה על טקסט → contentEditable, לחיצה על תמונה → upload overlay
- **List controls**: hover על מרצה/בולט → ← → ↑ סל למחיקה, + להוספה
- **Side panel**: רק להגדרות שלא נראות בדף (תאריך, צבעים, slug, webhook, SEO, פרסום, תבנית)
- **Save state**: idle/saving/saved/error + תיוג "שינויים שלא נשמרו"
- **Wizard ליצירה**: 3 שדות בלבד (שם, slug, תבנית) → redirect ישיר לעורך

---

## איך משתמשים

### יצירת קמפיין חדש
1. נכנסים ל-`/admin/login`, מקלידים סיסמה (default: `webinars2026`)
2. לוחצים "קמפיין חדש"
3. ממלאים: שם → slug (מופק אוטומטית) → בוחרים תבנית
4. נכנסים אוטומטית לעורך הוויזואלי

### עריכה
- **טקסטים**: לחיצה ישירה על הטקסט בדף → עריכה inline → Enter שומר, Escape מבטל
- **תמונות**: hover → overlay כהה → "החלפה" (פותח file picker) / "הסר"
- **מרצים/בולטים**: hover על כרטיס → סרגל קטן צף → ←→ להזזה / סל למחיקה
- **הוספה**: כפתור "+ הוסף מרצה" / "+ הוסף בולט" אחרי הרשימה
- **הגדרות**: ⚙️ בטולבר → פאנל מימין עם תאריך/צבעים/SEO/webhook/תבנית/slug

### שמירה ופרסום
- כפתור "שמירה" בטולבר. סטטוס: שומר → נשמר ✓ → "שינויים שלא נשמרו" אם משנים שוב
- Toggle "דף פעיל" בפאנל ההגדרות - כשכבוי, הדף יחזיר 404 לציבור
- כפתור "צפייה" → פותח את הדף בטאב חדש

### לידים
- כל הרשמה נשמרת בטבלת `Lead` ב-DB
- אם הוגדר `leadsWebhookUrl` בקמפיין → נשלח POST ל-URL הזה
- אחרת → fallback ל-`LEADS_WEBHOOK_URL` הגלובלי מ-env
- payload: `{ name, phone, email, campaignSlug, submittedAt, userAgent }`

---

## פריסה ל-Production (Vercel)

### שלבים
1. **DB**: צור חשבון ב-[neon.tech](https://neon.tech) → פרויקט חדש → העתק connection string
2. ב-`prisma/schema.prisma` שנה `provider = "sqlite"` ל-`provider = "postgresql"`
3. הרץ `npx prisma migrate dev --name init-postgres` מקומית עם DATABASE_URL חדש
4. **Vercel Blob**: דרך dashboard → Storage → Create Blob Store → העתק token
5. ב-Vercel → Settings → Environment Variables:
   - `DATABASE_URL` = Neon connection string
   - `ADMIN_PASSWORD` = סיסמה חזקה (`openssl rand -hex 24`)
   - `SESSION_SECRET` = `openssl rand -hex 32`
   - `BLOB_READ_WRITE_TOKEN` = token מ-Vercel Blob
   - `LEADS_WEBHOOK_URL` = (אופציונלי, fallback גלובלי)
6. `vercel deploy` → המערכת חיה

### חשוב לזכור
- ה-DB ב-Vercel הוא Postgres, לא SQLite (SQLite לא שורד deployments)
- תמונות מ-`/public/uploads/` לא ישרדו ב-Vercel - חובה Vercel Blob
- שמור גיבוי של ה-DB מדי פעם (Neon תומך point-in-time recovery)

---

## מה מומלץ לעשות בהמשך

### עדיפות גבוהה (חוויית משתמש)

#### 1. ✨ Inline editing לתבניות Editorial ו-Energetic
**למה**: כרגע רק Bold Hero תומך בעריכה inline. אם מנהלת בוחרת בתבנית אחרת, היא יכולה לערוך רק דרך הפאנל הצדדי (פחות נוח).
**מה צריך**: לעשות אותו refactor שעשינו ל-bold-hero - להחליף `{config.hero.headline}` ב-`<EditableText path="hero.headline" />`, וכו'.
**מורכבות**: 1-2 שעות. רק עבודה מכנית.

#### 2. 📊 דף לידים לכל קמפיין
**למה**: כרגע לידים נשמרים ב-DB אבל אין UI לראות/לייצא אותם.
**מה צריך**: עמוד `/admin/<id>/leads` עם טבלה (תאריך, שם, טלפון, מייל) + כפתור "ייצוא ל-CSV".
**מורכבות**: 2-3 שעות.

#### 3. 🖼️ ספריית תמונות
**למה**: אם משתמשים באותו לוגו ב-10 קמפיינים, כרגע צריך להעלות 10 פעמים.
**מה צריך**: עמוד `/admin/media` שמציג את כל התמונות שהועלו + כפתור "בחר מהספרייה" בכל ImagePicker.
**מורכבות**: 3-4 שעות.

#### 4. 🎯 תבנית הצלחה (Thank you) ניתנת לעריכה
**למה**: כרגע דף `/<slug>/thank-you` הוא הארדקודד.
**מה צריך**: להוסיף ל-CampaignConfig את `thankYou: { title, body, calendarLink?, redirectAfter? }`.
**מורכבות**: 2 שעות.

### עדיפות בינונית (שלמות פיצ'רים)

#### 5. ✏️ עריכת בולטים בטופס inline
כרגע נערכים רק דרך הפאנל. אפשר להוסיף `EditableList` גם להם בתוך `lead-form.tsx`.

#### 6. 🎨 רינדור צבעי ה-theme בפועל
כרגע ה-color pickers בפאנל ההגדרות שומרים ערכים אבל הם **לא משפיעים** על הרינדור (תבניות ה-Bold Hero משתמשות ב-Tailwind classes קבועים `brand-primary` וכו'). צריך להעביר את הצבעים דרך CSS variables ולעדכן את התבניות להשתמש בהן.
**מורכבות**: 4-5 שעות. דורש refactor של ה-CSS גלובלי.

#### 7. 📅 שילוב Google Calendar
לאחר רישום, כפתור "הוסף ליומן" שיוצר אירוע. דורש icalendar generation או Google Calendar API.

#### 8. ⏪ Auto-save + undo/redo
אוטו-שמירה כל 5 שניות אחרי שינוי + Ctrl+Z להחזרה לאחור (לשמור היסטוריה לוקלית).

#### 9. 🌐 שילוב Resend לאישור מייל אוטומטי למשתתף
לאחר הרשמה, שליחת מייל אוטומטי עם פרטי הוובינר (במקום רק webhook).

#### 10. 🔍 העתקה / שכפול קמפיין
"שכפל קמפיין" מהדאשבורד - שימושי כשעושים גרסה דומה לוובינר הבא.

### עדיפות נמוכה (פולישים)

#### 11. 🗂️ קטגוריות / תגיות
לסדר קמפיינים לפי לקוח / סוג / שנה.

#### 12. 👥 מספר משתמשים עם תפקידים
כרגע סיסמה אחת לכולם. אם תהיה מנהלת + עוד 2 אנשי שיווק - NextAuth עם תפקידים (admin / editor).

#### 13. 📈 אנליטיקס בסיסי
ספירת page views + Conversion rate (visits → registrations) לכל קמפיין.

#### 14. 🎁 A/B testing
שתי וריאציות של אותו קמפיין, חצי מהמבקרים רואים את A וחצי B. השוואת CR.

### תיקונים טכניים מומלצים

#### 15. ✅ הוסף migration ל-Postgres
כשעובדים לוקלית עם SQLite ועוברים ל-Postgres, שינוי בסכמה (כמו הוספת שדה) דורש re-migrate. הגדר תהליך CI לזה.

#### 16. 🔐 Rate limiting על /api/leads
כרגע אפשר ל-DDoS את הטופס. השתמש ב-Upstash Redis לרייט-לימיט per IP.

#### 17. 🧪 בדיקות אוטומטיות
אין tests עדיין. מומלץ:
- Playwright לבדיקת flows קריטיים (login → create campaign → edit → submit lead)
- Vitest ל-utils (path-utils, auth)

#### 18. 📝 לוגינג מסודר
כרגע `console.log` בלבד. עבור ל-pino או Vercel Log Drains לפרודקשן.

#### 19. 🧹 ניקוי קוד legacy
- `components/speakers.tsx`, `components/bullets.tsx`, etc. - הקבצים המקוריים שאין צורך בהם (החלפו ב-`templates/bold-hero/components/`)
- אפשר למחוק את כל `/components/*.tsx` חוץ מ-`/components/ui/` ו-`/components/editable/`

#### 20. 🌐 SEO מתקדם
- sitemap.xml דינמי לכל הקמפיינים הפעילים
- robots.txt
- structured data (JSON-LD) של Event לכל וובינר

---

## הערות אחרונות

### תלויות שהותקנו
ראה `package.json`. החשובים: `next@16`, `react@19`, `prisma@6`, `zod@4`, `@vercel/blob`, `lucide-react`, `tailwindcss`.

### מתקנים שצריך לזכור
- **next@16 דרש מעבר ל-React 19** (היה תאימות issue עם react-dom)
- **prisma@7 לא תאם** לסכמה ישנה - חזרנו ל-prisma@6
- **Edge runtime לא תומך ב-node:crypto** - לכן `lib/auth.ts` משתמש ב-Web Crypto API

### Default credentials (לא לפרודקשן!)
- סיסמת אדמין: `webinars2026` (ב-`.env.local`)
- DB: `prisma/dev.db`

### תוויות פיצ'רים בקוד
חפש `TODO`, `FIXME`, או `HACK` בקוד - אין כרגע, אבל אם תוסיפו, נסו לעקוב.

---

**עודכן לאחרונה**: 2026-05-14
