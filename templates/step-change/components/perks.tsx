import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function ScPerks({ config }: { config: CampaignConfig }) {
  const perks = config.stepChange?.perks;
  const items = perks?.items ?? [];
  if (!perks) return null;

  return (
    <EditableSection
      sectionKey="perks"
      className="bg-[#162321] text-[#EFEFEF] border-t border-white/[0.08] py-[100px]"
    >
      <div className="max-w-[1160px] mx-auto px-6 box-border grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-12 items-start">
        <div>
          <EditableText
            path="stepChange.perks.eyebrow"
            as="div"
            className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#9CAFA5] mb-5"
            placeholder="שורת פתיחה"
          />
          <h2 className="m-0 mb-6 font-black text-[clamp(34px,5vw,66px)] leading-[1.06] tracking-[-1.2px] [text-wrap:balance]">
            <EditableText path="stepChange.perks.title" as="span" placeholder="כותרת" />{" "}
            <EditableText
              path="stepChange.perks.titleAccent"
              as="span"
              className="text-[#74DF93]"
              placeholder="הדגשה"
              hideIfEmpty
            />
          </h2>
          <EditableText
            path="stepChange.perks.body1"
            as="p"
            multiline
            className="m-0 mb-5 text-[#9CAFA5] text-[clamp(16px,1.7vw,19px)] leading-[1.75] max-w-[48ch]"
            placeholder="פסקה"
          />
          <EditableText
            path="stepChange.perks.body2"
            as="p"
            multiline
            className="m-0 mb-7 text-[#9CAFA5] text-[clamp(16px,1.7vw,19px)] leading-[1.75] max-w-[48ch]"
            placeholder="פסקה"
            hideIfEmpty
          />
          <div className="flex flex-col gap-2.5 items-start">
            <a
              href="#register"
              className="bg-[#74DF93] hover:bg-[#A1F0B8] transition-colors text-[#162321] font-extrabold text-[clamp(17px,1.7vw,20px)] px-[38px] py-[19px] rounded-full"
            >
              <EditableText path="stepChange.perks.cta" as="span" placeholder="טקסט כפתור" />{" "}
              <span aria-hidden>&#8592;</span>
            </a>
            <EditableText
              path="stepChange.perks.ctaNote"
              as="span"
              className="text-[13.5px] text-[#9CAFA5]"
              placeholder="הערה"
              hideIfEmpty
            />
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {items.map((it, i) => (
            <div
              key={i}
              className={
                it.highlight
                  ? "border border-[#74DF93] border-r-[5px] rounded-[18px] p-6 bg-[#74DF93]/[0.08]"
                  : "border border-white/[0.12] rounded-[18px] p-6 bg-[#273533]"
              }
            >
              <EditableText
                path={`stepChange.perks.items.${i}.n`}
                as="div"
                className="font-tae font-semibold text-[15px] text-[#74DF93] mb-2.5"
                placeholder="01"
              />
              <EditableText
                path={`stepChange.perks.items.${i}.title`}
                as="div"
                className="font-extrabold text-[clamp(19px,1.9vw,22px)] mb-2"
                placeholder="כותרת"
              />
              <EditableText
                path={`stepChange.perks.items.${i}.body`}
                as="div"
                multiline
                className="text-[#9CAFA5] text-[16.5px] leading-[1.65]"
                placeholder="תיאור"
                hideIfEmpty
              />
            </div>
          ))}
          <EditableText
            path="stepChange.perks.note"
            as="div"
            className="text-sm text-[#9CAFA5] leading-[1.6]"
            placeholder="הערה"
            hideIfEmpty
          />
        </div>
      </div>
    </EditableSection>
  );
}
