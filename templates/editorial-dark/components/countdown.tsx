"use client";

import { useEffect, useState } from "react";
import { EditableText } from "@/components/editable/text";
import type { CampaignConfig } from "@/lib/campaign-schema";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; expired: boolean };

function getTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

/**
 * Bold full-width date + countdown strip for the Editorial Dark hero.
 * Big Tel Aviv Modernist digits on dark tiles with a blue hairline,
 * next to a loud "הוובינר ביום ראשון 26.7 בשעה 20:00" statement.
 */
export function EdCountdownStrip({ config }: { config: CampaignConfig }) {
  const { webinar } = config;
  const target = webinar.dateISO ? new Date(webinar.dateISO).getTime() : 0;
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!target) return;
    setTime(getTimeLeft(target));
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!webinar.dateISO) return null;

  const units: Array<[string, number | null]> = [
    ["ימים", time?.days ?? null],
    ["שעות", time?.hours ?? null],
    ["דקות", time?.minutes ?? null],
    ["שניות", time?.seconds ?? null],
  ];

  return (
    <div className="relative border-y border-white/[0.07] bg-[#0c0d10] overflow-hidden">
      {/* subtle blue glow behind the strip */}
      <div className="absolute -top-24 right-1/4 w-96 h-48 bg-[#0052ff]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-6 py-8 md:py-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Date statement */}
        <div className="text-center lg:text-start">
          <div className="inline-flex items-center gap-2 font-tam text-[11px] tracking-[2px] text-[#7c828a] mb-3">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#0052ff] opacity-75 animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#3d7bff]" />
            </span>
            LIVE · ZOOM
          </div>
          <div className="text-[clamp(22px,3vw,36px)] font-bold leading-[1.25] [text-wrap:balance]">
            <span>הוובינר ביום </span>
            <EditableText
              path="webinar.dayShort"
              as="span"
              className="text-[#3d7bff]"
              placeholder="ראשון"
            />{" "}
            <EditableText
              path="webinar.dateShort"
              as="span"
              className="text-[#3d7bff] font-tam"
              placeholder="26.7"
            />
            <span> בשעה </span>
            <EditableText path="webinar.time" as="span" className="font-tam" placeholder="20:00" />
            <span> בערב</span>
          </div>
        </div>

        {/* Countdown tiles */}
        {time?.expired ? (
          <div className="font-tam text-[clamp(24px,3vw,40px)] font-bold text-[#3d7bff]">
            הוובינר מתחיל!
          </div>
        ) : (
          <div className="flex items-start gap-2.5 sm:gap-3" dir="ltr">
            {units.map(([label, value], i) => (
              <div key={label} className="flex items-start gap-2.5 sm:gap-3">
                <div className="relative w-[72px] sm:w-24 md:w-28 rounded-2xl bg-[#16181c] border border-white/10 px-2 py-3.5 sm:py-4 text-center shadow-[0_12px_32px_rgba(0,0,0,0.45)] overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#3d7bff] to-transparent" />
                  <div
                    className={`font-tam text-[clamp(30px,4vw,52px)] font-semibold tabular-nums leading-none ${
                      label === "שניות" ? "text-[#3d7bff]" : "text-white"
                    }`}
                    suppressHydrationWarning
                  >
                    {value === null ? "--" : String(value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#7c828a] mt-2 font-semibold">
                    {label}
                  </div>
                </div>
                {i < units.length - 1 && (
                  <span className="font-tam text-[clamp(22px,3vw,38px)] text-[#0052ff] leading-none pt-3 sm:pt-4 select-none">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
