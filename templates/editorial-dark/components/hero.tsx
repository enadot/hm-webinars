import { EditableText } from "@/components/editable/text";
import { EditableImage } from "@/components/editable/image";
import { EditableSection } from "@/components/editable/section";
import { EdCountdownStrip } from "./countdown";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function EdHero({ config }: { config: CampaignConfig }) {
  const { hero, webinar, brand, editorial } = config;
  const salaryRows = editorial?.salaryCard?.rows ?? [];

  return (
    <EditableSection sectionKey="hero" className="relative flex flex-col bg-[#0a0b0d] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full max-w-[1200px] mx-auto px-6 py-6 md:py-7">
        <EditableImage
          path="brand.logoUrl"
          alt={brand.name || "logo"}
          className="h-10 md:h-14 w-auto object-contain"
          placeholderClassName="h-12 w-48"
          placeholderLabel="לוגו"
          hideIfEmpty={false}
        />
        <a
          href="#register"
          className="bg-[#0052ff] hover:bg-[#003ecc] transition-colors text-white font-semibold text-[15px] md:text-base px-6 py-3 rounded-full"
        >
          <EditableText path="editorial.topbarCta" as="span" placeholder="CTA עליון" />
        </a>
      </div>

      {/* Hero body */}
      <div className="flex-1 grid lg:grid-cols-2 gap-12 items-center w-full max-w-[1200px] mx-auto px-6 pt-8 pb-16 lg:pb-20">
        {/* Copy */}
        <div className="flex flex-col items-start gap-6 max-w-[620px]">
          <div className="flex items-center gap-2.5 border border-white/15 rounded-full px-5 py-2.5 font-tam text-[13px] md:text-sm tracking-wide text-[#a8acb3]">
            <span className="size-[7px] rounded-full bg-[#0052ff] inline-block shrink-0" />
            <EditableText path="hero.eyebrow" as="span" placeholder="באדג' עליון" />
          </div>
          <h1 className="m-0 font-medium text-[clamp(40px,5.8vw,84px)] leading-[1.08] tracking-[-1.2px] [text-wrap:pretty]">
            <EditableText path="hero.headline" as="span" multiline placeholder="כותרת ראשית" />{" "}
            <EditableText
              path="hero.headlineAccent"
              as="span"
              className="text-[#3d7bff]"
              placeholder="הדגשה"
              hideIfEmpty
            />{" "}
            <EditableText path="hero.subheadline" as="span" placeholder="המשך כותרת" hideIfEmpty />
          </h1>
          <EditableText
            path="hero.description"
            as="p"
            multiline
            className="m-0 text-[clamp(17px,1.8vw,22px)] leading-[1.65] text-[#a8acb3] max-w-[54ch] [text-wrap:pretty]"
            placeholder="פסקת תיאור"
          />
          <div className="flex flex-col items-start gap-3">
            <a
              href="#register"
              className="bg-[#0052ff] hover:bg-[#003ecc] hover:-translate-y-0.5 transition-all text-white font-bold text-lg md:text-xl px-9 py-[18px] rounded-full inline-flex items-center gap-2.5 shadow-[0_12px_40px_rgba(0,82,255,0.35)]"
            >
              <EditableText path="hero.ctaText" as="span" placeholder="טקסט כפתור" />
              <span className="font-tam">&#8592;</span>
            </a>
            {webinar.spotsLimited && (
              <div className="text-[14.5px] md:text-[15px] text-[#7c828a]">
                מספר המקומות מוגבל · ההרשמה אורכת פחות מדקה
              </div>
            )}
          </div>
          <EditableText
            path="webinar.dateLabel"
            as="div"
            className="font-tam text-[14px] md:text-[15px] text-[#a8acb3] border-t border-white/10 pt-4 mt-1.5 w-full"
            placeholder="פרטי מועד הוובינר"
          />
        </div>

        {/* Portrait composition */}
        <div className="relative justify-self-center w-full max-w-[420px] mt-2">
          <div className="relative rounded-3xl overflow-hidden bg-[#16181c] border border-white/[0.08]">
            <div className="aspect-[4/5]">
              <EditableImage
                path="speakers.list.0.photoUrl"
                alt={config.speakers.list[0]?.name || "מרצה"}
                className="block w-full h-full object-cover object-[50%_12%]"
                placeholderClassName="w-full h-full"
                placeholderLabel="תמונת מרצה"
                hideIfEmpty={false}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-[#0a0b0d]/[0.92] to-transparent pointer-events-none" />
            <div className="absolute bottom-[18px] right-5 left-5 flex flex-col gap-0.5">
              <EditableText
                path="speakers.list.0.name"
                as="span"
                className="font-bold text-[21px] md:text-[23px]"
                placeholder="שם המרצה"
              />
              <EditableText
                path="speakers.list.0.role"
                as="span"
                className="text-[14.5px] text-[#a8acb3]"
                placeholder="תפקיד"
              />
            </div>
          </div>

          {/* Floating salary card */}
          {salaryRows.length > 0 && (
            <div className="hidden lg:block absolute top-[26px] -left-[46px] bg-[#16181c] border border-white/10 rounded-2xl px-4 py-3.5 min-w-[170px] shadow-[0_12px_32px_rgba(0,0,0,0.45)] animate-float-y">
              <EditableText
                path="editorial.salaryCard.title"
                as="div"
                className="font-tam text-[10px] tracking-widest text-[#7c828a] mb-2"
                placeholder="כותרת"
              />
              <div className="flex flex-col gap-1.5 text-[12.5px]">
                {salaryRows.map((_, i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <EditableText
                      path={`editorial.salaryCard.rows.${i}.label`}
                      as="span"
                      className="text-[#a8acb3]"
                      placeholder="תחום"
                    />
                    <EditableText
                      path={`editorial.salaryCard.rows.${i}.value`}
                      as="span"
                      className={`font-tam ${i === 0 ? "text-[#05b169]" : ""}`}
                      placeholder="₪"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floating AI chip */}
          <div className="hidden lg:flex absolute bottom-24 -left-[30px] bg-[#16181c] border border-white/10 rounded-full px-4 py-2.5 items-center gap-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)] animate-float-y-slow">
            <EditableText
              path="editorial.heroChipMono"
              as="span"
              className="font-tam text-[11px] text-[#3d7bff]"
              placeholder="AI"
            />
            <EditableText
              path="editorial.heroChipText"
              as="span"
              className="text-[12.5px] text-[#a8acb3]"
              placeholder="טקסט צ'יפ"
            />
          </div>

          {/* Floating blue pill */}
          <div className="hidden lg:block absolute -top-[18px] -right-6 bg-[#0052ff] rounded-full px-4 py-2 text-[12.5px] font-semibold shadow-[0_12px_32px_rgba(0,82,255,0.35)] animate-float-y-fast">
            <EditableText path="editorial.heroPill" as="span" placeholder="טקסט" />
          </div>
        </div>
      </div>

      {/* Bold date + countdown strip */}
      <EdCountdownStrip config={config} />
    </EditableSection>
  );
}
