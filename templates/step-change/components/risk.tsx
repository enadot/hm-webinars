import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function ScRisk({ config }: { config: CampaignConfig }) {
  const risk = config.stepChange?.risk;
  if (!risk) return null;
  const rows = risk.rows ?? [];

  return (
    <EditableSection
      sectionKey="risk"
      className="bg-[#162321] text-[#EFEFEF] py-[104px] border-b border-white/[0.08]"
    >
      <div className="max-w-[1160px] mx-auto px-6 box-border grid grid-cols-[repeat(auto-fit,minmax(min(100%,330px),1fr))] gap-12 items-start">
        <div>
          <EditableText
            path="stepChange.risk.eyebrow"
            as="div"
            className="font-tae text-[clamp(13px,1.3vw,15px)] tracking-[2.5px] text-[#9CAFA5] mb-5"
            placeholder="שורת פתיחה"
          />
          <h2 className="m-0 mb-[26px] font-black text-[clamp(32px,4.4vw,58px)] leading-[1.1] tracking-[-1.1px] [text-wrap:balance]">
            <EditableText
              path="stepChange.risk.titleAccent"
              as="span"
              className="text-[#74DF93]"
              placeholder="ציטוט מודגש"
            />{" "}
            <EditableText path="stepChange.risk.title" as="span" multiline placeholder="המשך כותרת" />
          </h2>
          <EditableText
            path="stepChange.risk.body1"
            as="p"
            multiline
            className="m-0 mb-5 text-[#9CAFA5] text-[clamp(16px,1.7vw,19px)] leading-[1.75]"
            placeholder="פסקה"
          />
          <EditableText
            path="stepChange.risk.body2"
            as="p"
            multiline
            className="m-0 mb-5 text-[#9CAFA5] text-[clamp(16px,1.7vw,19px)] leading-[1.75]"
            placeholder="פסקה"
            hideIfEmpty
          />
          <EditableText
            path="stepChange.risk.punch"
            as="p"
            multiline
            className="m-0 font-extrabold text-[#EFEFEF] text-[clamp(18px,1.9vw,22px)] leading-[1.55]"
            placeholder="משפט מחץ"
          />
        </div>

        {rows.length > 0 && (
          <div className="bg-[#273533] border border-white/[0.12] rounded-[22px] px-[26px] py-[30px] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr>
                  <th scope="col" className="text-sm font-bold text-[#9CAFA5] pb-3.5 border-b border-white/[0.12]">
                    <EditableText path="stepChange.risk.badHead" as="span" placeholder="מה לא תשמעו" />
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-bold text-[#74DF93] pb-3.5 pr-[18px] border-b border-white/[0.12] border-r border-r-white/[0.12]"
                  >
                    <EditableText path="stepChange.risk.goodHead" as="span" placeholder="מה כן תקבלו" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((_, i) => (
                  <tr key={i}>
                    <td
                      className={`py-[18px] text-[clamp(15px,1.6vw,17.5px)] text-[#9CAFA5] line-through decoration-white/30 ${
                        i > 0 ? "border-t border-white/[0.08]" : ""
                      }`}
                    >
                      <EditableText path={`stepChange.risk.rows.${i}.bad`} as="span" placeholder="—" />
                    </td>
                    <td
                      className={`p-[18px] text-[clamp(15px,1.6vw,17.5px)] font-bold text-[#EFEFEF] border-r border-white/[0.12] ${
                        i > 0 ? "border-t border-t-white/[0.08]" : ""
                      }`}
                    >
                      <EditableText path={`stepChange.risk.rows.${i}.good`} as="span" placeholder="+" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EditableSection>
  );
}
