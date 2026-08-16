import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";
import { ScSquiggle } from "./squiggle";

export function ScBridge({ config }: { config: CampaignConfig }) {
  const bridge = config.stepChange?.bridge;
  if (!bridge) return null;

  return (
    <EditableSection sectionKey="bridge" className="bg-[#162321] text-[#EFEFEF] py-28">
      <div className="max-w-[760px] mx-auto px-6 box-border text-center">
        <EditableText
          path="stepChange.bridge.eyebrow"
          as="div"
          className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#9CAFA5] mb-5"
          placeholder="שורת פתיחה"
        />
        <EditableText
          path="stepChange.bridge.title"
          as="h2"
          multiline
          className="m-0 mb-5 font-black text-[clamp(32px,4.6vw,58px)] leading-[1.14] tracking-[-1px] [text-wrap:balance]"
          placeholder="כותרת"
        />
        <ScSquiggle className="w-[min(76%,420px)] mx-auto my-7" stroke="#74DF93" />
        <EditableText
          path="stepChange.bridge.body1"
          as="p"
          multiline
          className="m-0 mb-6 text-[clamp(17px,1.8vw,21px)] leading-[1.7] text-[#9CAFA5] [text-wrap:pretty]"
          placeholder="פסקה"
        />
        <EditableText
          path="stepChange.bridge.body2"
          as="p"
          multiline
          className="m-0 mb-8 text-[clamp(17px,1.8vw,21px)] leading-[1.7] text-[#9CAFA5] [text-wrap:pretty]"
          placeholder="פסקה"
          hideIfEmpty
        />
        <EditableText
          path="stepChange.bridge.punch"
          as="div"
          className="font-black text-[clamp(24px,3vw,36px)] text-[#74DF93] tracking-[-0.5px]"
          placeholder="משפט מחץ"
        />
      </div>
    </EditableSection>
  );
}
