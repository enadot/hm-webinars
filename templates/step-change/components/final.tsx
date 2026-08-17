import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";
import { ScSquiggle } from "./squiggle";

/** Closing CTA plus the legal footer. */
export function ScFinal({ config }: { config: CampaignConfig }) {
  if (!config.stepChange?.final) return null;

  return (
    <EditableSection
      sectionKey="final"
      className="bg-[#162321] text-[#EFEFEF] pt-[100px] pb-10 text-center"
    >
      <div className="max-w-[860px] mx-auto px-6 box-border flex flex-col items-center gap-[22px]">
        <h2 className="m-0 font-black text-[clamp(38px,5.6vw,76px)] leading-[1.06] tracking-[-1.4px] [text-wrap:balance]">
          <EditableText path="stepChange.final.title" as="span" multiline placeholder="כותרת" />
          {/* The accent line always starts a new line, as in the approved design. */}
          {config.stepChange.final.titleAccent ? <br /> : " "}
          <EditableText
            path="stepChange.final.titleAccent"
            as="span"
            className="text-[#74DF93]"
            placeholder="הדגשה"
            hideIfEmpty
          />
        </h2>
        <ScSquiggle className="w-[min(64%,340px)] mx-auto" stroke="#74DF93" width={5.5} arrow />
        <EditableText
          path="stepChange.final.mono"
          as="div"
          className="font-tae text-[clamp(14px,1.5vw,17px)] text-[#9CAFA5] tracking-[1px]"
          placeholder="שורת פרטים"
          hideIfEmpty
        />
        <a
          href="#register"
          className="bg-[#74DF93] hover:bg-[#A1F0B8] transition-colors text-[#162321] font-extrabold text-[clamp(18px,1.7vw,21px)] px-[46px] py-5 rounded-full"
        >
          <EditableText path="stepChange.final.cta" as="span" placeholder="טקסט כפתור" />{" "}
          <span aria-hidden>&#8592;</span>
        </a>
      </div>

      <div className="max-w-[900px] mx-auto mt-16 px-6 pt-7 box-border border-t border-white/10 flex flex-col gap-3.5 text-center">
        <EditableText
          path="stepChange.final.credit"
          as="div"
          className="text-sm text-[#9CAFA5]"
          placeholder="קרדיט"
          hideIfEmpty
        />
        <EditableText
          path="stepChange.final.legal"
          as="div"
          multiline
          className="text-[12.5px] text-[#9CAFA5] leading-[1.7] max-w-[78ch] mx-auto"
          placeholder="גילוי נאות"
          hideIfEmpty
        />
        <EditableText
          path="stepChange.final.copyright"
          as="div"
          className="text-[12.5px] text-[#9CAFA5]"
          placeholder="זכויות יוצרים"
          hideIfEmpty
        />
        {/* Breathing room above the mobile sticky CTA. */}
        <div aria-hidden className="h-[104px] md:h-0" />
      </div>
    </EditableSection>
  );
}
