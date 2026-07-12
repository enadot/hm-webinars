import { LineChart, PiggyBank, TrendingUp } from "lucide-react";
import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

type Intro = NonNullable<CampaignConfig["intro"]>;

export function WealthIntro({ intro }: { intro: Intro }) {
  return (
    <EditableSection
      sectionKey="intro"
      className="relative py-20 md:py-28 lg:py-32 bg-gradient-to-b from-emerald-50/60 to-white overflow-hidden"
    >
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-mint/20 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-emerald-700 bg-brand-emerald/10 border border-brand-emerald/25 px-5 py-2 rounded-full mb-8 uppercase tracking-wider">
            <TrendingUp className="size-5" />
            <EditableText path="intro.eyebrow" as="span" placeholder="באדג' עליון" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-forest mb-8 leading-[1.05] tracking-tight">
            <EditableText path="intro.title" as="span" multiline placeholder="כותרת" />
            <br />
            <EditableText
              path="intro.titleAccent"
              as="span"
              className="text-gradient-emerald"
              placeholder="כותרת מודגשת"
            />
          </h2>

          <EditableText
            path="intro.body"
            as="p"
            multiline
            className="text-xl sm:text-2xl md:text-3xl text-brand-forest/75 leading-[1.5] mb-14 font-medium max-w-4xl mx-auto"
            placeholder="גוף הטקסט"
          />

          {intro.highlights.length > 0 && (
            <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
              {intro.highlights.map((h, i) => (
                <FeatureBlock
                  key={i}
                  icon={i === 0 ? <LineChart className="size-10" /> : <PiggyBank className="size-10" />}
                  title={h.title}
                  subtitle={h.subtitle}
                  tone={i % 2 === 0 ? "deep" : "light"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </EditableSection>
  );
}

function FeatureBlock({
  icon,
  title,
  subtitle,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "deep" | "light";
}) {
  const iconBg =
    tone === "deep"
      ? "bg-gradient-to-br from-brand-forest-2 to-brand-forest text-brand-mint"
      : "bg-gradient-to-br from-brand-emerald-light to-brand-emerald text-brand-forest";

  return (
    <div className="flex items-center gap-5 p-6 md:p-7 rounded-3xl bg-white border-2 border-emerald-100 hover:border-brand-emerald/40 hover:-translate-y-1 transition-all duration-300 text-start shadow-sm hover:shadow-card-lift-green">
      <div className={`flex items-center justify-center size-20 rounded-2xl shrink-0 shadow-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl md:text-2xl font-extrabold text-brand-forest mb-1">{title}</div>
        <div className="text-base md:text-lg text-muted-foreground font-medium leading-snug">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
