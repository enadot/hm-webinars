import { ShieldCheck, Lightbulb, TrendingUp } from "lucide-react";
import { EditableText } from "@/components/editable/text";
import type { CampaignConfig } from "@/lib/campaign-schema";

type Intro = NonNullable<CampaignConfig["intro"]>;

export function BoldIntro({ intro }: { intro: Intro }) {
  return (
    <section className="relative py-20 md:py-28 lg:py-32 bg-white overflow-hidden">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-5 py-2 rounded-full mb-8 uppercase tracking-wider">
            <TrendingUp className="size-5" />
            <EditableText path="intro.eyebrow" as="span" placeholder="באדג' עליון" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark mb-8 leading-[1.05] tracking-tight">
            <EditableText path="intro.title" as="span" multiline placeholder="כותרת" />
            {(intro.titleAccent || true) && (
              <>
                <br />
                <EditableText
                  path="intro.titleAccent"
                  as="span"
                  className="text-gradient-gold"
                  placeholder="כותרת מודגשת"
                />
              </>
            )}
          </h2>

          <EditableText
            path="intro.body"
            as="p"
            multiline
            className="text-xl sm:text-2xl md:text-3xl text-brand-ink/80 leading-[1.5] mb-14 font-medium max-w-4xl mx-auto"
            placeholder="גוף הטקסט"
          />

          {intro.highlights.length > 0 && (
            <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
              {intro.highlights.map((h, i) => (
                <FeatureBlock
                  key={i}
                  icon={i === 0 ? <ShieldCheck className="size-10" /> : <Lightbulb className="size-10" />}
                  title={h.title}
                  subtitle={h.subtitle}
                  color={i === 0 ? "primary" : "gold"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureBlock({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: "primary" | "gold";
}) {
  const iconBg =
    color === "gold"
      ? "bg-gradient-to-br from-brand-gold-light to-brand-gold text-brand-dark"
      : "bg-gradient-to-br from-brand-primary-2 to-brand-primary text-white";

  return (
    <div className="flex items-center gap-5 p-6 md:p-7 rounded-3xl bg-slate-50 border-2 border-slate-200/80 hover:border-brand-gold/40 hover:bg-white hover:-translate-y-1 transition-all duration-300 text-start shadow-sm hover:shadow-card-lift">
      <div className={`flex items-center justify-center size-20 rounded-2xl shrink-0 shadow-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl md:text-2xl font-extrabold text-brand-dark mb-1">{title}</div>
        <div className="text-base md:text-lg text-muted-foreground font-medium leading-snug">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
