"use client";

import { useCallback, useRef, useState } from "react";
import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

/**
 * Horizontally snapping quote carousel. The active index is derived from which
 * card sits closest to the track's start edge, which works in RTL and LTR alike.
 */
export function ScPain({ config }: { config: CampaignConfig }) {
  const pain = config.stepChange?.pain;
  const quotes = pain?.quotes ?? [];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const nearest = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const cards = Array.from(el.children) as HTMLElement[];
    if (cards.length === 0) return 0;
    const cs = getComputedStyle(el);
    const rtl = cs.direction === "rtl";
    const pad = parseFloat(cs.paddingInlineStart) || 0;
    const r = el.getBoundingClientRect();
    const edge = rtl ? r.right - pad : r.left + pad;
    let best = 0;
    let bestD = Infinity;
    cards.forEach((c, i) => {
      const cr = c.getBoundingClientRect();
      const d = Math.abs((rtl ? cr.right : cr.left) - edge);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }, []);

  const go = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const cards = Array.from(el.children) as HTMLElement[];
      if (cards.length === 0) return;
      const idx = Math.max(0, Math.min(cards.length - 1, i));
      const cs = getComputedStyle(el);
      const rtl = cs.direction === "rtl";
      const pad = parseFloat(cs.paddingInlineStart) || 0;
      const r = el.getBoundingClientRect();
      const edge = rtl ? r.right - pad : r.left + pad;
      const cr = cards[idx].getBoundingClientRect();
      el.scrollBy({ left: (rtl ? cr.right : cr.left) - edge, behavior: "smooth" });
      setActive(idx);
    },
    []
  );

  if (quotes.length === 0) return null;

  const navBtn =
    "size-12 rounded-full border border-[#C7D2CC] bg-white text-[#162321] text-[19px] cursor-pointer flex items-center justify-center hover:border-[#162321] hover:bg-[#162321] hover:text-[#EFEFEF] transition-colors";

  return (
    <EditableSection sectionKey="pain" className="bg-[#EFEFEF] text-[#162321] pt-[104px] pb-24">
      <div className="max-w-[1160px] mx-auto mb-12 px-6 box-border">
        <EditableText
          path="stepChange.pain.eyebrow"
          as="div"
          className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#5A6E64] mb-5"
          placeholder="שורת פתיחה"
        />
        <h2 className="m-0 font-black text-[clamp(38px,6.2vw,84px)] leading-[1.06] tracking-[-1.5px] max-w-[22ch] [text-wrap:balance]">
          <EditableText path="stepChange.pain.title" as="span" multiline placeholder="כותרת" />{" "}
          <EditableText
            path="stepChange.pain.titleAccent"
            as="span"
            className="bg-[#162321] text-[#74DF93] px-3 rounded-xl inline-block"
            placeholder="הדגשה"
            hideIfEmpty
          />
        </h2>
      </div>

      <div className="max-w-[1160px] mx-auto mb-5 px-6 box-border flex items-center justify-between gap-4">
        <div className="text-[14.5px] text-[#4A5C54]">
          <EditableText path="stepChange.pain.dragLabel" as="span" placeholder="גררו לצדדים" />{" "}
          · {active + 1} מתוך {quotes.length}
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => go(active - 1)} aria-label="הציטוט הקודם" className={navBtn}>
            &#8594;
          </button>
          <button type="button" onClick={() => go(active + 1)} aria-label="הציטוט הבא" className={navBtn}>
            &#8592;
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={() => {
          const i = nearest();
          if (i !== active) setActive(i);
        }}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pt-1.5 pb-2.5 box-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {quotes.map((_, i) => (
          <blockquote
            key={i}
            className="m-0 flex-[0_0_min(84%,360px)] snap-start bg-white border border-[#DCE3DF] rounded-[20px] px-6 py-[26px] flex flex-col gap-4 min-h-[210px] shadow-[0_6px_22px_rgba(22,35,33,0.05)]"
          >
            <span aria-hidden className="font-tae text-[40px] leading-[.5] text-[#162321]/20">
              &quot;
            </span>
            <EditableText
              path={`stepChange.pain.quotes.${i}`}
              as="div"
              multiline
              className="font-extrabold text-[clamp(18px,1.9vw,21px)] leading-[1.5] flex-1"
              placeholder="ציטוט"
            />
            <div className="border-t border-[#E7EBE8] pt-3.5 font-tae text-[13px] text-[#5A6E64] tracking-[1px]">
              {i + 1} / {quotes.length}
            </div>
          </blockquote>
        ))}
      </div>

      <div className="max-w-[1160px] mx-auto mt-4 px-6 box-border flex gap-2">
        {quotes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`ציטוט ${i + 1}`}
            className={`flex-1 h-1 border-0 p-0 cursor-pointer rounded-full transition-colors ${
              i === active ? "bg-[#162321]" : "bg-[#C7D2CC]"
            }`}
          />
        ))}
      </div>

      <div className="max-w-[1160px] mx-auto mt-14 px-6 box-border flex flex-wrap items-center gap-6 justify-between">
        <EditableText
          path="stepChange.pain.closing"
          as="h3"
          multiline
          className="m-0 font-black text-[clamp(24px,3.2vw,40px)] leading-[1.25] max-w-[24ch] tracking-[-0.6px]"
          placeholder="משפט סיכום"
        />
        <div className="flex flex-col gap-2.5">
          <a
            href="#register"
            className="bg-[#162321] hover:bg-[#0C1513] hover:text-[#74DF93] transition-colors text-[#EFEFEF] font-extrabold text-[17px] px-8 py-[17px] rounded-full text-center"
          >
            <EditableText path="stepChange.pain.cta" as="span" placeholder="טקסט כפתור" />
          </a>
          <EditableText
            path="stepChange.pain.ctaNote"
            as="span"
            className="text-[13.5px] text-[#5A6E64] text-center"
            placeholder="הערה"
            hideIfEmpty
          />
        </div>
      </div>
    </EditableSection>
  );
}
