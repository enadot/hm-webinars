"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { EditableText } from "@/components/editable/text";
import { useEdit } from "@/lib/edit-context";
import { LeadFormCore } from "./lead-form-core";
import type { CampaignConfig } from "@/lib/campaign-schema";

const STORAGE_KEY = "ed-exit-popup-shown";

/**
 * Exit-intent registration popup, shown once per session.
 * Desktop: fires when the cursor leaves through the top of the viewport.
 * Mobile: fires on a decisive scroll back up after real engagement.
 * Never shown in the visual editor.
 */
export function EdExitPopup({ config, slug }: { config: CampaignConfig; slug?: string }) {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const [open, setOpen] = useState(false);
  const maxScroll = useRef(0);
  const lastY = useRef(0);
  const upDistance = useRef(0);

  const trigger = useCallback(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable — still show once for this page view */
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (editing) return;

    // Desktop: cursor exits through the top (towards the URL bar / tabs).
    const onMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget || e.clientY > 0) return;
      trigger();
    };

    // Mobile: after scrolling ≥1.5 viewports, a sustained ≥600px scroll-up.
    const onScroll = () => {
      const y = window.scrollY;
      maxScroll.current = Math.max(maxScroll.current, y);
      if (y < lastY.current) upDistance.current += lastY.current - y;
      else upDistance.current = 0;
      lastY.current = y;
      if (maxScroll.current > window.innerHeight * 1.5 && upDistance.current > 600) {
        trigger();
      }
    };

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, [editing, trigger]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (editing || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-[#0a0b0d] text-white rounded-3xl w-full max-w-[440px] max-h-[92dvh] overflow-y-auto p-7 sm:p-8 shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-8 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#0052ff] to-transparent" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="סגירה"
          className="absolute top-4 left-4 size-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors flex items-center justify-center text-[#a8acb3]"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col gap-4">
          <EditableText
            path="editorial.popupTitle"
            as="div"
            className="font-bold text-[24px] sm:text-[26px] leading-[1.25] pl-8"
            placeholder="כותרת פופאפ"
          />
          <EditableText
            path="editorial.popupBody"
            as="p"
            multiline
            className="m-0 -mt-1 text-[15px] text-[#a8acb3] leading-[1.6]"
            placeholder="טקסט פופאפ"
            hideIfEmpty
          />
          <div className="flex flex-wrap items-center gap-x-2 text-[13.5px] text-[#a8acb3]">
            <EditableText path="webinar.dateLabel" as="span" placeholder="" hideIfEmpty />
            <span className="text-[#3d7bff]" aria-hidden>
              ·
            </span>
            <EditableText path="editorial.hebrewDate" as="span" placeholder="" hideIfEmpty />
          </div>
          <LeadFormCore slug={slug} idPrefix="popup-" />
        </div>
      </div>
    </div>
  );
}
