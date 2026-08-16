import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function ScAudience({ config }: { config: CampaignConfig }) {
  const audience = config.stepChange?.audience;
  const cards = audience?.cards ?? [];
  if (cards.length === 0) return null;

  return (
    <EditableSection sectionKey="audience" className="bg-[#EFEFEF] text-[#162321] py-[104px]">
      <div className="max-w-[1160px] mx-auto px-6 box-border">
        <EditableText
          path="stepChange.audience.eyebrow"
          as="div"
          className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#5A6E64] mb-5"
          placeholder="שורת פתיחה"
        />
        <EditableText
          path="stepChange.audience.title"
          as="h2"
          multiline
          className="m-0 mb-12 font-black text-[clamp(36px,5.4vw,72px)] leading-[1.07] tracking-[-1.4px] max-w-[20ch] [text-wrap:balance]"
          placeholder="כותרת"
        />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] gap-4">
          {cards.map((c, i) => (
            <blockquote
              key={i}
              className={`m-0 rounded-[20px] px-[26px] py-7 ${
                c.dark ? "bg-[#162321] text-[#EFEFEF]" : "bg-white border border-[#DCE3DF]"
              }`}
            >
              <span
                aria-hidden
                className={`block font-tae text-[44px] leading-[.6] ${
                  c.dark ? "text-[#74DF93]/50" : "text-[#162321]/25"
                }`}
              >
                &quot;
              </span>
              <EditableText
                path={`stepChange.audience.cards.${i}.quote`}
                as="div"
                multiline
                className="font-extrabold text-[clamp(18px,1.9vw,23px)] leading-[1.45] mt-3.5 mb-3"
                placeholder="ציטוט"
              />
              <EditableText
                path={`stepChange.audience.cards.${i}.note`}
                as="cite"
                className={`not-italic text-[15.5px] ${c.dark ? "text-[#74DF93]" : "text-[#4A5C54]"}`}
                placeholder="הערה"
                hideIfEmpty
              />
            </blockquote>
          ))}
        </div>

        <EditableText
          path="stepChange.audience.footnote"
          as="p"
          multiline
          className="mt-11 mx-auto mb-0 text-center max-w-[52ch] text-[clamp(17px,1.8vw,21px)] leading-[1.65] text-[#4A5C54] [text-wrap:pretty]"
          placeholder="הערת סיום"
          hideIfEmpty
        />
      </div>
    </EditableSection>
  );
}
