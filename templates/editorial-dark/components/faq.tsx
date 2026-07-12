"use client";

import { useState } from "react";
import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import {
  EditableItemControls,
  EditableItemWrapper,
  EditableAddItem,
} from "@/components/editable/list";
import { useEdit } from "@/lib/edit-context";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function EdFaq({ config }: { config: CampaignConfig }) {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const items = config.editorial?.faq?.items ?? [];
  const [open, setOpen] = useState(0);

  return (
    <EditableSection sectionKey="ed-faq" className="bg-white text-[#0a0b0d] py-20 lg:py-24">
      <div className="max-w-[820px] mx-auto px-6">
        <EditableText
          path="editorial.faq.label"
          as="div"
          className="font-tam text-xs tracking-[2px] text-[#7c828a] mb-4"
          placeholder="07 — תווית"
        />
        <EditableText
          path="editorial.faq.title"
          as="h2"
          className="m-0 mb-10 font-medium text-[clamp(26px,3.4vw,42px)] tracking-[-0.7px]"
          placeholder="כותרת"
        />
        {items.map((_, i) => {
          const isOpen = editing || open === i;
          return (
            <EditableItemWrapper key={i}>
              <EditableItemControls listPath="editorial.faq.items" index={i} />
              <div className="border-t border-[#dee1e6]">
                <button
                  type="button"
                  onClick={() => !editing && setOpen(open === i ? -1 : i)}
                  className="flex justify-between items-center gap-4 w-full py-5 px-1 font-semibold text-[17px] text-[#0a0b0d] hover:text-[#0052ff] transition-colors text-start bg-transparent border-0 cursor-pointer font-heebo"
                >
                  <EditableText path={`editorial.faq.items.${i}.q`} as="span" placeholder="שאלה" />
                  <span className="font-tam text-lg text-[#0052ff] flex-none" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <EditableText
                    path={`editorial.faq.items.${i}.a`}
                    as="p"
                    multiline
                    className="m-0 px-1 pb-6 text-[#5b616e] text-[15.5px] leading-[1.7] max-w-[60ch]"
                    placeholder="תשובה"
                  />
                )}
              </div>
            </EditableItemWrapper>
          );
        })}
        <div className="border-t border-[#dee1e6]" />
        <div className="max-w-xs mt-4">
          <EditableAddItem
            listPath="editorial.faq.items"
            defaultItem={{ q: "", a: "" }}
            label="הוסף שאלה"
          />
        </div>
      </div>
    </EditableSection>
  );
}
