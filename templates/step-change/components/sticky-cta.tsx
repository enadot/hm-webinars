import { EditableText } from "@/components/editable/text";

/** Fixed bottom bar on mobile only. */
export function ScStickyCta() {
  return (
    <div
      role="complementary"
      aria-label="הרשמה מהירה"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#162321]/95 backdrop-blur-md border-t border-white/[0.12] px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]"
    >
      <a
        href="#register"
        className="bg-[#74DF93] active:bg-[#A1F0B8] text-[#162321] font-extrabold text-base px-6 py-[15px] rounded-full w-full text-center block box-border"
      >
        <EditableText path="stepChange.stickyCta" as="span" placeholder="טקסט כפתור" />{" "}
        <span aria-hidden>&#8592;</span>
      </a>
      <EditableText
        path="stepChange.stickyNote"
        as="div"
        className="text-center text-xs text-[#9CAFA5] mt-1.5"
        placeholder="הערה"
        hideIfEmpty
      />
    </div>
  );
}
