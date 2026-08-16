"use client";

import { useState } from "react";
import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";
import { ScSquiggle } from "./squiggle";

/**
 * Session plan. Desktop shows a module list beside a sticky detail card;
 * mobile collapses the same content into an accordion.
 */
export function ScAgenda({ config }: { config: CampaignConfig }) {
  const agenda = config.stepChange?.agenda;
  const modules = agenda?.modules ?? [];
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(0);

  if (modules.length === 0) return null;
  const act = modules[Math.min(active, modules.length - 1)];

  return (
    <EditableSection sectionKey="agenda" className="bg-[#EFEFEF] text-[#162321] py-[104px]">
      <div className="max-w-[1160px] mx-auto px-6 box-border">
        <EditableText
          path="stepChange.agenda.eyebrow"
          as="div"
          className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#5A6E64] mb-5"
          placeholder="שורת פתיחה"
        />
        <EditableText
          path="stepChange.agenda.title"
          as="h2"
          multiline
          className="m-0 mb-[18px] font-black text-[clamp(36px,5.6vw,76px)] leading-[1.07] tracking-[-1.4px] max-w-[18ch] [text-wrap:balance]"
          placeholder="כותרת"
        />
        <ScSquiggle className="w-[min(52%,300px)] mb-11" stroke="#162321" width={5} />

        {/* Desktop: list + sticky detail card */}
        <div className="hidden lg:grid grid-cols-[0.85fr_1.15fr] gap-5 items-start">
          <div className="flex flex-col gap-2">
            {modules.map((m, i) => {
              const on = i === active;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={on || undefined}
                  className={`w-full text-right cursor-pointer border rounded-2xl px-[22px] py-5 flex items-center gap-4 min-h-14 font-tamo transition-colors ${
                    on
                      ? "border-transparent bg-[#162321] text-[#EFEFEF]"
                      : "border-[#DCE3DF] bg-white text-[#162321] hover:border-[#162321] hover:bg-[#F6F8F7]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`font-tae text-xl font-semibold shrink-0 ${
                      on ? "text-[#74DF93]" : "text-[#162321]/35"
                    }`}
                  >
                    {m.n}
                  </span>
                  <span
                    className={`text-[clamp(17px,1.7vw,20px)] leading-[1.35] flex-1 ${
                      on ? "font-extrabold" : "font-bold"
                    }`}
                  >
                    {m.title}
                  </span>
                  {on && (
                    <span aria-hidden className="text-[#74DF93] text-lg shrink-0">
                      &#8592;
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-[#DCE3DF] rounded-[20px] px-[34px] py-9 sticky top-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span
                aria-hidden
                className="font-tae font-semibold text-[clamp(40px,4vw,58px)] leading-none text-[#162321]/[0.18]"
              >
                {act.n}
              </span>
              {act.tag && (
                <span className="bg-[#74DF93] text-[#162321] font-extrabold text-[13px] rounded-full px-4 py-2">
                  {act.tag}
                </span>
              )}
            </div>
            <h3 className="m-0 font-black text-[clamp(24px,2.6vw,34px)] tracking-[-0.5px] leading-[1.2]">
              {act.title}
            </h3>
            <div className="flex gap-3 items-start bg-[#F1F5F3] rounded-[14px] px-5 py-[18px]">
              <span aria-hidden className="text-[#487854] text-lg leading-[1.4] shrink-0">
                &#10003;
              </span>
              <div className="font-bold text-[clamp(18px,1.8vw,21px)] leading-[1.5]">{act.promise}</div>
            </div>
            <div className="text-[#4A5C54] text-[clamp(16px,1.6vw,18px)] leading-[1.7]">{act.detail}</div>
          </div>
        </div>

        {/* Mobile: accordion */}
        <div className="flex lg:hidden flex-col gap-2.5">
          {modules.map((m, i) => {
            const on = open === i;
            return (
              <div key={i} className="bg-white border border-[#DCE3DF] rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(on ? -1 : i)}
                  aria-expanded={on}
                  className="w-full bg-transparent border-0 cursor-pointer text-right p-[18px] flex items-start gap-3 min-h-14 font-tamo text-[#162321]"
                >
                  <span aria-hidden className="font-tae text-[17px] font-semibold text-[#487854] shrink-0 pt-0.5">
                    {m.n}
                  </span>
                  <span className="flex-1">
                    <span className="block font-extrabold text-[19px] leading-[1.35]">{m.title}</span>
                    <span className="block font-semibold text-base leading-[1.5] text-[#4A5C54] mt-1.5">
                      {m.promise}
                    </span>
                  </span>
                  <span aria-hidden className="text-xl text-[#5A6E64] shrink-0">
                    {on ? "−" : "+"}
                  </span>
                </button>
                {on && (
                  <div className="px-[18px] pb-[18px] text-[#4A5C54] text-[16.5px] leading-[1.7]">
                    {m.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <EditableText
          path="stepChange.agenda.qaNote"
          as="div"
          className="mt-7 font-extrabold text-[clamp(18px,1.9vw,22px)]"
          placeholder="הערה על השו״ת"
          hideIfEmpty
        />

        <div className="flex flex-wrap items-center gap-5 mt-11 pt-[34px] border-t border-[#D3DCD7]">
          <EditableText
            path="stepChange.agenda.closing"
            as="span"
            multiline
            className="font-extrabold text-[clamp(19px,2.1vw,26px)] max-w-[32ch] leading-[1.4]"
            placeholder="משפט סיכום"
          />
          <div className="flex flex-col gap-2.5">
            <a
              href="#register"
              className="bg-[#162321] hover:bg-[#0C1513] hover:text-[#74DF93] transition-colors text-[#EFEFEF] font-extrabold text-[17px] px-8 py-[17px] rounded-full text-center"
            >
              <EditableText path="stepChange.agenda.cta" as="span" placeholder="טקסט כפתור" />{" "}
              <span aria-hidden>&#8592;</span>
            </a>
            <EditableText
              path="stepChange.agenda.ctaNote"
              as="span"
              className="text-[13.5px] text-[#5A6E64] text-center"
              placeholder="הערה"
              hideIfEmpty
            />
          </div>
        </div>
      </div>
    </EditableSection>
  );
}
