"use client";

import { EditableText } from "@/components/editable/text";
import { EditableImage } from "@/components/editable/image";
import { EditableSection } from "@/components/editable/section";
import {
  EditableItemControls,
  EditableItemWrapper,
  EditableAddItem,
} from "@/components/editable/list";
import { useEdit } from "@/lib/edit-context";
import { StatNumber } from "./stat-number";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function EdPresenter({ config }: { config: CampaignConfig }) {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const stats = config.editorial?.stats ?? [];
  const speaker = config.speakers.list[0];

  return (
    <EditableSection sectionKey="speakers" className="bg-[#f7f7f7] text-[#0a0b0d] py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <EditableText
          path="speakers.eyebrow"
          as="div"
          className="font-tam text-sm tracking-[2px] text-[#7c828a] mb-4"
          placeholder="04 — תווית"
        />
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <EditableText
              path="speakers.title"
              as="h2"
              className="m-0 mb-2 font-medium text-[clamp(32px,4.2vw,56px)] tracking-[-0.8px] leading-[1.15]"
              placeholder="כותרת"
            />
            <EditableText
              path="speakers.list.0.name"
              as="div"
              className="font-bold text-[clamp(22px,2.5vw,30px)] mt-[18px] mb-1"
              placeholder="שם המרצה"
            />
            <EditableText
              path="speakers.list.0.role"
              as="div"
              className="text-[#0052ff] font-semibold text-[17px] mb-5"
              placeholder="תפקיד"
            />
            <EditableText
              path="speakers.list.0.bio"
              as="p"
              multiline
              className="m-0 mb-7 text-[#5b616e] text-[clamp(16px,1.7vw,20px)] leading-[1.7] max-w-[56ch]"
              placeholder="ביוגרפיה"
            />

            {/* Giant numbers */}
            <div className="flex flex-wrap gap-y-4 gap-x-12 border-t border-[#dee1e6] pt-6">
              {stats.map((s, i) => (
                <EditableItemWrapper key={i}>
                  <EditableItemControls listPath="editorial.stats" index={i} />
                  <div className="flex flex-col">
                    {editing ? (
                      <span className="font-tam text-[clamp(40px,4.5vw,58px)] font-semibold text-[#0052ff] leading-none">
                        <EditableText
                          path={`editorial.stats.${i}.value`}
                          as="span"
                          placeholder="0"
                        />
                        <EditableText
                          path={`editorial.stats.${i}.suffix`}
                          as="span"
                          placeholder=""
                          hideIfEmpty
                        />
                      </span>
                    ) : (
                      <StatNumber
                        value={s.value}
                        suffix={s.suffix}
                        className="font-tam text-[clamp(40px,4.5vw,58px)] font-semibold text-[#0052ff] leading-none"
                      />
                    )}
                    <EditableText
                      path={`editorial.stats.${i}.label`}
                      as="span"
                      className="text-[15px] text-[#5b616e] mt-1.5"
                      placeholder="תיאור"
                    />
                  </div>
                </EditableItemWrapper>
              ))}
            </div>
            {editing && (
              <div className="max-w-xs mt-3">
                <EditableAddItem
                  listPath="editorial.stats"
                  defaultItem={{ value: "", suffix: "", label: "" }}
                  label="הוסף נתון"
                />
              </div>
            )}

            <EditableText
              path="editorial.presenterPunch"
              as="p"
              className="m-0 mt-6 font-semibold text-[clamp(16px,1.6vw,19px)]"
              placeholder="משפט מסכם"
              hideIfEmpty
            />
          </div>

          <div className="justify-self-center w-full max-w-[400px] relative">
            <div className="rounded-3xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
              <div className="aspect-[3/4]">
                <EditableImage
                  path="speakers.list.0.photoUrl"
                  alt={speaker?.name || "מרצה"}
                  className="block w-full h-full object-cover object-[50%_10%]"
                  placeholderClassName="w-full h-full"
                  placeholderLabel="תמונת מרצה"
                  hideIfEmpty={false}
                />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2.5 bg-[#0a0b0d] text-white rounded-2xl px-5 py-3.5 text-[14.5px] leading-[1.55] shadow-[0_12px_32px_rgba(0,0,0,0.25)] max-w-[230px]">
              <EditableText
                path="editorial.presenterBadgeLabel"
                as="span"
                className="font-tam text-[#3d7bff] text-[10.5px] tracking-[1px] block mb-1"
                placeholder="LABEL"
              />
              <EditableText
                path="editorial.presenterBadge"
                as="span"
                placeholder="טקסט קצר"
              />
            </div>
          </div>
        </div>
      </div>
    </EditableSection>
  );
}
