import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function ScProof({ config }: { config: CampaignConfig }) {
  const proof = config.stepChange?.proof;
  const items = proof?.items ?? [];
  if (items.length === 0) return null;

  return (
    <EditableSection sectionKey="proof" className="bg-[#162321] text-[#EFEFEF] py-24">
      <div className="max-w-[1160px] mx-auto px-6 box-border">
        <EditableText
          path="stepChange.proof.eyebrow"
          as="div"
          className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#9CAFA5] mb-5"
          placeholder="שורת פתיחה"
        />
        <EditableText
          path="stepChange.proof.title"
          as="h2"
          multiline
          className="m-0 mb-12 font-black text-[clamp(30px,4.2vw,54px)] leading-[1.12] tracking-[-1px] max-w-[26ch] [text-wrap:balance]"
          placeholder="כותרת"
        />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-8">
          {items.map((_, i) => (
            <div key={i} className="border-t-2 border-[#74DF93]/60 pt-5">
              <EditableText
                path={`stepChange.proof.items.${i}.value`}
                as="div"
                className="font-tae font-semibold text-[clamp(24px,2.6vw,34px)] text-[#74DF93] mb-3"
                placeholder="נתון"
              />
              <EditableText
                path={`stepChange.proof.items.${i}.label`}
                as="div"
                multiline
                className="text-[#9CAFA5] text-[clamp(15.5px,1.6vw,17.5px)] leading-[1.65]"
                placeholder="תיאור"
              />
            </div>
          ))}
        </div>

        <EditableText
          path="stepChange.proof.testimonials"
          as="div"
          multiline
          className="mt-9 border border-dashed border-white/20 rounded-2xl px-[22px] py-5 font-tae text-[13.5px] text-[#9CAFA5] leading-[1.7]"
          placeholder="אזור המלצות משתתפים"
          hideIfEmpty
        />
        <EditableText
          path="stepChange.proof.punch"
          as="div"
          className="mt-8 font-extrabold text-[clamp(19px,2.1vw,26px)]"
          placeholder="משפט מחץ"
          hideIfEmpty
        />
      </div>
    </EditableSection>
  );
}
