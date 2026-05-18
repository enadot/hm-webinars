"use client";

import { createContext, useContext } from "react";
import type { CampaignConfig } from "@/lib/campaign-schema";
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
