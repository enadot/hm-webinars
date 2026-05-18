import { Card, CardContent } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { EditableText } from "@/components/editable/text";
import {
  EditableItemControls,
  EditableItemWrapper,
  EditableAddItem,
} from "@/components/editable/list";
import type { CampaignConfig, Bullet } from "@/lib/campaign-schema";

const GRADIENTS = [
  "from-blue-500 to-brand-primary",
  "from-emerald-500 to-teal-700",
  "from-brand-purple-2 to-brand-purple",
  "from-brand-gold-light to-amber-600",
  "from-rose-500 to-pink-700",
  "from-sky-500 to-cyan-700",
];

const NEW_BULLET: Bullet = {
  title: "",
  body: "",
  icon: "Sparkles",
};

export function BoldBullets({ config }: { config: CampaignConfig }) {
  const { bullets } = config;

  return (
    <section className="relative py-20 md:py-28 lg:py-32 bg-brand-dark text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-brand-gold/15 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-gold-light bg-brand-gold/15 border border-brand-gold/30 px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
            <EditableText path="bullets.eyebrow" as="span" placeholder="באדג'" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
            <EditableText path="bullets.title" as="span" placeholder="כותרת" />
            <br />
            <EditableText
              path="bullets.titleAccent"
              as="span"
              className="text-gradient-gold"
              placeholder="כותרת מודגשת"
              hideIfEmpty
            />
          </h2>
          <EditableText
            path="bullets.intro"
            as="p"
            className="text-xl md:text-2xl text-white/70 leading-relaxed"
            placeholder="תיאור משני"
            hideIfEmpty
          />
        </div>

        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-5 lg:gap-7">
            {bullets.items.map((item, i) => (
              <EditableItemWrapper key={i}>
                <EditableItemControls listPath="bullets.items" index={i} />
                <BulletCard bullet={item} index={i} />
              </EditableItemWrapper>
            ))}
          </div>

          <div className="max-w-md mx-auto pt-4">
            <EditableAddItem listPath="bullets.items" defaultItem={NEW_BULLET} label="הוסף בולט" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BulletCard({ bullet, index }: { bullet: Bullet; index: number }) {
  const IconComponent =
    (Icons[bullet.icon as keyof typeof Icons] as React.FC<{ className?: string }>) || Icons.Sparkles;
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const base = `bullets.items.${index}`;

  return (
    <Card className="group relative border-2 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/[0.08] hover:border-brand-gold/40 transition-all duration-500 overflow-hidden hover:-translate-y-1">
      <CardContent className="p-7 md:p-9 flex gap-6 items-start">
        <div className="shrink-0">
          <div
            className={`relative flex items-center justify-center size-20 md:size-24 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-2xl`}
          >
            <IconComponent className="size-10 md:size-12" />
            <span className="absolute -top-2 -left-2 size-9 rounded-full bg-brand-dark border-2 border-brand-gold text-brand-gold-light text-base font-extrabold flex items-center justify-center">
              {index + 1}
            </span>
          </div>
        </div>
        <div className="flex-1 pt-1">
          <EditableText
            path={`${base}.title`}
            as="h3"
            className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight"
            placeholder="כותרת"
          />
          <EditableText
            path={`${base}.body`}
            as="p"
            multiline
            className="text-lg md:text-xl text-white/75 leading-relaxed"
            placeholder="תוכן"
          />
        </div>
      </CardContent>
    </Card>
  );
}
