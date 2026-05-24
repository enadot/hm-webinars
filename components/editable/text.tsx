"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { useEdit, useStyleOverride } from "@/lib/edit-context";
import { getByPath } from "@/lib/path-utils";
import { cn } from "@/lib/utils";
import type { StyleOverride } from "@/lib/campaign-schema";
import { ColorPopover } from "./color-popover";

const INLINE_TAGS = new Set(["span", "a", "em", "strong", "b", "i", "small"]);

function styleFrom(o: StyleOverride | undefined) {
  if (!o) return undefined;
  return {
    color: o.color || undefined,
    backgroundColor: o.backgroundColor || undefined,
  };
}

type EditableTextProps = {
  path: string;
  as?: ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  hideIfEmpty?: boolean;
};

export function EditableText({
  path,
  as,
  className,
  placeholder,
  multiline = false,
  hideIfEmpty = false,
}: EditableTextProps) {
  const ctx = useEdit();
  const value = (getByPath<string>(ctx?.config, path) ?? "") as string;
  const [override, setOverride] = useStyleOverride(path);
  const styleOverride = styleFrom(override);
  const ref = useRef<HTMLElement>(null);
  const focusedRef = useRef(false);

  // Sync DOM content to value when not focused. We deliberately avoid setting
  // children/dangerouslySetInnerHTML on every render so the user's in-progress
  // edits aren't clobbered. On blur or external state change, we re-sync.
  useEffect(() => {
    if (focusedRef.current) return;
    const el = ref.current;
    if (!el) return;
    if (multiline) {
      // Convert \n into <br> for rendering, but compare against innerText.
      const html = escapeHtml(value).replace(/\n/g, "<br/>");
      if (el.innerHTML !== html) el.innerHTML = html;
    } else {
      if (el.textContent !== value) el.textContent = value;
    }
  });

  const Tag = (as || "span") as ElementType;

  // Read-only mode
  if (!ctx?.enabled) {
    // Never leak the editor placeholder ("כותרת" / "תיאור" / ...) into the
    // public page. Empty value → render nothing.
    if (!value) return null;
    if (multiline) {
      const lines = value.split("\n");
      return (
        <Tag className={className} style={styleOverride}>
          {lines.map((l, i) => (
            <span key={i}>
              {l}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </Tag>
      );
    }
    return (
      <Tag className={className} style={styleOverride}>
        {value}
      </Tag>
    );
  }

  // Edit mode
  const tagName = typeof Tag === "string" ? Tag : "span";
  const isInline = INLINE_TAGS.has(tagName);
  const Wrapper = (isInline ? "span" : "div") as ElementType;

  return (
    <Wrapper
      className="relative group"
      style={{
        display: isInline ? "inline-block" : "block",
        ...(isInline ? { verticalAlign: "top" } : {}),
      }}
    >
      <ColorPopover
        className="-top-3 -left-3"
        value={override}
        onChange={setOverride}
      />
      <Tag
        ref={ref}
        style={styleOverride}
        className={cn(
          className,
          "outline-2 outline-dashed outline-transparent hover:outline-brand-gold/70 focus:outline-brand-gold focus:outline-solid -outline-offset-2 rounded cursor-text transition-[outline-color]",
          !value &&
            "min-w-[3ch] min-h-[1em] before:content-[attr(data-placeholder)] before:text-current before:opacity-40 empty:before:inline"
        )}
        contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder || "..."}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={(e: FocusEvent<HTMLElement>) => {
        focusedRef.current = false;
        const text = multiline
          ? e.currentTarget.innerText
          : (e.currentTarget.textContent ?? "");
        const next = multiline ? text : text.trim();
        if (next !== value) ctx.update(path, next);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
        if (e.key === "Escape") {
          // Revert to current value
          const el = e.currentTarget;
          if (multiline) el.innerHTML = escapeHtml(value).replace(/\n/g, "<br/>");
          else el.textContent = value;
          el.blur();
        }
      }}
      onPaste={(e: ClipboardEvent<HTMLElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }}
      />
    </Wrapper>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
