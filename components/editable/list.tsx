"use client";

import { Trash2, MoveLeft, MoveRight, Plus } from "lucide-react";
import { useEditList } from "@/lib/edit-context";
import { cn } from "@/lib/utils";

export function EditableItemControls({
  listPath,
  index,
  className,
}: {
  listPath: string;
  index: number;
  className?: string;
}) {
  const list = useEditList(listPath);
  if (!list.enabled) return null;

  return (
    <div
      className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white rounded-full shadow-lg border border-slate-200 px-1 py-1 opacity-0 group-hover/edit-item:opacity-100 transition-opacity",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => list.move(index, index - 1)}
        disabled={index === 0}
        className="size-7 rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        title="הזז ימינה"
      >
        <MoveRight className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => list.move(index, index + 1)}
        disabled={index >= list.items.length - 1}
        className="size-7 rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        title="הזז שמאלה"
      >
        <MoveLeft className="size-4" />
      </button>
      <div className="w-px h-5 bg-slate-200" />
      <button
        type="button"
        onClick={() => {
          if (confirm("למחוק פריט זה?")) list.remove(index);
        }}
        className="size-7 rounded-full hover:bg-destructive/10 text-destructive flex items-center justify-center"
        title="מחק"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function EditableItemWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("group/edit-item relative", className)}>{children}</div>;
}

export function EditableAddItem({
  listPath,
  defaultItem,
  label,
  className,
}: {
  listPath: string;
  defaultItem: unknown;
  label: string;
  className?: string;
}) {
  const list = useEditList(listPath);
  if (!list.enabled) return null;

  return (
    <button
      type="button"
      onClick={() => list.add(defaultItem)}
      className={cn(
        "group/add inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border-2 border-dashed border-brand-gold/50 hover:border-brand-gold hover:bg-brand-gold/10 text-brand-gold-light font-bold transition-colors w-full",
        className
      )}
    >
      <span className="size-9 rounded-full bg-brand-gold/20 group-hover/add:bg-brand-gold/40 flex items-center justify-center">
        <Plus className="size-5" />
      </span>
      {label}
    </button>
  );
}
