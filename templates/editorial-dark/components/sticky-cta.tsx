"use client";

import { EditableText } from "@/components/editable/text";
import { useEdit } from "@/lib/edit-context";

/** Mobile-only sticky bottom CTA. Hidden while editing so it doesn't cover the editor. */
export function EdStickyCta() {
  const ctx = useEdit();
  if (ctx?.enabled) return null;

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0a0b0d]/[0.92] backdrop-blur-xl border-t border-white/[0.12] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex items-center justify-center">
      <a
        href="#register"
        className="bg-[#0052ff] active:bg-[#003ecc] text-white font-bold text-[17px] py-4 px-6 rounded-full w-full max-w-[420px] text-center block"
      >
        <EditableText path="editorial.topbarCta" as="span" placeholder="להרשמה לוובינר" />
      </a>
    </div>
  );
}
