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
