import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";
import { ScLeadForm } from "./lead-form-core";

export function ScRegister({ config, slug }: { config: CampaignConfig; slug?: string }) {
  const register = config.stepChange?.register;
  const details = register?.details ?? [];

  return (
    <EditableSection
      sectionKey="register"
      id="register"
      className="bg-[#162321] text-[#EFEFEF] py-[100px] scroll-mt-5"
    >
      <div className="max-w-[1160px] mx-auto px-6 box-border grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-12 items-start">
        <div>
          <EditableText
            path="stepChange.register.eyebrow"
            as="div"
            className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#9CAFA5] mb-5"
            placeholder="שורת פתיחה"
          />
          <EditableText
            path="stepChange.register.title"
            as="h2"
            className="m-0 mb-3.5 font-black text-[clamp(38px,5.4vw,72px)] leading-[1.06] tracking-[-1.3px]"
            placeholder="כותרת"
          />
          <EditableText
            path="stepChange.register.body"
            as="p"
            className="m-0 mb-8 text-[clamp(17px,1.8vw,21px)] text-[#9CAFA5] leading-[1.6]"
            placeholder="פסקה"
            hideIfEmpty
          />
          {details.length > 0 && (
            <div className="bg-[#273533] border border-white/[0.12] rounded-[20px] p-[26px] grid grid-cols-[auto_1fr] gap-x-5 gap-y-3.5 text-[clamp(15.5px,1.6vw,17.5px)]">
              {details.map((_, i) => (
                <div key={i} className="contents">
                  <EditableText
                    path={`stepChange.register.details.${i}.label`}
                    as="span"
                    className="text-[#9CAFA5]"
                    placeholder="שדה"
                  />
                  <EditableText
                    path={`stepChange.register.details.${i}.value`}
                    as="span"
                    className="font-bold"
                    placeholder="ערך"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#273533] border border-white/[0.12] rounded-3xl px-[30px] py-[34px] w-[min(100%,470px)] box-border justify-self-center shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
          <ScLeadForm slug={slug} />
        </div>
      </div>
    </EditableSection>
  );
}
