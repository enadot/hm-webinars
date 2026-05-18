"use client";

import { useState } from "react";
import { Upload, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { useEdit } from "@/lib/edit-context";
import { getByPath } from "@/lib/path-utils";
import { cn } from "@/lib/utils";

type EditableImageProps = {
  path: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  placeholderClassName?: string;
  placeholderLabel?: string;
  /** When true and no value, return null in read mode (default true) */
  hideIfEmpty?: boolean;
};

export function EditableImage({
  path,
  alt,
  className,
  wrapperClassName,
  placeholderClassName,
  placeholderLabel = "תמונה",
  hideIfEmpty = true,
}: EditableImageProps) {
  const ctx = useEdit();
  const value = (getByPath<string>(ctx?.config, path) ?? "") as string;
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json?.url) ctx?.update(path, json.url);
    else setErr(json?.error || "העלאה נכשלה");
    setUploading(false);
  }

  if (!ctx?.enabled) {
    if (!value) return hideIfEmpty ? null : null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={value} alt={alt || ""} className={className} />
    );
  }

  // Edit mode
  if (!value) {
    return (
      <label
        className={cn(
          "group relative flex items-center justify-center cursor-pointer bg-brand-primary/5 border-2 border-dashed border-brand-primary/30 hover:border-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors",
          placeholderClassName || className
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-2 p-4 text-brand-primary">
          {uploading ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <ImagePlus className="size-7" />
          )}
          <span className="text-xs font-bold">העלאת {placeholderLabel}</span>
        </div>
        {err && (
          <span className="absolute bottom-1 right-1 left-1 text-[10px] bg-destructive text-white rounded px-2 py-0.5">
            {err}
          </span>
        )}
      </label>
    );
  }

  return (
    <div className={cn("relative group", wrapperClassName)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={value} alt={alt || ""} className={className} />
      <label className="absolute inset-0 cursor-pointer rounded-[inherit] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-brand-dark rounded-lg text-xs font-bold shadow">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          החלפה
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            ctx?.update(path, "");
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 text-destructive rounded-lg text-xs font-bold shadow hover:bg-white"
        >
          <Trash2 className="size-3.5" />
          הסר
        </button>
      </label>
      {err && (
        <span className="absolute bottom-1 right-1 left-1 text-[10px] bg-destructive text-white rounded px-2 py-0.5">
          {err}
        </span>
      )}
    </div>
  );
}
