import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

/** Full-bleed lime band between the perks and registration sections. */
export function ScCtaBand({ config }: { config: CampaignConfig }) {
  if (!config.stepChange?.ctaBand) return null;

  return (
    <EditableSection
      sectionKey="ctaBand"
      className="bg-[#74DF93] text-[#162321] px-6 py-[88px] text-center"
    >
      <div className="max-w-[820px] mx-auto flex flex-col items-center gap-5">
        <EditableText
          path="stepChange.ctaBand.title"
          as="h2"
          multiline
          className="m-0 font-black text-[clamp(36px,5.6vw,74px)] leading-[1.06] tracking-[-1.4px] [text-wrap:balance]"
          placeholder="כותרת"
        />
        <EditableText
          path="stepChange.ctaBand.body"
          as="p"
          multiline
          className="m-0 text-[clamp(17px,1.8vw,21px)] leading-[1.6] font-medium max-w-[44ch]"
          placeholder="פסקה"
          hideIfEmpty
        />
        <a
          href="#register"
          className="bg-[#162321] hover:bg-[#0C1513] hover:text-[#A1F0B8] transition-colors text-[#74DF93] font-extrabold text-[clamp(18px,1.7vw,21px)] px-[46px] py-5 rounded-full"
        >
          <EditableText path="stepChange.ctaBand.cta" as="span" placeholder="טקסט כפתור" />{" "}
          <span aria-hidden>&#8592;</span>
        </a>
        <EditableText
          path="stepChange.ctaBand.note"
          as="span"
          className="text-sm text-[#162321]/70"
          placeholder="הערה"
          hideIfEmpty
        />
      </div>
    </EditableSection>
  );
}
