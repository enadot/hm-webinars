import { EditableText } from "@/components/editable/text";
import { EditableImage } from "@/components/editable/image";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

/**
 * Speaker blocks. Portrait, name, role and bio come from speakers.list; the
 * oversized badge number, meta line and pull-quote come from
 * stepChange.speakerCards at the same index.
 */
export function ScSpeakers({ config }: { config: CampaignConfig }) {
  const list = config.speakers.list;
  const cards = config.stepChange?.speakerCards ?? [];
  if (list.length === 0) return null;

  return (
    <EditableSection sectionKey="speakers" className="bg-[#162321] text-[#EFEFEF] py-[104px]">
      <div className="max-w-[1160px] mx-auto px-6 box-border">
        <EditableText
          path="stepChange.speakersEyebrow"
          as="div"
          className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#9CAFA5] mb-12"
          placeholder="שורת פתיחה"
        />

        {list.map((s, i) => (
          <div
            key={i}
            className={`grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-12 items-center ${
              i > 0 ? "mt-[72px] pt-[56px] border-t border-white/[0.12]" : ""
            }`}
          >
            <div className="relative justify-self-center w-[min(100%,380px)]">
              <EditableText
                path={`stepChange.speakerCards.${i}.badge`}
                as="div"
                className="font-tae font-semibold text-[clamp(90px,11vw,160px)] leading-[.85] text-[#74DF93]/90 relative z-0 -mb-[42px] pr-2"
                placeholder="20+"
                hideIfEmpty
              />
              <div className="relative z-[1] rounded-3xl overflow-hidden border border-[#74DF93]/30 aspect-[4/5] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                <EditableImage
                  path={`speakers.list.${i}.photoUrl`}
                  alt={s.name || "מרצה"}
                  className="block w-full h-full object-cover object-[50%_15%]"
                  placeholderClassName="w-full h-full"
                  placeholderLabel="תמונת מרצה"
                  hideIfEmpty={false}
                />
              </div>
            </div>

            <div>
              <EditableText
                path={`speakers.list.${i}.name`}
                as="h3"
                className="m-0 mb-2 font-black text-[clamp(34px,4.6vw,60px)] leading-[1.05] tracking-[-1px]"
                placeholder="שם המרצה"
              />
              <EditableText
                path={`speakers.list.${i}.role`}
                as="div"
                className="text-[#74DF93] font-bold text-[clamp(17px,1.7vw,20px)] mb-2"
                placeholder="תפקיד"
              />
              <EditableText
                path={`stepChange.speakerCards.${i}.meta`}
                as="div"
                className="text-[15px] text-[#9CAFA5] mb-[22px]"
                placeholder="שורת ניסיון"
                hideIfEmpty
              />
              <EditableText
                path={`speakers.list.${i}.bio`}
                as="p"
                multiline
                className="m-0 mb-6 text-[#9CAFA5] text-[clamp(16px,1.7vw,19px)] leading-[1.75] max-w-[54ch]"
                placeholder="ביוגרפיה"
              />
              <EditableText
                path={`stepChange.speakerCards.${i}.punch`}
                as="div"
                multiline
                className="border-r-[3px] border-[#74DF93] pr-4 font-extrabold text-[clamp(18px,1.9vw,22px)] leading-[1.5] max-w-[44ch]"
                placeholder="משפט מחץ"
                hideIfEmpty
              />
            </div>
          </div>
        ))}
      </div>
    </EditableSection>
  );
}
