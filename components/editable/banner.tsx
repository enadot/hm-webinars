"use client";

import { EditableImage } from "./image";
import { useEdit } from "@/lib/edit-context";

/**
 * Optional sponsor / promo banner shown above the lead form.
 * - Edit mode: always renders a slot (placeholder if no image) plus a
 *   link-URL input below it for the click-through URL.
 * - Public mode: renders only when an image has been uploaded; wraps the
 *   image in an <a> when a linkUrl is set.
 *
 * Designed around a 970×500 max width — the actual aspect ratio follows
 * the uploaded image.
 */
export function EditableBanner() {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const banner = ctx?.config.banner;
  const imageUrl = banner?.imageUrl || "";
  const linkUrl = banner?.linkUrl || "";

  if (!editing && !imageUrl) return null;

  const Img = (
    <EditableImage
      path="banner.imageUrl"
      alt={banner?.alt || "באנר פרסומי"}
      className="block w-full h-auto rounded-xl shadow-md"
      placeholderClassName="w-full aspect-[970/500] rounded-xl"
      placeholderLabel="באנר 970×500"
      hideIfEmpty={false}
    />
  );

  return (
    <section
      aria-label="באנר פרסומי"
      className="py-8 md:py-12 bg-transparent"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-[970px] mx-auto">
          {editing ? (
            <>
              {Img}
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  value={linkUrl}
                  onChange={(e) => ctx?.update("banner.linkUrl", e.target.value)}
                  placeholder="קישור (אופציונלי): https://..."
                  dir="ltr"
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-mono bg-white"
                />
                <input
                  value={banner?.alt || ""}
                  onChange={(e) => ctx?.update("banner.alt", e.target.value)}
                  placeholder="תיאור הבאנר (alt)"
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                />
              </div>
            </>
          ) : linkUrl ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block"
            >
              {Img}
            </a>
          ) : (
            Img
          )}
        </div>
      </div>
    </section>
  );
}
