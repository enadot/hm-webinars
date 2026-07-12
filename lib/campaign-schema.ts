import { z } from "zod";

// Content fields are intentionally permissive (allow empty strings) so that newly-created
// campaigns can be saved with default-empty values and filled in later via the editor.
// Structural fields (slug at the campaign level, types, etc.) are enforced.

export const SpeakerSchema = z.object({
  name: z.string().default(""),
  role: z.string().default(""),
  bio: z.string().default(""),
  photoUrl: z.string().default(""),
  logoUrl: z.string().default(""),
  accent: z.enum(["gold", "purple", "primary"]).default("primary"),
  highlights: z.array(z.string()).default([]),
});
export type Speaker = z.infer<typeof SpeakerSchema>;

export const BulletSchema = z.object({
  title: z.string().default(""),
  body: z.string().default(""),
  icon: z.string().default("Sparkles"),
});
export type Bullet = z.infer<typeof BulletSchema>;

export const SendmsgCampaignSchema = z.object({
  enabled: z.boolean().default(true),
  listName: z.string().default(""),
  listId: z.number().int().optional(),
});
export type SendmsgCampaign = z.infer<typeof SendmsgCampaignSchema>;

export const IntegrationsSchema = z.object({
  sendmsg: SendmsgCampaignSchema.default(() => SendmsgCampaignSchema.parse({})),
});
export type Integrations = z.infer<typeof IntegrationsSchema>;

export const BannerSchema = z.object({
  imageUrl: z.string().default(""),
  linkUrl: z.string().default(""),
  alt: z.string().default(""),
});
export type Banner = z.infer<typeof BannerSchema>;

// Content for the "editorial-dark" template's design-specific sections
// (typographic questions field, AI cards, audience cards, open Q&A, FAQ).
// Optional + fully defaulted so other templates/campaigns are unaffected.
export const EditorialSchema = z.object({
  topbarCta: z.string().default("שמרו לי מקום"),
  salaryCard: z
    .object({
      title: z.string().default(""),
      rows: z
        .array(z.object({ label: z.string().default(""), value: z.string().default("") }))
        .default([]),
    })
    .default(() => ({ title: "", rows: [] })),
  heroChipMono: z.string().default(""),
  heroChipText: z.string().default(""),
  heroPill: z.string().default(""),
  questions: z
    .object({
      label: z.string().default(""),
      title: z.string().default(""),
      strike: z.string().default(""),
      items: z.array(z.string()).default([]),
      marquee: z.array(z.string()).default([]),
      closing: z.string().default(""),
      closingAccent: z.string().default(""),
      cta: z.string().default(""),
    })
    .default(() => ({
      label: "",
      title: "",
      strike: "",
      items: [],
      marquee: [],
      closing: "",
      closingAccent: "",
      cta: "",
    })),
  getFootnote: z.string().default(""),
  ai: z
    .object({
      label: z.string().default(""),
      titleAccent: z.string().default(""),
      title: z.string().default(""),
      title2: z.string().default(""),
      body1: z.string().default(""),
      body2: z.string().default(""),
      body3: z.string().default(""),
      cards: z
        .array(z.object({ tag: z.string().default(""), text: z.string().default("") }))
        .default([]),
    })
    .default(() => ({
      label: "",
      titleAccent: "",
      title: "",
      title2: "",
      body1: "",
      body2: "",
      body3: "",
      cards: [],
    })),
  stats: z
    .array(
      z.object({
        value: z.string().default(""),
        suffix: z.string().default(""),
        label: z.string().default(""),
      })
    )
    .default([]),
  presenterPunch: z.string().default(""),
  presenterBadgeLabel: z.string().default("EXPERIENCE"),
  presenterBadge: z.string().default(""),
  audience: z
    .object({
      label: z.string().default(""),
      title: z.string().default(""),
      cards: z
        .array(z.object({ quote: z.string().default(""), note: z.string().default("") }))
        .default([]),
      chips: z.array(z.string()).default([]),
    })
    .default(() => ({ label: "", title: "", cards: [], chips: [] })),
  qa: z
    .object({
      label: z.string().default(""),
      title: z.string().default(""),
      titleAccent: z.string().default(""),
      body: z.string().default(""),
      punch: z.string().default(""),
      bubbles: z.array(z.string()).default([]),
    })
    .default(() => ({ label: "", title: "", titleAccent: "", body: "", punch: "", bubbles: [] })),
  registerLabel: z.string().default(""),
  limitedText: z.string().default("מספר המקומות מוגבל"),
  // Hebrew calendar date shown alongside the Gregorian date (e.g. י״ב אב תשפ״ו).
  hebrewDate: z.string().default(""),
  // Exit-intent registration popup copy.
  popupTitle: z.string().default(""),
  popupBody: z.string().default(""),
  faq: z
    .object({
      label: z.string().default(""),
      title: z.string().default(""),
      items: z
        .array(z.object({ q: z.string().default(""), a: z.string().default("") }))
        .default([]),
    })
    .default(() => ({ label: "", title: "", items: [] })),
  final: z
    .object({
      title: z.string().default(""),
      titleAccent: z.string().default(""),
      body: z.string().default(""),
      note: z.string().default(""),
      footerMono: z.string().default(""),
    })
    .default(() => ({ title: "", titleAccent: "", body: "", note: "", footerMono: "" })),
});
export type Editorial = z.infer<typeof EditorialSchema>;

