"use client";

import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import {
  EditableItemControls,
  EditableItemWrapper,
  EditableAddItem,
} from "@/components/editable/list";
import { useEdit } from "@/lib/edit-context";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function EdAudience({ config }: { config: CampaignConfig }) {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const cards = config.editorial?.audience?.cards ?? [];
  const chips = config.editorial?.audience?.chips ?? [];

  return (
    <EditableSection sectionKey="ed-audience" className="bg-white text-[#0a0b0d] py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <EditableText
          path="editorial.audience.label"
          as="div"
          className="font-tam text-sm tracking-[2px] text-[#7c828a] mb-4"
          placeholder="05 — תווית"
        />
        <EditableText
          path="editorial.audience.title"
          as="h2"
          className="m-0 mb-12 font-medium text-[clamp(32px,4.2vw,56px)] tracking-[-0.8px] leading-[1.15]"
          placeholder="כותרת"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {cards.map((_, i) => (
            <EditableItemWrapper key={i}>
              <EditableItemControls listPath="editorial.audience.cards" index={i} />
              <div className="border border-[#dee1e6] rounded-3xl px-6 py-7 flex flex-col gap-3 h-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
                <span className="font-tam text-[28px] text-[#0052ff] leading-none" aria-hidden>
                  &quot;
                </span>
                <EditableText
                  path={`editorial.audience.cards.${i}.quote`}
                  as="p"
                  className="m-0 font-semibold text-[clamp(18px,2vw,23px)] leading-[1.45]"
                  placeholder="ציטוט"
                />
                <EditableText
                  path={`editorial.audience.cards.${i}.note`}
                  as="p"
                  multiline
                  className="m-0 text-[#5b616e] text-[15px] leading-[1.6]"
                  placeholder="פירוט"
                />
              </div>
            </EditableItemWrapper>
          ))}
        </div>
        <div className="max-w-xs mt-3.5">
          <EditableAddItem
            listPath="editorial.audience.cards"
            defaultItem={{ quote: "", note: "" }}
            label="הוסף כרטיס"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 mt-6 text-[15px] text-[#5b616e]">
          {chips.map((_, i) => (
            <span key={i} className="relative group/edit-item bg-[#eef0f3] rounded-full px-4 py-2">
              {editing && <EditableItemControls listPath="editorial.audience.chips" index={i} />}
              <EditableText
                path={`editorial.audience.chips.${i}`}
                as="span"
                placeholder="קהל יעד"
              />
            </span>
          ))}
        </div>
        {editing && (
          <div className="max-w-xs mt-3">
            <EditableAddItem
              listPath="editorial.audience.chips"
              defaultItem=""
              label="הוסף תגית"
            />
          </div>
        )}
      </div>
    </EditableSection>
  );
}
