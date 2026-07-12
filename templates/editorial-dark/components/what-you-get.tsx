import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import {
  EditableItemControls,
  EditableItemWrapper,
  EditableAddItem,
} from "@/components/editable/list";
import type { CampaignConfig, Bullet } from "@/lib/campaign-schema";

const NEW_BULLET: Bullet = { title: "", body: "", icon: "Sparkles" };

export function EdWhatYouGet({ config }: { config: CampaignConfig }) {
  const { bullets } = config;

  return (
    <EditableSection sectionKey="bullets" className="bg-white text-[#0a0b0d] py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <EditableText
          path="bullets.eyebrow"
          as="div"
          className="font-mono text-xs tracking-[2px] text-[#7c828a] mb-4"
          placeholder="02 — תווית"
        />
        <h2 className="m-0 mb-3 font-medium text-[clamp(28px,3.8vw,48px)] leading-[1.14] tracking-[-0.8px] max-w-[20ch] [text-wrap:pretty]">
          <EditableText path="bullets.title" as="span" placeholder="כותרת" />{" "}
          <EditableText
            path="bullets.titleAccent"
            as="span"
            className="text-[#0052ff]"
            placeholder="הדגשה"
            hideIfEmpty
          />
        </h2>
        <EditableText
          path="bullets.intro"
          as="p"
          className="m-0 mb-14 text-[#5b616e] text-[17px] max-w-[52ch]"
          placeholder="תיאור משני"
          hideIfEmpty
        />

        <div className="flex flex-col">
          {bullets.items.map((_, i) => (
            <EditableItemWrapper key={i}>
              <EditableItemControls listPath="bullets.items" index={i} />
              <div className="grid grid-cols-[minmax(48px,64px)_1fr] md:grid-cols-[minmax(64px,120px)_minmax(0,1.1fr)_minmax(0,1.6fr)] gap-y-2 gap-x-7 items-baseline py-6 border-t border-[#dee1e6] hover:bg-[#f7f7f7] transition-colors">
                <span className="font-mono text-[clamp(24px,3vw,40px)] font-medium text-[#0052ff]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <EditableText
                  path={`bullets.items.${i}.title`}
                  as="span"
                  className="font-bold text-[clamp(17px,1.9vw,22px)] leading-[1.3]"
                  placeholder="כותרת שורה"
                />
                <EditableText
                  path={`bullets.items.${i}.body`}
                  as="span"
                  multiline
                  className="text-[#5b616e] text-[15.5px] leading-[1.6] col-start-2 md:col-start-auto"
                  placeholder="פירוט"
                />
              </div>
            </EditableItemWrapper>
          ))}
          <div className="border-t border-[#dee1e6]" />
        </div>

        <div className="max-w-md mt-4">
          <EditableAddItem listPath="bullets.items" defaultItem={NEW_BULLET} label="הוסף שורה" />
        </div>

        <EditableText
          path="editorial.getFootnote"
          as="p"
          className="m-0 mt-7 text-[14.5px] text-[#7c828a]"
          placeholder="הערת סיום"
          hideIfEmpty
        />
      </div>
    </EditableSection>
  );
}
