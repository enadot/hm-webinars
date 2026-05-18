"use client";

import { useEffect, useRef } from "react";

export type Utm = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

const KEY = "lead_utm";
const PARAM_MAP: Record<string, keyof Utm> = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
};

/**
 * Captures UTM params on first landing (first-touch attribution) and persists
 * them in sessionStorage so they survive in-page navigation. Returns a getter
 * that always reflects the captured values.
 */
export function useUtm(): { get: () => Utm } {
  const ref = useRef<Utm>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already captured this session?
    try {
      const stored = sessionStorage.getItem(KEY);
      if (stored) {
        ref.current = JSON.parse(stored) as Utm;
      }
    } catch {
      /* ignore */
    }

    // Read from current URL — only overwrite a field if it's present in the URL
    const params = new URLSearchParams(window.location.search);
    const fromUrl: Utm = {};
    let hasAny = false;
    for (const [param, key] of Object.entries(PARAM_MAP)) {
      const v = params.get(param);
      if (v) {
        fromUrl[key] = v.slice(0, 255);
        hasAny = true;
      }
    }

    if (hasAny) {
      const merged: Utm = { ...ref.current, ...fromUrl };
      ref.current = merged;
      try {
        sessionStorage.setItem(KEY, JSON.stringify(merged));
      } catch {
        /* ignore */
      }
    }
  }, []);

  return { get: () => ref.current };
}
