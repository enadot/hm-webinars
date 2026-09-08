import { EditableText } from "@/components/editable/text";
import { EditableImage } from "@/components/editable/image";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";
import { ScTypingQuestion } from "./typing-question";

export function ScHero({ config }: { config: CampaignConfig }) {
  const { hero, brand, speakers, stepChange } = config;
  const sc = stepChange;
  const chips = sc?.heroChips ?? [];
  const portraits = speakers.list.slice(0, 3);
  const trust = sc?.trust ?? [];

  return (
    <EditableSection
      sectionKey="hero"
      className="min-h-[100svh] flex flex-col relative text-[#EFEFEF] bg-[radial-gradient(circle_at_88%_12%,rgba(232,121,43,0.20),transparent_46%),radial-gradient(circle_at_8%_78%,rgba(116,223,147,0.14),transparent_52%)] bg-[#162321]"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 max-w-[1160px] w-full mx-auto px-5 md:px-6 py-3.5 md:py-5 box-border">
        {/* One row on every width: the partner credit never wraps under the
            brand mark, and on phones it is the whole header. */}
        <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
          {/* The brand mark is white artwork; it sits straight on the dark hero
              ground, with no chip behind it. */}
          <span className="inline-flex items-center shrink-0">
            <EditableImage
              path="brand.logoUrl"
              alt={brand.name || "logo"}
              className="h-[18px] sm:h-6 md:h-7 w-auto object-contain block"
              placeholderClassName="h-7 w-32"
              placeholderLabel="לוגו"
              hideIfEmpty={false}
            />
          </span>
          {sc?.brandChip && (
            <>
              <span aria-hidden className="w-px h-4 md:h-5 bg-white/[0.18] shrink-0" />
              <span className="inline-flex items-center gap-1.5 md:gap-2 text-[12.5px] md:text-sm text-[#9CAFA5] whitespace-nowrap min-w-0">
                <span aria-hidden className="size-[7px] md:size-[9px] rounded-full bg-[#74DF93] shrink-0" />
                <span className="inline-flex items-center gap-1.5 md:gap-2 min-w-0">
                  <EditableText path="stepChange.brandChip" as="span" placeholder="בשיתוף" />
                  {/* The partner supplies its own mark; until one is set the
                      name stands in as text so the credit is never missing. */}
                  {sc?.partnerLogoUrl ? (
                    <EditableImage
                      path="stepChange.partnerLogoUrl"
                      alt={sc?.brandChipStrong || "לוגו שותף"}
                      className="h-[22px] md:h-7 w-auto max-w-[150px] md:max-w-none object-contain block"
                      placeholderClassName="h-5 w-24"
                      placeholderLabel="לוגו שותף"
                      hideIfEmpty={false}
                    />
                  ) : (
                    <EditableText
                      path="stepChange.brandChipStrong"
                      as="b"
                      className="text-[#EFEFEF]"
                      placeholder="שם השותף"
                      hideIfEmpty
                    />
                  )}
                </span>
              </span>
            </>
          )}
        </div>
        {/* Phones get no button up here: the sticky bar at the bottom is the
            same link, and a second one crowds a 390px header. */}
        <a
          href="#register"
          className="hidden md:inline-block bg-[#74DF93] hover:bg-[#A1F0B8] transition-colors text-[#162321] font-extrabold text-[15px] px-[22px] py-[11px] rounded-full whitespace-nowrap shrink-0"
        >
          <EditableText path="stepChange.topbarCta" as="span" placeholder="CTA עליון" />
        </a>
      </div>

      {/* Hero body */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-[1000px] w-full mx-auto px-5 md:px-6 pt-4 md:pt-6 pb-12 md:pb-[72px] box-border gap-5 md:gap-7">
        <EditableText
          path="hero.eyebrow"
          as="div"
          className="font-tae text-[12px] md:text-[clamp(13px,1.3vw,15px)] tracking-[1px] md:tracking-[2.5px] text-[#9CAFA5]"
          placeholder="שורת פתיחה"
        />
        <h1 className="m-0 font-black text-[clamp(34px,7.2vw,104px)] leading-[1.06] md:leading-[1.04] tracking-[-1px] md:tracking-[-1.5px] [text-wrap:balance]">
          <EditableText path="hero.headline" as="span" multiline placeholder="כותרת ראשית" />
          {/* The accent line always starts a new line, as in the approved design. */}
          {hero.headlineAccent ? <br /> : " "}
          <EditableText
            path="hero.headlineAccent"
            as="span"
            className="text-[#74DF93]"
            multiline
            placeholder="הדגשה"
            hideIfEmpty
          />
        </h1>

        {/* Date and time sit above the ask: the visitor decides whether they
            can even make it before being asked to register. */}
        {chips.length > 0 && (
          <ul className="list-none m-0 p-0 flex flex-wrap justify-center gap-x-2 gap-y-2 md:gap-x-3.5 md:gap-y-2.5 font-tae text-[12.5px] md:text-[clamp(12.5px,1.3vw,14.5px)] text-[#9CAFA5]">
            {chips.map((_, i) => (
              <li key={i} className="border border-white/[0.16] rounded-full px-3.5 py-2 md:px-[18px] md:py-[9px]">
                <EditableText path={`stepChange.heroChips.${i}`} as="span" placeholder="פרט" />
              </li>
            ))}
          </ul>
        )}

        {/* On phones the fixed bar at the bottom is the one registration
            button; the note under it (free, limited seats) still shows here. */}
        <div className="flex flex-col items-center gap-2.5">
          <a
            href="#register"
            className="hidden md:inline-flex bg-[#74DF93] hover:bg-[#A1F0B8] transition-colors text-[#162321] font-extrabold text-[clamp(18px,1.7vw,21px)] px-11 py-5 rounded-full items-center gap-2.5"
          >
            <EditableText path="hero.ctaText" as="span" placeholder="טקסט כפתור" />
            <span aria-hidden>&#8592;</span>
          </a>
          <EditableText
            path="stepChange.heroCtaNote"
            as="span"
            className="text-sm text-[#9CAFA5]"
            placeholder="הערה מתחת לכפתור"
            hideIfEmpty
          />
        </div>

        <EditableText
          path="hero.description"
          as="p"
          multiline
          className="m-0 text-[17px] md:text-[clamp(18px,1.9vw,22px)] leading-[1.6] md:leading-[1.65] text-[#9CAFA5] max-w-[54ch] [text-wrap:pretty]"
          placeholder="פסקת תיאור"
        />

        <ScTypingQuestion questions={sc?.typingQuestions ?? []} />

        {/* Speaker portraits: three across on phones (a 2 + 1 wrap left one
            portrait orphaned), the same trio at full size from tablet up. */}
        {portraits.length > 0 && (
          <div className="flex flex-wrap justify-center items-start md:items-end gap-x-3 gap-y-4 md:gap-[18px] mt-1.5 w-full">
            {portraits.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 md:gap-3 w-[min(30%,220px)] md:w-[min(46%,220px)]"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden border border-[#74DF93]/45 bg-[#273533] shadow-[0_18px_44px_rgba(0,0,0,0.45)]">
                  <EditableImage
                    path={`speakers.list.${i}.photoUrl`}
                    alt={s.name || "מרצה"}
                    className="block w-full h-full object-cover object-[50%_18%]"
                    placeholderClassName="w-full h-full"
                    placeholderLabel="תמונת מרצה"
                    hideIfEmpty={false}
                  />
                </div>
                <div className="text-center">
                  <EditableText
                    path={`speakers.list.${i}.name`}
                    as="div"
                    className="font-black text-[15px] md:text-[clamp(17px,1.8vw,21px)] leading-[1.25]"
                    placeholder="שם"
                  />
                  <EditableText
                    path={`speakers.list.${i}.role`}
                    as="div"
                    className="text-[12px] md:text-[13.5px] text-[#74DF93] leading-[1.4] md:leading-[1.45] mt-[3px] [text-wrap:balance]"
                    placeholder="תפקיד"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust strip */}
      {trust.length > 0 && (
        <div className="border-y border-white/[0.08]">
          <div className="max-w-[1160px] mx-auto px-5 md:px-6 py-5 md:py-[26px] box-border grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-4 gap-y-5 md:gap-[22px]">
            {trust.map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <EditableText
                  path={`stepChange.trust.${i}.value`}
                  as="span"
                  className="font-tae font-semibold text-[22px] md:text-[clamp(26px,2.6vw,34px)] text-[#74DF93] leading-none"
                  placeholder="נתון"
                />
                <EditableText
                  path={`stepChange.trust.${i}.label`}
                  as="span"
                  className="text-[13px] md:text-[15px] text-[#9CAFA5] leading-[1.4]"
                  placeholder="תיאור"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </EditableSection>
  );
}