export const StyleOverrideSchema = z.object({
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  hidden: z.boolean().optional(),
});
export type StyleOverride = z.infer<typeof StyleOverrideSchema>;

export const ThemeSchema = z.object({
  primary: z.string().default("#0B1437"),
  primary2: z.string().default("#1B2762"),
  accent: z.string().default("#F5B500"),
  accentLight: z.string().default("#FFCB3D"),
  purple: z.string().default("#7C3AED"),
  coral: z.string().default("#FB7185"),
  dark: z.string().default("#0A0E27"),
});
export type Theme = z.infer<typeof ThemeSchema>;

export const CampaignConfigSchema = z.object({
  meta: z.object({
    title: z.string().default(""),
    description: z.string().default(""),
  }),
  brand: z.object({
    logoUrl: z.string().default(""),
    name: z.string().default(""),
    tagline: z.string().default(""),
  }),
  hero: z.object({
    eyebrow: z.string().default(""),
    eyebrowLogoUrl: z.string().default(""),
    headline: z.string().default(""),
    headlineAccent: z.string().default(""),
    subheadline: z.string().default(""),
    description: z.string().default(""),
    ctaText: z.string().default("אני רוצה להבטיח מקום"),
  }),
  webinar: z.object({
    dateISO: z.string().default(""),
    dateLabel: z.string().default(""),
    dayShort: z.string().default(""),
    dateShort: z.string().default(""),
    time: z.string().default("20:00"),
    venue: z.string().default("אונליין · מהבית"),
    venueShort: z.string().default("אונליין"),
    spotsLimited: z.boolean().default(true),
  }),
  intro: z
    .object({
      eyebrow: z.string().default(""),
      title: z.string().default(""),
      titleAccent: z.string().default(""),
      body: z.string().default(""),
      highlights: z.array(z.object({ title: z.string(), subtitle: z.string() })).default([]),
    })
    .optional(),
  speakers: z.object({
    eyebrow: z.string().default("המרצים"),
    title: z.string().default(""),
    titleAccent: z.string().default(""),
    intro: z.string().default(""),
    list: z.array(SpeakerSchema).default([]),
  }),
  bullets: z.object({
    eyebrow: z.string().default("מה תקבלו"),
    title: z.string().default(""),
    titleAccent: z.string().default(""),
    intro: z.string().default(""),
    items: z.array(BulletSchema).default([]),
  }),
  commitments: z
    .object({
      enabled: z.boolean().default(true),
      eyebrow: z.string().default("המחויבות שלנו אליכם"),
      title: z.string().default(""),
      titleAccent: z.string().default(""),
      body: z.string().default(""),
      imageUrl: z.string().default(""),
    })
    .optional(),
  form: z.object({
    eyebrow: z.string().default("הרשמה לוובינר"),
    title: z.string().default("הבטיחו לכם מקום"),
    titleAccent: z.string().default(""),
    description: z.string().default(""),
    bullets: z.array(z.string()).default([]),
    cardTitle: z.string().default("שמרו לי מקום בוובינר!"),
    cardDescription: z.string().default(""),
    buttonText: z.string().default("הבטיחו לי מקום עכשיו ←"),
  }),
  footer: z.object({
    phone: z.string().default(""),
    email: z.string().default(""),
    legal: z.string().default(""),
  }),
  theme: ThemeSchema.default(() => ThemeSchema.parse({})),
  // Design-specific content used by the "editorial-dark" template only.
  editorial: EditorialSchema.optional(),
  // Optional sponsor / promo banner shown before the lead form.
  banner: BannerSchema.default(() => BannerSchema.parse({})),
  // Third-party integrations enabled per-campaign (global creds live in AppSetting).
  integrations: IntegrationsSchema.default(() => IntegrationsSchema.parse({})),
  // Per-element / per-section color overrides, keyed by element path
  // ("hero.headline") or section key ("section:hero").
  styleOverrides: z.record(z.string(), StyleOverrideSchema).default({}),
});

export type CampaignConfig = z.infer<typeof CampaignConfigSchema>;

export function safeParseConfig(raw: unknown): {
  ok: true;
  data: CampaignConfig;
} | {
  ok: false;
  error: string;
} {
  const r = CampaignConfigSchema.safeParse(raw);
  if (r.success) return { ok: true, data: r.data };
  return {
    ok: false,
    error: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
  };
}
