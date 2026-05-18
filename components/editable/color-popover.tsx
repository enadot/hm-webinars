"use client";

import { useState } from "react";
import { Palette, X } from "lucide-react";
import { useEdit } from "@/lib/edit-context";
import type { StyleOverride } from "@/lib/campaign-schema";
import { cn } from "@/lib/utils";

type Field = "color" | "backgroundColor";

const FIELD_LABEL: Record<Field, string> = {
  color: "צבע טקסט",
  backgroundColor: "צבע רקע",
};

const THEME_KEYS: { key: string; label: string }[] = [
  { key: "primary", label: "ראשי" },
  { key: "primary2", label: "ראשי 2" },
  { key: "accent", label: "זהב" },
  { key: "accentLight", label: "זהב בהיר" },
  { key: "purple", label: "סגול" },
  { key: "coral", label: "אלמוג" },
  { key: "dark", label: "כהה" },
];

const SWATCH_EXTRA = ["#FFFFFF", "#000000"];

export function ColorPopover({
  value,
  onChange,
  fields = ["color", "backgroundColor"],
  className,
}: {
  value: StyleOverride | undefined;
  onChange: (next: StyleOverride) => void;
  fields?: Field[];
  className?: string;
}) {
  const ctx = useEdit();
  const [open, setOpen] = useState(false);
  if (!ctx?.enabled) return null;

  const theme = ctx.config.theme as Record<string, string>;
  const themeSwatches = THEME_KEYS.filter((t) => theme[t.key]).map((t) => ({
    label: t.label,
    color: theme[t.key],
  }));
  const swatches = [
    ...themeSwatches,
    ...SWATCH_EXTRA.map((c) => ({ label: c, color: c })),
  ];

  function setField(field: Field, color: string | undefined) {
    const next: StyleOverride = { ...(value ?? {}) };
    if (color == null) delete next[field];
    else next[field] = color;
    onChange(next);
  }

  const hasAny = !!(value?.color || value?.backgroundColor);

  return (
    <div
      className={cn(
        "absolute z-30 transition-opacity",
        open ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        className,
      )}
      dir="rtl"
      contentEditable={false}
      suppressContentEditableWarning
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        title="עריכת צבעים"
        aria-label="עריכת צבעים"
        className={cn(
          "flex items-center justify-center size-7 rounded-full shadow-lg ring-1 ring-black/10 cursor-pointer",
          hasAny ? "bg-brand-primary text-white" : "bg-white text-slate-700",
        )}
      >
        <Palette className="size-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="סגור"
            className="fixed inset-0 z-40 cursor-default"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-9 right-0 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl text-slate-900"
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-extrabold">צבעים</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500"
                aria-label="סגור"
              >
                <X className="size-4" />
              </button>
            </div>

            {fields.map((field) => {
              const current = value?.[field];
              return (
                <div key={field} className="py-2 border-t border-slate-100 first:border-t-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">
                      {FIELD_LABEL[field]}
                    </span>
                    {current && (
                      <button
                        type="button"
                        onClick={() => setField(field, undefined)}
                        className="text-[11px] font-bold text-slate-500 hover:text-destructive"
                      >
                        איפוס
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {swatches.map((s) => {
                      const selected =
                        current?.toLowerCase() === s.color.toLowerCase();
                      return (
                        <button
                          key={field + s.color}
                          type="button"
                          title={s.label}
                          onClick={() => setField(field, s.color)}
                          className={cn(
                            "size-6 rounded-full border cursor-pointer",
                            selected
                              ? "ring-2 ring-brand-primary ring-offset-1 border-transparent"
                              : "border-slate-200",
                          )}
                          style={{ backgroundColor: s.color }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={current || "#000000"}
                      onChange={(e) => setField(field, e.target.value)}
                      className="size-8 rounded-md border border-slate-200 cursor-pointer shrink-0"
                    />
                    <input
                      dir="ltr"
                      value={current || ""}
                      placeholder="ברירת מחדל"
                      onChange={(e) => setField(field, e.target.value || undefined)}
                      className="flex-1 text-xs font-mono text-slate-600 bg-transparent border border-slate-200 rounded-md px-2 h-8 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
