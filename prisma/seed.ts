import { PrismaClient } from "@prisma/client";
import type { CampaignConfig } from "../lib/campaign-schema";

const prisma = new PrismaClient();

const realEstateConfig: CampaignConfig = {
  meta: {
    title: 'וובינר: השקעה בנדל"ן בלי פחד | אבינעם הרוש ומשה אדרי',
    description:
      'כל מה שזוגות צעירים ומשקיעים חייבים לדעת לפני חתימת חוזה. וובינר חינמי מהבית - 10/6 בשעה 20:00.',
  },
  brand: {
    logoUrl: "/logo-hamechadesh.png",
    name: "אומץ",
    tagline: 'מלווים אתכם להשקעה בטוחה.\nבהנהלת אבינעם הרוש · מ.ר. 3252660',
  },
  hero: {
    eyebrow: "חינמי · מקומות מוגבלים",
    eyebrowLogoUrl: "/zoom-webinar.png",
    headline: 'השקעה בנדל"ן',
    headlineAccent: "בלי פחד",
    subheadline: "איך לזהות הזדמנויות תוך ניהול סיכונים בשוק של היום",
    description: "כל מה שזוגות צעירים ומשקיעים חייבים לדעת לפני חתימת חוזה",
    ctaText: "אני רוצה להבטיח מקום",
  },
  webinar: {
    dateISO: "2026-06-10T20:00:00+03:00",
    dateLabel: "יום רביעי, 10 ביוני 2026",
    dayShort: "יום רביעי",
    dateShort: "10 ביוני 2026",
    time: "20:00",
    venue: "אונליין · מהבית",
    venueShort: "אונליין",
    spotsLimited: true,
  },
  intro: {
    eyebrow: "למה דווקא עכשיו",
    title: "השוק השתנה.\nהכללים השתנו.",
    titleAccent: "אתם משחקים נכון?",
    body: "ריביות גבוהות, מחירים תנודתיים ובנקים שמסרבים לאשר משכנתאות.\nההפרש בין החלטה מבוססת נתונים להחלטה רגשית - יכול להיות עשרות אלפי שקלים.",
    highlights: [
      { title: "מודלים מוכחים", subtitle: "לניהול סיכונים - לא ניחושים אלא מתודולוגיה" },
      { title: "12+ שנות שטח", subtitle: "כלים יישומיים שעובדים, לא תיאוריה" },
    ],
  },
  speakers: {
    eyebrow: "המרצים",
    title: "שני מומחים.",
    titleAccent: "שיטה אחת מוכחת.",
    intro: "לראשונה - השילוב בין מומחה ההשקעות למומחה המשכנתאות, במפגש אחד שייתן לכם תמונה מלאה.",
    list: [
      {
        name: "אבינעם הרוש",
        role: 'מומחה להשקעות נדל"ן · יועץ אסטרטגי',
        bio: 'מעל 12 שנות ניסיון בליווי יזמים ומשקיעים. שילוב ייחודי של ראייה עסקית רחבה ומומחיות מעשית בשטח. כיהן בתפקידי מפתח כמנהל פיתוח עסקי וכמנהל סוכנים במשרדי תיווך מובילים, ובהם ליווה מאות עסקאות נדל"ן.',
        photoUrl: "/avinoam.jpg",
        logoUrl: "",
        accent: "purple",
        highlights: ["12+ שנות ניסיון", "מאות עסקאות", "יועץ אסטרטגי"],
      },
      {
        name: "משה אדרי",
        role: "מומחה למשכנתאות מורכבות",
        bio: "לאחר עשור של מצוינות פיתח גישה חדשה שמובילה את מנהלי הבנקים לאשר גם לקוחות שלפני כן לא היו מוכנים להסתכל עליהם. השילוב של איש מספרים, מנתח פיננסי מנוסה ומומחה משכנתאות - הוא המודל שהביא למאות משפחות את האישור המיוחל.",
        photoUrl: "/moshe.png",
        logoUrl: "",
        accent: "gold",
        highlights: ["משכנתאות מורכבות", "10+ שנות מצוינות", "מאות משפחות"],
      },
    ],
  },
  bullets: {
    eyebrow: "מה תקבלו בהרצאה",
    title: "4 כלים שישנו לכם",
    titleAccent: "את כללי המשחק",
    intro: "לא תיאוריות. רק שיטות מוכחות שעובדות בשטח, מבוססות על ליווי של מאות עסקאות.",
    items: [
      {
        title: "ניתוח מגמות שוק 2026",
        body: "היכן כדאי להשקיע עכשיו, ומה הטעויות הקריטיות שמשקיעים מתחילים עושים בלי לדעת.",
        icon: "TrendingUp",
      },
      {
        title: 'מודל "כיפת ברזל" לסיכונים',
        body: "כלים פרקטיים שפותחו לאורך 12 שנים כדי להבטיח שהצעד שלכם מחושב ומגובה בנתונים.",
        icon: "Shield",
      },
      {
        title: "מודל זיהוי הזדמנויות",
        body: "איך לסנן רעשי רקע ולמצוא נכסים עם פוטנציאל רווח אמיתי בשוק הנוכחי.",
        icon: "Target",
      },
      {
        title: "ארגז כלים יישומי",
        body: "כלים מעולם הייעוץ העסקי שיעזרו לכם לבנות אסטרטגיה שמתאימה לאופי וליכולות שלכם.",
        icon: "Wrench",
      },
    ],
  },
  commitments: {
    enabled: true,
    eyebrow: "המחויבות שלנו אליכם",
    title: "10 הדברות",
    titleAccent: "של אומץ",
    body: "לפני שאתם רושמים מקום - חשוב שתדעו במה אנחנו מחויבים. בלי כוכביות.",
    imageUrl: "/commitments.png",
  },
  form: {
    eyebrow: "הרשמה לוובינר",
    title: "הבטיחו לכם מקום",
    titleAccent: "לפני שייגמרו",
    description: "השאירו פרטים, נחזור אליכם עם פרטי ההתחברות ותזכורת קצרה לפני שמתחילים.",
    bullets: [
      "מקומות מוגבלים - הרישום נסגר עם מילוי הקבוצה",
      "תקבלו לינק ישיר למייל ולטלפון",
      "ללא עלות, ללא התחייבות",
    ],
    cardTitle: "שמרו לי מקום בוובינר!",
    cardDescription: "הזינו את הפרטים שלכם למטה ותקבלו את כל המידע ותזכורות לוובינר:",
    buttonText: "הבטיחו לי מקום עכשיו ←",
  },
  footer: {
    phone: "073-000-000",
    email: "ometzmercaz@gmail.com",
    legal:
      "© 2026 כל הזכויות שמורות. אין באמור משום ייעוץ השקעות או תחליף לייעוץ פיננסי אישי.",
  },
  banner: { imageUrl: "", linkUrl: "", alt: "" },
  styleOverrides: {},
  theme: {
    primary: "#0B1437",
    primary2: "#1B2762",
    accent: "#F5B500",
    accentLight: "#FFCB3D",
    purple: "#7C3AED",
    coral: "#FB7185",
    dark: "#0A0E27",
  },
};

async function main() {
  const slug = "real-estate-2026";
  await prisma.campaign.upsert({
    where: { slug },
    update: { config: JSON.stringify(realEstateConfig) },
    create: {
      slug,
      name: 'השקעה בנדל"ן בלי פחד (10/6/2026)',
      templateId: "bold-hero",
      config: JSON.stringify(realEstateConfig),
      published: true,
    },
  });
  console.log(`Seeded campaign /${slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
