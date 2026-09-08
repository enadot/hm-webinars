"use client";

import { useState } from "react";
import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function ScFaq({ config }: { config: CampaignConfig }) {
  const items = config.stepChange?.faq ?? [];
  const [open, setOpen] = useState(0);
  if (items.length === 0) return null;

  return (
    <EditableSection sectionKey="faq" className="bg-[#EFEFEF] text-[#162321] py-16 md:py-[104px]">
      <div className="max-w-[840px] mx-auto px-5 md:px-6 box-border">
        <EditableText
          path="stepChange.faqTitle"
          as="h2"
          className="m-0 mb-7 md:mb-11 font-black text-[30px] md:text-[clamp(34px,4.8vw,64px)] leading-[1.1] md:leading-[1.08] tracking-[-0.8px] md:tracking-[-1.2px]"
          placeholder="כותרת"
        />
        {items.map((_, i) => {
          const on = open === i;
          return (
            <div key={i} className="border-b border-[#D3DCD7]">
              <button
                type="button"
                onClick={() => setOpen(on ? -1 : i)}
                aria-expanded={on}
                className="w-full bg-transparent border-0 cursor-pointer flex items-start justify-between gap-4 text-right py-5 md:py-6 min-h-14 font-tamo text-[#162321] hover:text-[#4A5C54] transition-colors"
              >
                <EditableText
                  path={`stepChange.faq.${i}.q`}
                  as="span"
                  className="font-extrabold text-[17px] md:text-[clamp(18px,2vw,25px)] leading-[1.4] md:leading-[1.35]"
                  placeholder="שאלה"
                />
                <span aria-hidden className="text-[22px] text-[#5A6E64] shrink-0 leading-[1.2]">
                  {on ? "−" : "+"}
                </span>
              </button>
              {on && (
                <EditableText
                  path={`stepChange.faq.${i}.a`}
                  as="p"
                  multiline
                  className="m-0 pb-5 md:pb-[26px] text-[#4A5C54] text-[16px] md:text-[clamp(16px,1.7vw,18.5px)] leading-[1.7] md:leading-[1.75] max-w-[66ch]"
                  placeholder="תשובה"
                />
              )}
            </div>
          );
        })}
      </div>
    </EditableSection>
  );
}
