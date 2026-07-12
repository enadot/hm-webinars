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
    <EditableSection sectionKey="bullets" className="bg-white text-[#0a0b0d] py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-10 h-px bg-[#0052ff]" />
          <EditableText
            path="bullets.eyebrow"
            as="div"
            className="font-tam text-sm tracking-[2px] text-[#7c828a]"
            placeholder="02 — תווית"
          />
        </div>
        <h2 className="m-0 mb-4 font-medium text-[clamp(32px,4.6vw,62px)] leading-[1.12] tracking-[-0.9px] max-w-[20ch] [text-wrap:pretty]">
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
          className="m-0 mb-16 text-[#5b616e] text-[clamp(17px,1.8vw,22px)] leading-[1.6] max-w-[52ch]"
          placeholder="תיאור משני"
          hideIfEmpty
        />

        <div className="flex flex-col">
          {bullets.items.map((_, i) => (
            <EditableItemWrapper key={i}>
              <EditableItemControls listPath="bullets.items" index={i} />
              <div className="group grid grid-cols-[auto_1fr] md:grid-cols-[minmax(80px,130px)_minmax(0,1.05fr)_minmax(0,1.55fr)] gap-y-2.5 gap-x-8 items-baseline py-8 md:py-9 px-4 -mx-4 border-t border-[#dee1e6] border-r-[3px] border-r-transparent hover:border-r-[#0052ff] hover:bg-[#f7f8fa] transition-all duration-300 rounded-sm">
                <span className="font-tam text-[clamp(30px,3.6vw,54px)] font-semibold leading-none text-[#0052ff] opacity-90 group-hover:opacity-100 transition-opacity">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <EditableText
                  path={`bullets.items.${i}.title`}
                  as="span"
                  className="font-bold text-[clamp(19px,2.2vw,28px)] leading-[1.3] [text-wrap:pretty]"
                  placeholder="כותרת שורה"
                />
                <EditableText
                  path={`bullets.items.${i}.body`}
                  as="span"
                  multiline
                  className="text-[#5b616e] text-[clamp(16px,1.7vw,20px)] leading-[1.65] col-start-2 md:col-start-auto"
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

        <div className="mt-9 flex items-center gap-3">
          <span className="font-tam text-[#0052ff] text-xl leading-none select-none" aria-hidden>
            +
          </span>
          <EditableText
            path="editorial.getFootnote"
            as="p"
            className="m-0 text-[clamp(15px,1.5vw,18px)] text-[#5b616e] font-medium"
            placeholder="הערת סיום"
            hideIfEmpty
          />
        </div>
      </div>
    </EditableSection>
  );
}
