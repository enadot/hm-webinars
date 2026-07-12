import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import { LeadFormCore } from "./lead-form-core";
import type { CampaignConfig } from "@/lib/campaign-schema";

/**
 * Standalone registration section: white full-viewport (100dvh) stage so every
 * #register CTA lands the visitor on a focused, high-contrast form.
 */
export function EdRegister({ config, slug }: { config: CampaignConfig; slug?: string }) {
  const { webinar } = config;

  return (
    <EditableSection
      sectionKey="form"
      id="register"
      className="bg-white text-[#0a0b0d] border-t border-[#dee1e6] min-h-[100dvh] flex items-center py-20 md:py-24 scroll-mt-0"
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-[#0052ff]" />
            <EditableText
              path="editorial.registerLabel"
              as="div"
              className="font-tam text-sm tracking-[2px] text-[#7c828a]"
              placeholder="הרשמה"
            />
          </div>
          <h2 className="m-0 mb-5 font-medium text-[clamp(32px,4.6vw,60px)] leading-[1.12] tracking-[-1px] [text-wrap:pretty]">
            <EditableText path="form.title" as="span" multiline placeholder="כותרת" />
            <br />
            <EditableText
              path="form.titleAccent"
              as="span"
              className="text-[#0052ff]"
              placeholder="הדגשה"
              hideIfEmpty
            />
          </h2>
          <EditableText
            path="form.description"
            as="p"
            multiline
            className="m-0 mb-[18px] text-[#5b616e] text-[clamp(17px,1.8vw,22px)] leading-[1.7] max-w-[50ch]"
            placeholder="תיאור"
            hideIfEmpty
          />
          {webinar.spotsLimited && (
            <div className="inline-flex items-center gap-2 border border-[#d97706]/50 bg-[#fffbeb] text-[#b45309] rounded-full px-4 py-2 text-[14px] font-semibold whitespace-nowrap">
              <EditableText path="editorial.limitedText" as="span" placeholder="מספר המקומות מוגבל" />
            </div>
          )}
        </div>

        {/* Dark form card popping on the white stage */}
        <div className="relative bg-[#0a0b0d] rounded-3xl p-7 sm:p-8 max-w-[480px] w-full justify-self-center shadow-[0_36px_90px_-18px_rgba(10,11,13,0.5)]">
          <div className="absolute inset-x-8 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#0052ff] to-transparent" />
          <div className="flex flex-col gap-4 text-white">
            <EditableText
              path="form.cardTitle"
              as="div"
              className="font-bold text-[24px]"
              placeholder="כותרת כרטיס"
            />
            <div className="-mt-2 flex flex-wrap items-center gap-x-2 text-[13.5px] text-[#a8acb3]">
              <EditableText path="webinar.dateLabel" as="span" placeholder="מועד" hideIfEmpty />
              <span className="text-[#3d7bff]" aria-hidden>
                ·
              </span>
              <EditableText
                path="editorial.hebrewDate"
                as="span"
                placeholder="תאריך עברי"
                hideIfEmpty
              />
            </div>
            <LeadFormCore slug={slug} />
          </div>
        </div>
      </div>
    </EditableSection>
  );
}
