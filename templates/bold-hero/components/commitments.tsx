"use client";

import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { EditableText } from "@/components/editable/text";
import { EditableImage } from "@/components/editable/image";
import { EditableSection } from "@/components/editable/section";
import { useEdit } from "@/lib/edit-context";
import type { CampaignConfig } from "@/lib/campaign-schema";

type Commitments = NonNullable<CampaignConfig["commitments"]>;

export function BoldCommitments({ commitments }: { commitments: Commitments }) {
  const ctx = useEdit();
  const editing = !!ctx?.enabled;
  const enabled = commitments.enabled !== false;

  // Public page: render only when the section is turned on.
  if (!editing && !enabled) return null;

  return (
    <EditableSection
      sectionKey="commitments"
      hideVisibilityToggle
      className={`py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white to-slate-50 ${
        editing && !enabled ? "opacity-50" : ""
      }`}
    >
      {editing && (
        <button
          type="button"
          onClick={() => ctx?.update("commitments.enabled", !enabled)}
          title={enabled ? "הסתרת הסקציה מהדף הציבורי" : "הצגת הסקציה בדף הציבורי"}
          className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-lg ring-1 ring-black/10"
        >
          {enabled ? (
            <>
              <EyeOff className="size-4 text-slate-600" />
              <span className="text-slate-700">מוצג בדף — לחצו להסתרה</span>
            </>
          ) : (
            <>
              <Eye className="size-4 text-brand-primary" />
              <span className="text-brand-primary">מוסתר מהדף — לחצו להצגה</span>
            </>
          )}
        </button>
      )}

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
            <ShieldCheck className="size-5" />
            <EditableText path="commitments.eyebrow" as="span" placeholder="באדג'" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark mb-6 leading-[1.05] tracking-tight">
            <EditableText path="commitments.title" as="span" placeholder="כותרת" />
            <br />
            <EditableText
              path="commitments.titleAccent"
              as="span"
              className="text-gradient-gold"
              placeholder="כותרת מודגשת"
              hideIfEmpty
            />
          </h2>
          <EditableText
            path="commitments.body"
            as="p"
            multiline
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
            placeholder="תיאור"
            hideIfEmpty
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <EditableImage
            path="commitments.imageUrl"
            alt={commitments.title || ""}
            className="w-full h-auto rounded-3xl shadow-card-lift ring-1 ring-slate-200"
            placeholderClassName="w-full aspect-[3/4] rounded-3xl"
            placeholderLabel="תמונת אינפוגרפיקה"
            hideIfEmpty={false}
          />
        </div>
      </div>
    </EditableSection>
  );
}
