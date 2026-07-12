"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function getTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function Countdown({ targetISO }: { targetISO: string }) {
  const target = new Date(targetISO).getTime();
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft(target));
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!time) {
    return (
      <div className="flex gap-3 sm:gap-5 justify-center" aria-hidden>
        {[0, 0, 0, 0].map((_, i) => (
          <div
            key={i}
            className="w-24 sm:w-32 h-28 sm:h-36 rounded-2xl bg-white/10 backdrop-blur-sm"
          />
        ))}
      </div>
    );
  }

  if (time.expired) {
    return (
      <div className="text-center text-brand-emerald-light text-2xl md:text-3xl font-extrabold">
        הוובינר התחיל!
      </div>
    );
  }

  const units: Array<[string, number]> = [
    ["ימים", time.days],
    ["שעות", time.hours],
    ["דקות", time.minutes],
    ["שניות", time.seconds],
  ];

  return (
    <div className="flex gap-3 sm:gap-5 justify-center">
      {units.map(([label, value]) => (
        <div
          key={label}
          className="relative w-24 sm:w-32 md:w-36 rounded-2xl bg-gradient-to-br from-white/12 to-white/[0.04] backdrop-blur-xl border border-brand-emerald/25 px-3 py-4 text-center shadow-xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-emerald-light/70 to-transparent" />
          <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white tabular-nums leading-none">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm md:text-base text-brand-mint/80 mt-2 font-bold uppercase tracking-wider">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
