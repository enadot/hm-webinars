import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Users, TrendingUp } from "lucide-react";
import { Countdown } from "./countdown";
import { EditableText } from "@/components/editable/text";
import { EditableImage } from "@/components/editable/image";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function WealthHero({ config }: { config: CampaignConfig }) {
  const { hero, webinar, brand } = config;

  return (
    <EditableSection sectionKey="hero" className="relative overflow-hidden bg-mesh-wealth text-white isolate">
      {/* Ambient glows */}
      <div className="absolute -top-40 -left-40 w-[42rem] h-[42rem] bg-brand-emerald/20 rounded-full blur-3xl animate-blob-slow" />
      <div className="absolute -bottom-48 -right-40 w-[46rem] h-[46rem] bg-brand-mint/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Rising market line */}
      <RisingChart />

      {/* Top brand logo bar */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-brand-emerald/15 shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-5 flex items-center justify-center">
          <EditableImage
            path="brand.logoUrl"
            alt={brand.name || "logo"}
            className="h-12 md:h-16 w-auto object-contain"
            placeholderClassName="h-16 w-64"
            placeholderLabel="לוגו ראשי"
          />
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Copy column */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-3 rounded-full bg-white/[0.07] backdrop-blur-md px-6 py-3 mb-8 border border-brand-emerald/40 shadow-glow-emerald/30">
              <EditableImage
                path="hero.eyebrowLogoUrl"
                alt="logo"
                className="h-8 md:h-10 w-auto object-contain"
                placeholderClassName="h-10 w-24"
                placeholderLabel="לוגו"
                hideIfEmpty={false}
              />
              {(hero.eyebrowLogoUrl || hero.eyebrow) && (
                <span className="h-6 w-px bg-brand-emerald/40" />
              )}
              <TrendingUp className="size-5 text-brand-emerald-light shrink-0" />
              <EditableText
                path="hero.eyebrow"
                as="span"
                className="text-sm md:text-base font-bold text-brand-mint tracking-wide"
                placeholder="טקסט באדג'"
              />
            </div>

            {/* Main headline */}
            <h1 className="font-extrabold leading-[1] tracking-tight mb-7">
              <EditableText
                path="hero.headline"
                as="span"
                className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                placeholder="כותרת ראשית"
              />
              <EditableText
                path="hero.headlineAccent"
                as="span"
                className="block text-gradient-emerald text-5xl sm:text-7xl md:text-8xl lg:text-9xl mt-3 leading-[0.95] pb-2"
                placeholder="הדגשה"
              />
            </h1>

            <EditableText
              path="hero.subheadline"
              as="p"
              className="text-2xl sm:text-3xl md:text-4xl text-white/95 max-w-2xl mb-5 leading-tight font-bold"
              placeholder="תת-כותרת"
            />

            <EditableText
              path="hero.description"
              as="p"
              className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-2xl mb-10 leading-relaxed font-medium"
              placeholder="תיאור משני"
              hideIfEmpty
            />

            <a href="#register" className="w-full max-w-xl">
              <Button size="2xl" variant="emerald" className="w-full" asChild>
                <span>
                  <EditableText
                    path="hero.ctaText"
                    as="span"
                    className="inline"
                    placeholder="טקסט כפתור"
                  />
                  <span> ←</span>
                </span>
              </Button>
            </a>
            {webinar.spotsLimited && (
              <p className="text-white/60 text-base mt-5 font-medium">
                הרישום ללא עלות · מספר משתתפים מוגבל
              </p>
            )}
          </div>

          {/* Details card column */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="relative rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 shadow-glow-forest overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-brand-mint via-brand-emerald-light to-brand-emerald" />
              <div className="p-7 md:p-9">
                <p className="text-brand-mint text-sm font-bold uppercase tracking-[0.2em] mb-6">
                  פרטי הוובינר
                </p>
                <div className="space-y-5">
                  <DetailRow
                    icon={<Calendar className="size-6" />}
                    title={webinar.dateLabel || webinar.dateShort || "תאריך יעודכן בקרוב"}
                    subtitle={webinar.dayShort}
                  />
                  <DetailRow
                    icon={<Clock className="size-6" />}
                    title={webinar.time || "—"}
                    subtitle="שעון ישראל"
                  />
                  <DetailRow
                    icon={<Video className="size-6" />}
                    title={webinar.venueShort || webinar.venue || "אונליין"}
                    subtitle="מכל מקום, מכל מכשיר"
                  />
                  <DetailRow
                    icon={<Users className="size-6" />}
                    title="ההשתתפות חינם"
                    subtitle="בהרשמה מראש בלבד"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {webinar.dateISO && (
          <div className="mt-16 md:mt-20 max-w-7xl mx-auto">
            <p className="text-center text-white/70 text-base sm:text-lg mb-5 font-bold uppercase tracking-widest">
              הוובינר מתחיל בעוד
            </p>
            <Countdown targetISO={webinar.dateISO} />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </EditableSection>
  );
}

function DetailRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-4 text-start">
      <div className="flex items-center justify-center size-14 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald-light shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-extrabold text-white text-lg md:text-xl leading-snug">{title}</div>
        {subtitle && (
          <div className="text-sm md:text-base text-white/60 font-medium">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

/** Decorative rising line chart, evoking portfolio growth. */
function RisingChart() {
  return (
    <svg
      aria-hidden
      className="absolute bottom-0 inset-x-0 w-full h-56 md:h-80 opacity-30 pointer-events-none"
      viewBox="0 0 1200 320"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="wealth-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wealth-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <path
        d="M0 300 L120 268 L220 282 L340 226 L440 244 L560 176 L660 196 L780 122 L880 142 L1000 66 L1100 84 L1200 24 L1200 320 L0 320 Z"
        fill="url(#wealth-area)"
      />
      <path
        d="M0 300 L120 268 L220 282 L340 226 L440 244 L560 176 L660 196 L780 122 L880 142 L1000 66 L1100 84 L1200 24"
        stroke="url(#wealth-line)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
