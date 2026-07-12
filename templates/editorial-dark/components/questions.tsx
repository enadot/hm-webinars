"use client";

import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import { EditableItemControls, EditableAddItem } from "@/components/editable/list";
import { useEdit } from "@/lib/edit-context";
import type { CampaignConfig } from "@/lib/campaign-schema";

// Bento-style layout pattern: column span (of 6) + typographic weight per
// position, cycling for longer lists. Creates a scannable hierarchy instead
// of a flat text wall.
const PATTERN: Array<{ span: string; text: string; tone: "loud" | "mid" | "soft" }> = [
  { span: "md:col-span-4", text: "text-[clamp(22px,2.6vw,34px)] font-bold", tone: "loud" },
  { span: "md:col-span-2", text: "text-[clamp(17px,1.7vw,21px)] font-medium", tone: "soft" },
  { span: "md:col-span-3", text: "text-[clamp(19px,2vw,26px)] font-semibold", tone: "mid" },
  { span: "md:col-span-3", text: "text-[clamp(19px,2vw,26px)] font-semibold", tone: "soft" },
  { span: "md:col-span-4", text: "text-[clamp(22px,2.6vw,34px)] font-bold", tone: "loud" },
  { span: "md:col-span-2", text: "text-[clamp(17px,1.7vw,21px)] font-medium", tone: "soft" },
  { span: "md:col-span-2", text: "text-[clamp(17px,1.8vw,22px)] font-semibold", tone: "mid" },
  { span: "md:col-span-2", text: "text-[clamp(17px,1.8vw,22px)] font-medium", tone: "soft" },
  { span: "md:col-span-2", text: "text-[clamp(17px,1.8vw,22px)] font-semibold", tone: "mid" },
  { span: "md:col-span-6", text: "text-[clamp(24px,3.2vw,42px)] font-bold", tone: "loud" },
];

const TONE_CLASS = {
  loud: "text-white",
  mid: "text-[#e6e8eb]",
  soft: "text-[#a8acb3]",
};

export function EdQuestions({ config }: { config: CampaignConfig }) {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const items = config.editorial?.questions?.items ?? [];
  const marquee = config.editorial?.questions?.marquee ?? [];

  return (
    <EditableSection
      sectionKey="ed-questions"
      className="bg-[#0a0b0d] text-white border-t border-white/[0.07] py-24 lg:py-32"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-10 h-px bg-[#0052ff]" />
          <EditableText
            path="editorial.questions.label"
            as="div"
            className="font-tam text-sm tracking-[2px] text-[#7c828a]"
            placeholder="01 — תווית"
          />
        </div>
        <h2 className="m-0 mb-14 font-medium text-[clamp(30px,4.4vw,56px)] leading-[1.16] tracking-[-0.6px] max-w-[22ch] [text-wrap:pretty]">
          <EditableText path="editorial.questions.title" as="span" placeholder="כותרת" />{" "}
          <EditableText
            path="editorial.questions.strike"
            as="span"
            className="text-[#7c828a] line-through [text-decoration-color:#0052ff] [text-decoration-thickness:4px]"
            placeholder="חלק מחוק"
            hideIfEmpty
          />
        </h2>

        {/* Bento question field */}
        <div className="grid md:grid-cols-6 gap-3.5 md:gap-4">
          {items.map((_, i) => {
            const p = PATTERN[i % PATTERN.length];
            const isFinale = p.span === "md:col-span-6";
            return (
              <div
                key={i}
                className={`relative group/edit-item flex items-start gap-4 rounded-2xl border p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 ${p.span} ${
                  isFinale
                    ? "border-[#0052ff]/50 bg-gradient-to-l from-[#0052ff]/[0.12] to-transparent hover:border-[#0052ff]"
                    : "border-white/[0.08] bg-[#111216] hover:border-[#0052ff]/50 hover:bg-[#14161b]"
                }`}
              >
                <EditableItemControls listPath="editorial.questions.items" index={i} />
                <span
                  className="font-tam text-xs text-[#3d7bff] pt-1.5 select-none shrink-0"
                  aria-hidden
                >
                  Q{i + 1}
                </span>
                <EditableText
                  path={`editorial.questions.items.${i}`}
                  as="span"
                  className={`leading-[1.35] [text-wrap:pretty] ${p.text} ${TONE_CLASS[p.tone]}`}
                  placeholder="שאלה"
                />
              </div>
            );
          })}
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

        {/* Marquee with edge fades */}
        {marquee.length > 0 && (
          <div className="relative overflow-hidden mt-16 -mx-6 border-y border-white/[0.07] py-5" dir="ltr">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0b0d] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0b0d] to-transparent z-10 pointer-events-none" />
            <div
              className={`flex gap-12 w-max whitespace-nowrap font-tam text-[15px] md:text-base text-[#a8acb3] ${
                editing ? "" : "animate-marquee-rtl"
              }`}
            >
              {(editing ? [marquee] : [marquee, marquee]).map((batch, b) => (
                <div key={b} className="flex gap-12" dir="rtl">
                  {batch.map((_, i) => (
                    <span key={i} className="relative group/edit-item inline-flex items-center gap-12">
                      {editing && (
                        <EditableItemControls listPath="editorial.questions.marquee" index={i} />
                      )}
                      <EditableText
                        path={`editorial.questions.marquee.${i}`}
                        as="span"
                        placeholder="נושא"
                      />
                      <span aria-hidden className="text-[#0052ff]">
                        ·
                      </span>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-7 mt-14">
          <p className="m-0 text-[clamp(21px,2.6vw,34px)] font-semibold leading-[1.3] max-w-[30ch] [text-wrap:pretty]">
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
            className="shrink-0 self-start md:self-auto bg-[#0052ff] hover:bg-[#003ecc] hover:-translate-y-0.5 transition-all text-white font-bold text-[17px] md:text-lg px-8 py-4 rounded-full inline-flex items-center gap-2.5 shadow-[0_12px_40px_rgba(0,82,255,0.35)]"
          >
            <EditableText path="editorial.questions.cta" as="span" placeholder="טקסט כפתור" />
            <span aria-hidden>&#8592;</span>
          </a>
        </div>
      </div>
    </EditableSection>
  );
}
