import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import {
  EditableItemControls,
  EditableItemWrapper,
  EditableAddItem,
} from "@/components/editable/list";
import type { CampaignConfig } from "@/lib/campaign-schema";

// Tag colors cycle in the order of the original design: changing / disappearing /
// created / growing.
const TAG_COLORS = ["text-[#f4b000]", "text-[#cf202f]", "text-[#3d7bff]", "text-[#05b169]"];

export function EdAi({ config }: { config: CampaignConfig }) {
  const cards = config.editorial?.ai?.cards ?? [];

  return (
    <EditableSection sectionKey="ed-ai" className="bg-[#0a0b0d] text-white py-24 lg:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <EditableText
          path="editorial.ai.label"
          as="div"
          className="font-tam text-sm tracking-[2px] text-[#7c828a] mb-4"
          placeholder="03 — תווית"
        />
        <h2 className="m-0 mb-7 font-medium text-[clamp(36px,5.6vw,78px)] leading-[1.1] tracking-[-1.2px] max-w-[18ch] [text-wrap:pretty]">
          <EditableText
            path="editorial.ai.titleAccent"
            as="span"
            className="text-[#3d7bff]"
            placeholder="AI"
            hideIfEmpty
          />{" "}
          <EditableText path="editorial.ai.title" as="span" placeholder="כותרת" />
          <br />
          <EditableText path="editorial.ai.title2" as="span" placeholder="שורה שנייה" hideIfEmpty />
        </h2>
        <div className="grid lg:grid-cols-2 gap-12 items-start mt-10">
          <div className="text-[clamp(18px,2vw,24px)] leading-[1.7] text-[#a8acb3] max-w-[44ch]">
            <EditableText
              path="editorial.ai.body1"
              as="p"
              multiline
              className="m-0 mb-3.5"
              placeholder="פסקה ראשונה"
            />
            <EditableText
              path="editorial.ai.body2"
              as="p"
              multiline
              className="m-0 mb-3.5"
              placeholder="פסקה שנייה"
              hideIfEmpty
            />
            <EditableText
              path="editorial.ai.body3"
              as="p"
              multiline
              className="m-0 text-[#e6e8eb]"
              placeholder="פסקה שלישית"
              hideIfEmpty
            />
          </div>

          {/* Transformation cards */}
          <div>
            <div className="grid grid-cols-2 gap-3.5">
              {cards.map((_, i) => (
                <EditableItemWrapper key={i}>
                  <EditableItemControls listPath="editorial.ai.cards" index={i} />
                  <div className="bg-[#16181c] border border-white/[0.08] rounded-2xl px-[18px] py-5 h-full">
                    <EditableText
                      path={`editorial.ai.cards.${i}.tag`}
                      as="div"
                      className={`font-tam text-[12px] tracking-[1.5px] mb-2.5 ${TAG_COLORS[i % TAG_COLORS.length]}`}
                      placeholder="תגית"
                    />
                    <EditableText
                      path={`editorial.ai.cards.${i}.text`}
                      as="div"
                      className="font-semibold text-[17px] leading-[1.5]"
                      placeholder="תוכן"
                    />
                  </div>
                </EditableItemWrapper>
              ))}
            </div>
            <div className="max-w-xs mt-3.5">
              <EditableAddItem
                listPath="editorial.ai.cards"
                defaultItem={{ tag: "", text: "" }}
                label="הוסף כרטיס"
              />
            </div>
          </div>
        </div>
      </div>
    </EditableSection>
  );
}
