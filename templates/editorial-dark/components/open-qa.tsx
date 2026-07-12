import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function EdOpenQa({ config }: { config: CampaignConfig }) {
  const bubbles = config.editorial?.qa?.bubbles ?? [];

  return (
    <EditableSection sectionKey="ed-qa" className="bg-[#0a0b0d] text-white py-20">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <EditableText
            path="editorial.qa.label"
            as="div"
            className="font-tam text-sm tracking-[2px] text-[#7c828a] mb-4"
            placeholder="06 — תווית"
          />
          <h2 className="m-0 mb-4 font-medium text-[clamp(30px,4vw,52px)] tracking-[-0.7px] leading-[1.18]">
            <EditableText path="editorial.qa.title" as="span" placeholder="כותרת" />{" "}
            <EditableText
              path="editorial.qa.titleAccent"
              as="span"
              className="text-[#3d7bff]"
              placeholder="הדגשה"
              hideIfEmpty
            />
          </h2>
          <EditableText
            path="editorial.qa.body"
            as="p"
            multiline
            className="m-0 mb-2.5 text-[#a8acb3] text-[clamp(16px,1.7vw,20px)] leading-[1.7] max-w-[52ch]"
            placeholder="תיאור"
          />
          <EditableText
            path="editorial.qa.punch"
            as="p"
            className="m-0 font-semibold text-[clamp(16px,1.6vw,19px)]"
            placeholder="משפט חיזוק"
            hideIfEmpty
          />
        </div>

        {/* Chat bubbles: last bubble is the brand answer */}
        <div className="flex flex-col gap-3 items-start">
          {bubbles.map((_, i) => {
            const isAnswer = i === bubbles.length - 1 && bubbles.length > 1;
            return isAnswer ? (
              <div
                key={i}
                className="bg-[#0052ff] rounded-[18px_18px_4px_18px] px-5 py-3.5 text-[16px] font-semibold max-w-[340px] self-end"
              >
                <EditableText path={`editorial.qa.bubbles.${i}`} as="span" placeholder="תשובה" />
              </div>
            ) : (
              <div
                key={i}
                className={`bg-[#16181c] border border-white/[0.09] rounded-[18px_18px_18px_4px] px-5 py-3.5 text-[16px] text-[#e6e8eb] max-w-[340px] ${
                  i % 2 === 1 ? "mr-8" : ""
                }`}
              >
                <EditableText path={`editorial.qa.bubbles.${i}`} as="span" placeholder="שאלה" />
              </div>
            );
          })}
        </div>
      </div>
    </EditableSection>
  );
}
