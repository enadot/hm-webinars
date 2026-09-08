import { EditableText } from "@/components/editable/text";
import { EditableImage } from "@/components/editable/image";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

/**
 * Speaker blocks. Portrait, name, role and bio come from speakers.list; the
 * oversized badge number, meta line and pull-quote come from
 * stepChange.speakerCards at the same index.
 *
 * From tablet up each speaker is a two-column spread: large portrait beside
 * the text. On phones that made every speaker a full-width 4:5 photo, three
 * screens for three people, so there the portrait shrinks to a thumbnail
 * beside the name and role, with the bio and pull-quote running full width
 * underneath. The giant badge number only exists on the wide layout; the
 * meta line already carries the same fact.
 */
export function ScSpeakers({ config }: { config: CampaignConfig }) {
  const list = config.speakers.list;
  const cards = config.stepChange?.speakerCards ?? [];
  if (list.length === 0) return null;

  return (
    <EditableSection sectionKey="speakers" className="bg-[#162321] text-[#EFEFEF] py-16 md:py-[104px]">
      <div className="max-w-[1160px] mx-auto px-5 md:px-6 box-border">
        <EditableText
          path="stepChange.speakersEyebrow"
          as="div"
          className="font-tae text-[12px] md:text-[clamp(13px,1.3vw,15px)] tracking-[1.5px] md:tracking-[2.5px] text-[#9CAFA5] mb-4 md:mb-5"
          placeholder="שורת פתיחה"
        />
        <EditableText
          path="stepChange.speakersTitle"
          as="h2"
          multiline
          className="m-0 mb-8 md:mb-12 font-black text-[30px] md:text-[clamp(34px,4.8vw,64px)] leading-[1.1] md:leading-[1.08] tracking-[-0.8px] md:tracking-[-1.2px] [text-wrap:balance]"
          placeholder="כותרת הסקציה"
          hideIfEmpty
        />

        {list.map((s, i) => (
          <div
            key={i}
            className={`grid grid-cols-[96px_1fr] gap-x-4 gap-y-4 items-start md:grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] md:gap-12 md:items-center ${
              i > 0 ? "mt-10 pt-8 md:mt-[72px] md:pt-[56px] border-t border-white/[0.12]" : ""
            }`}
          >
            <div className="relative w-full md:justify-self-center md:w-[min(100%,380px)]">
              <EditableText
                path={`stepChange.speakerCards.${i}.badge`}
                as="div"
                className="hidden md:block font-tae font-semibold text-[clamp(90px,11vw,160px)] leading-[.85] text-[#74DF93]/90 relative z-0 -mb-[42px] pr-2"
                placeholder="20+"
                hideIfEmpty
              />
              <div className="relative z-[1] rounded-2xl md:rounded-3xl overflow-hidden border border-[#74DF93]/30 aspect-[4/5] shadow-[0_12px_30px_rgba(0,0,0,0.4)] md:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
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

            {/* `contents` on phones lets the name block and the body block
                place themselves in the grid separately; from md up this is
                one ordinary text column beside the portrait. */}
            <div className="contents md:block">
              <div className="self-center md:self-auto min-w-0">
                <EditableText
                  path={`speakers.list.${i}.name`}
                  as="h3"
                  className="m-0 mb-1 md:mb-2 font-black text-[24px] md:text-[clamp(34px,4.6vw,60px)] leading-[1.1] md:leading-[1.05] tracking-[-0.5px] md:tracking-[-1px]"
                  placeholder="שם המרצה"
                />
                <EditableText
                  path={`speakers.list.${i}.role`}
                  as="div"
                  className="text-[#74DF93] font-bold text-[15px] md:text-[clamp(17px,1.7vw,20px)] leading-[1.35] mb-1 md:mb-2"
                  placeholder="תפקיד"
                />
                <EditableText
                  path={`stepChange.speakerCards.${i}.meta`}
                  as="div"
                  className="text-[13px] md:text-[15px] text-[#9CAFA5] md:mb-[22px]"
                  placeholder="שורת ניסיון"
                  hideIfEmpty
                />
              </div>
              <div className="col-span-2 md:col-auto min-w-0">
                <EditableText
                  path={`speakers.list.${i}.bio`}
                  as="p"
                  multiline
                  className="m-0 mb-4 md:mb-6 text-[#9CAFA5] text-[16px] md:text-[clamp(16px,1.7vw,19px)] leading-[1.7] md:leading-[1.75] max-w-[54ch]"
                  placeholder="ביוגרפיה"
                />
                <EditableText
                  path={`stepChange.speakerCards.${i}.punch`}
                  as="div"
                  multiline
                  className="border-r-[3px] border-[#74DF93] pr-3.5 md:pr-4 font-extrabold text-[17px] md:text-[clamp(18px,1.9vw,22px)] leading-[1.5] max-w-[44ch]"
                  placeholder="משפט מחץ"
                  hideIfEmpty
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </EditableSection>
  );
}
