import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { EditableText } from "@/components/editable/text";
import { EditableImage } from "@/components/editable/image";
import { EditableSection } from "@/components/editable/section";
import {
  EditableItemControls,
  EditableItemWrapper,
  EditableAddItem,
} from "@/components/editable/list";
import type { CampaignConfig, Speaker } from "@/lib/campaign-schema";

const NEW_SPEAKER: Speaker = {
  name: "",
  role: "",
  bio: "",
  photoUrl: "",
  logoUrl: "",
  accent: "primary",
  highlights: [],
};

export function BoldSpeakers({ config }: { config: CampaignConfig }) {
  const { speakers } = config;

  return (
    <EditableSection sectionKey="speakers" className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
            <EditableText path="speakers.eyebrow" as="span" placeholder="באדג'" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark mb-6 leading-[1.05] tracking-tight">
            <EditableText path="speakers.title" as="span" placeholder="כותרת" />
            <br />
            <EditableText
              path="speakers.titleAccent"
              as="span"
              className="text-gradient-gold"
              placeholder="כותרת מודגשת"
              hideIfEmpty
            />
          </h2>
          <EditableText
            path="speakers.intro"
            as="p"
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
            placeholder="תיאור משני"
            hideIfEmpty
          />
        </div>

        <div className="space-y-6">
          <div
            className={`grid ${
              speakers.list.length > 1 ? "md:grid-cols-2" : ""
            } gap-8 lg:gap-10 max-w-7xl mx-auto`}
          >
            {speakers.list.map((s, i) => (
              <EditableItemWrapper key={i}>
                <EditableItemControls listPath="speakers.list" index={i} />
                <SpeakerCard speaker={s} index={i} />
              </EditableItemWrapper>
            ))}
          </div>

          <div className="max-w-md mx-auto pt-4">
            <EditableAddItem
              listPath="speakers.list"
              defaultItem={NEW_SPEAKER}
              label="הוסף מרצה"
            />
          </div>
        </div>
      </div>
    </EditableSection>
  );
}

function SpeakerCard({ speaker, index }: { speaker: Speaker; index: number }) {
  const base = `speakers.list.${index}`;

  const accentBar =
    speaker.accent === "gold"
      ? "bg-gradient-to-r from-brand-gold-light to-brand-gold"
      : speaker.accent === "purple"
      ? "bg-gradient-to-r from-brand-purple-2 to-brand-purple"
      : "bg-gradient-to-r from-brand-primary-2 to-brand-primary";

  const photoBg =
    speaker.accent === "gold"
      ? "bg-gradient-to-br from-brand-gold-light via-brand-gold to-amber-600"
      : speaker.accent === "purple"
      ? "bg-gradient-to-br from-brand-primary via-brand-primary-2 to-brand-purple"
      : "bg-gradient-to-br from-brand-primary via-brand-primary-2 to-brand-primary";

  const chipClass =
    speaker.accent === "gold"
      ? "bg-brand-gold/10 text-brand-dark border-brand-gold/40"
      : "bg-brand-purple/10 text-brand-purple border-brand-purple/30";

  const roleClass = speaker.accent === "gold" ? "text-amber-600" : "text-brand-purple";

  return (
    <Card className="group overflow-hidden border-0 shadow-card-lift hover:shadow-glow-brand transition-all duration-500 hover:-translate-y-2 rounded-3xl">
      <div className={`h-2 w-full ${accentBar}`} />
      <CardContent className="p-0">
        <div className={`relative ${photoBg} px-6 pt-10 pb-8 overflow-hidden`}>
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="relative aspect-[4/5] max-h-96 mx-auto rounded-2xl overflow-hidden bg-white shadow-2xl ring-4 ring-white/30">
            <EditableImage
              path={`${base}.photoUrl`}
              alt={speaker.name}
              className="w-full h-full object-cover"
              placeholderClassName="w-full h-full"
              placeholderLabel="תמונת מרצה"
              hideIfEmpty={false}
            />
          </div>
        </div>
        <div className="p-8 md:p-10">
          <EditableText
            path={`${base}.name`}
            as="h3"
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-dark mb-2 tracking-tight"
            placeholder="שם המרצה"
          />
          <EditableText
            path={`${base}.role`}
            as="p"
            className={`text-lg md:text-xl font-bold mb-5 ${roleClass}`}
            placeholder="תפקיד"
          />
          <EditableText
            path={`${base}.bio`}
            as="p"
            multiline
            className="text-lg md:text-xl text-muted-foreground leading-[1.65] mb-7"
            placeholder="ביוגרפיה"
          />
          {speaker.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {speaker.highlights.map((h, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-2 text-sm md:text-base font-bold px-4 py-2 rounded-full border-2 ${chipClass}`}
                >
                  <Award className="size-5" />
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
