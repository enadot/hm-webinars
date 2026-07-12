"use client";

import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import { EditableItemControls, EditableAddItem } from "@/components/editable/list";
import { useEdit } from "@/lib/edit-context";
import type { CampaignConfig } from "@/lib/campaign-schema";

// Varied typographic treatment per position, mirroring the asymmetric
// "question field" of the original design (cycles when there are more items).
const ITEM_STYLES = [
  "text-[clamp(21px,2.6vw,32px)] font-semibold leading-[1.3] text-white",
  "text-[clamp(15px,1.6vw,19px)] text-[#7c828a] leading-[1.4]",
  "text-[clamp(18px,2.1vw,26px)] font-medium text-[#e6e8eb] leading-[1.35]",
  "text-[clamp(15px,1.6vw,19px)] text-[#a8acb3] leading-[1.4]",
  "text-[clamp(20px,2.4vw,30px)] font-semibold leading-[1.3] text-white",
  "text-[clamp(15px,1.6vw,19px)] text-[#7c828a] leading-[1.4]",
  "text-[clamp(17px,2vw,24px)] font-medium text-[#e6e8eb] leading-[1.35]",
  "text-[clamp(15px,1.6vw,19px)] text-[#a8acb3] leading-[1.4]",
  "text-[clamp(18px,2.2vw,27px)] font-medium leading-[1.35] text-white",
  "text-[clamp(20px,2.5vw,31px)] font-semibold leading-[1.3] text-white",
];

export function EdQuestions({ config }: { config: CampaignConfig }) {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const items = config.editorial?.questions?.items ?? [];
  const marquee = config.editorial?.questions?.marquee ?? [];

  return (
    <EditableSection
      sectionKey="ed-questions"
      className="bg-[#0a0b0d] text-white border-t border-white/[0.07] py-20 lg:py-24"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <EditableText
          path="editorial.questions.label"
          as="div"
          className="font-tam text-xs tracking-[2px] text-[#7c828a] mb-4"
          placeholder="01 — תווית"
        />
        <h2 className="m-0 mb-12 font-medium text-[clamp(26px,3.6vw,44px)] leading-[1.18] tracking-[-0.5px] max-w-[22ch] [text-wrap:pretty]">
          <EditableText path="editorial.questions.title" as="span" placeholder="כותרת" />{" "}
          <EditableText
            path="editorial.questions.strike"
            as="span"
            className="text-[#7c828a] line-through [text-decoration-color:#0052ff] [text-decoration-thickness:3px]"
            placeholder="חלק מחוק"
            hideIfEmpty
          />
        </h2>

        {/* Asymmetric typographic question field */}
        <div className="flex flex-wrap gap-y-3.5 gap-x-[18px] items-baseline max-w-[1000px]">
          {items.map((_, i) => (
            <span key={i} className="relative group/edit-item">
              <EditableItemControls listPath="editorial.questions.items" index={i} />
              <EditableText
                path={`editorial.questions.items.${i}`}
                as="span"
                className={ITEM_STYLES[i % ITEM_STYLES.length]}
                placeholder="שאלה"
              />
            </span>
          ))}
        </div>
        {editing && (
          <div className="max-w-xs mt-4">
            <EditableAddItem
              listPath="editorial.questions.items"
              defaultItem=""
              label="הוסף שאלה"
            />
          </div>
        )}

        {/* Marquee */}
        {marquee.length > 0 && (
          <div
            className="overflow-hidden mt-14 -mx-6 border-y border-white/[0.07] py-3.5"
            dir="ltr"
          >
            <div
              className={`flex gap-10 w-max whitespace-nowrap font-tam text-[12.5px] text-[#7c828a] ${
                editing ? "" : "animate-marquee-rtl"
              }`}
            >
              {(editing ? [marquee] : [marquee, marquee]).map((batch, b) => (
                <div key={b} className="flex gap-10" dir="rtl">
                  {batch.map((_, i) => (
                    <span key={i} className="relative group/edit-item inline-flex items-center gap-10">
                      {editing && (
                        <EditableItemControls listPath="editorial.questions.marquee" index={i} />
                      )}
                      <EditableText
                        path={`editorial.questions.marquee.${i}`}
                        as="span"
                        placeholder="נושא"
                      />
                      <span aria-hidden>·</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {editing && (
          <div className="max-w-xs mt-3">
            <EditableAddItem
              listPath="editorial.questions.marquee"
              defaultItem=""
              label="הוסף נושא לפס הנע"
            />
          </div>
        )}

        {/* Closing line + CTA */}
        <div className="flex flex-wrap items-center gap-5 mt-12">
          <p className="m-0 text-[clamp(17px,1.8vw,22px)] font-medium max-w-[36ch]">
            <EditableText path="editorial.questions.closing" as="span" placeholder="משפט סיכום" />{" "}
            <EditableText
              path="editorial.questions.closingAccent"
              as="span"
              className="text-[#3d7bff]"
              placeholder="הדגשה"
              hideIfEmpty
            />
          </p>
          <a
            href="#register"
            className="border border-white/30 hover:border-white hover:bg-white/[0.06] transition-colors text-white font-semibold text-[15px] px-6 py-3 rounded-full"
          >
            <EditableText path="editorial.questions.cta" as="span" placeholder="טקסט כפתור" />
          </a>
        </div>
      </div>
    </EditableSection>
  );
}
