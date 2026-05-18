"use client";

import { createContext, useContext } from "react";
import type { CampaignConfig, StyleOverride } from "@/lib/campaign-schema";
import { getByPath } from "@/lib/path-utils";

export type EditCtxValue = {
  enabled: boolean;
  config: CampaignConfig;
  update: (path: string, value: unknown) => void;
};

const EditContext = createContext<EditCtxValue | null>(null);

export function useEdit(): EditCtxValue | null {
  return useContext(EditContext);
}

export function useEditValue<T = unknown>(path: string, fallback?: T): T | undefined {
  const ctx = useContext(EditContext);
  if (!ctx) return fallback;
  return (getByPath<T>(ctx.config, path) ?? fallback) as T | undefined;
}

// Style overrides are stored as a flat record keyed by a string that itself
// contains dots (e.g. "speakers.list.0.name"), so we must replace the whole
// map rather than use the dot-path update helper.
export function useStyleOverride(
  key: string
): [StyleOverride | undefined, (next: StyleOverride) => void] {
  const ctx = useContext(EditContext);
  const map = (ctx?.config.styleOverrides ?? {}) as Record<string, StyleOverride>;
  const current = map[key];
  const set = (next: StyleOverride) => {
    if (!ctx) return;
    const nextMap = { ...map };
    if (!next || (!next.color && !next.backgroundColor)) delete nextMap[key];
    else nextMap[key] = next;
    ctx.update("styleOverrides", nextMap);
  };
  return [current, set];
}

export function useEditList<T = unknown>(listPath: string) {
  const ctx = useContext(EditContext);
  const items = ((getByPath(ctx?.config, listPath) ?? []) as T[]) || [];
  return {
    enabled: !!ctx?.enabled,
    items,
    remove: (i: number) => ctx?.update(listPath, items.filter((_, j) => j !== i)),
    add: (item: T) => ctx?.update(listPath, [...items, item]),
    move: (from: number, to: number) => {
      if (to < 0 || to >= items.length) return;
      const next = [...items];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      ctx?.update(listPath, next);
    },
  };
}

export function EditProvider({
  value,
  children,
}: {
  value: EditCtxValue;
  children: React.ReactNode;
}) {
  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}
