import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function EdFinal({ config }: { config: CampaignConfig }) {
  void config;
  return (
    <EditableSection
      sectionKey="ed-final"
      className="bg-[#0a0b0d] text-white pt-24 pb-6 text-center"
    >
      <div className="max-w-[860px] mx-auto px-6 flex flex-col items-center gap-6">
        <h2 className="m-0 font-medium text-[clamp(30px,4.4vw,56px)] leading-[1.14] tracking-[-1px] [text-wrap:pretty]">
          <EditableText path="editorial.final.title" as="span" placeholder="כותרת סיום" />{" "}
          <EditableText
            path="editorial.final.titleAccent"
            as="span"
            className="text-[#3d7bff]"
            placeholder="הדגשה"
            hideIfEmpty
          />
        </h2>
        <EditableText
          path="editorial.final.body"
          as="p"
          multiline
          className="m-0 text-[#a8acb3] text-[17px] leading-[1.7] max-w-[56ch]"
          placeholder="פסקת סיום"
          hideIfEmpty
        />
        <a
          href="#register"
          className="bg-[#0052ff] hover:bg-[#003ecc] transition-colors text-white font-bold text-lg px-10 py-[19px] rounded-full inline-flex items-center gap-2.5"
        >
          <EditableText path="hero.ctaText" as="span" placeholder="טקסט כפתור" />
          <span aria-hidden>&#8592;</span>
        </a>
        <EditableText
          path="editorial.final.note"
          as="div"
          className="text-[13.5px] text-[#7c828a] mt-2"
          placeholder="שורת קרדיט"
          hideIfEmpty
        />
      </div>

      {/* Footer bar */}
      <div className="max-w-[1200px] mx-auto mt-16 px-6 pt-6 pb-24 border-t border-white/[0.07] flex flex-wrap justify-between gap-3 text-xs text-[#7c828a]">
        <EditableText
          path="footer.legal"
          as="span"
          multiline
          className="text-start"
          placeholder="© שורת זכויות"
        />
        <EditableText
          path="editorial.final.footerMono"
          as="span"
          className="font-tam"
          placeholder="Footer tag"
          hideIfEmpty
        />
      </div>
    </EditableSection>
  );
}
