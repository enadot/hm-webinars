"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useEdit, useStyleOverride } from "@/lib/edit-context";
import { cn } from "@/lib/utils";
import { ColorPopover } from "./color-popover";

export function EditableSection({
  sectionKey,
  as,
  className,
  id,
  style,
  hideVisibilityToggle,
  children,
}: {
  sectionKey: string;
  as?: ElementType;
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Suppress the generic show/hide toggle (use when the section has its own). */
  hideVisibilityToggle?: boolean;
  children: ReactNode;
}) {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const [override, setOverride] = useStyleOverride(`section:${sectionKey}`);
  const Tag = (as || "section") as ElementType;
  const hidden = !!override?.hidden;

  // Public page: hide the section entirely when marked hidden.
  if (!editing && hidden) return null;

  const mergedStyle: CSSProperties | undefined = override?.backgroundColor
    ? { ...style, backgroundColor: override.backgroundColor, backgroundImage: "none" }
    : style;

  return (
    <Tag
      id={id}
      className={cn(className, "relative group", editing && hidden && "opacity-50")}
      style={mergedStyle}
    >
      <ColorPopover
        className="top-3 left-3"
        fields={["backgroundColor"]}
        value={override}
        onChange={setOverride}
      />
      {editing && !hideVisibilityToggle && (
        <button
          type="button"
          onClick={() => setOverride({ ...(override ?? {}), hidden: !hidden })}
          title={hidden ? "הצגת הסקציה בדף הציבורי" : "הסתרת הסקציה מהדף הציבורי"}
          aria-label={hidden ? "הצגה" : "הסתרה"}
          className={cn(
            "absolute top-3 left-14 z-30 inline-flex items-center justify-center size-7 rounded-full shadow-lg ring-1 ring-black/10 cursor-pointer transition-opacity",
            hidden
              ? "bg-amber-500 text-white opacity-100"
              : "bg-white text-slate-700 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          )}
        >
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
      {editing && hidden && (
        <div
          className="absolute top-3 left-24 z-30 inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-white px-3 py-1 text-xs font-bold shadow-lg pointer-events-none"
          aria-hidden
        >
          מוסתר מהדף הציבורי
        </div>
      )}
      {children}
    </Tag>
  );
}
