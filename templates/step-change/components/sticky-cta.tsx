import { EditableText } from "@/components/editable/text";

/**
 * Floating full-width registration button, mobile only. Sits above the safe-area
 * inset so it clears the iOS home indicator; the closing section reserves
 * matching height so the footer is never hidden behind it.
 */
export function ScStickyCta() {
  return (
    <div
      role="complementary"
      aria-label="הרשמה לוובינר"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#162321]/95 backdrop-blur-md border-t border-white/[0.12] shadow-[0_-10px_34px_rgba(0,0,0,0.5)] px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <a
        href="#register"
        className="bg-[#74DF93] active:bg-[#A1F0B8] active:scale-[0.99] transition-all text-[#162321] font-extrabold text-[18px] leading-none px-6 py-[19px] rounded-full w-full text-center flex items-center justify-center gap-2.5 box-border shadow-[0_10px_28px_rgba(116,223,147,0.32)]"
      >
        <EditableText path="stepChange.stickyCta" as="span" placeholder="טקסט כפתור" />
        <span aria-hidden>&#8592;</span>
      </a>
      <EditableText
        path="stepChange.stickyNote"
        as="div"
        className="text-center text-[12.5px] text-[#9CAFA5] mt-2"
        placeholder="הערה"
        hideIfEmpty
      />
    </div>
  );
}
