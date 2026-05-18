"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Loader2,
  Check,
  AlertCircle,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import type { CampaignConfig } from "@/lib/campaign-schema";
import { setByPath } from "@/lib/path-utils";
import { getTemplate } from "@/lib/templates";
import { EditProvider } from "@/lib/edit-context";
import { SettingsPanel } from "./settings-panel";

export type CampaignDraft = {
  id: string;
  slug: string;
  name: string;
  templateId: string;
  published: boolean;
  leadsWebhookUrl: string;
  config: CampaignConfig;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function VisualEditor({ campaign }: { campaign: CampaignDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<CampaignDraft>(campaign);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  const updateConfig = useCallback((path: string, value: unknown) => {
    setDraft((d) => ({ ...d, config: setByPath(d.config, path, value) }));
    setDirty(true);
    setSaveState("idle");
  }, []);

  const patchDraft = useCallback(
    <K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
      setDirty(true);
      setSaveState("idle");
    },
    []
  );

  async function save() {
    setSaveState("saving");
    setSaveError(null);
    const res = await fetch(`/api/admin/campaigns/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) {
      setSaveError(json?.error || "שמירה נכשלה");
      setSaveState("error");
      return;
    }
    setSaveState("saved");
    setDirty(false);
    startTransition(() => router.refresh());
    setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
  }

  const template = getTemplate(draft.templateId);
  const TemplateComponent = template?.Component;

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col">
      {/* Toolbar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 gap-3 shrink-0 z-50">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">חזרה</span>
        </Link>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold text-slate-900 truncate">{draft.name || "ללא שם"}</div>
          <div className="text-xs text-slate-500 font-mono" dir="ltr">
            /{draft.slug}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveState === "saving" && (
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" /> שומר
            </span>
          )}
          {saveState === "saved" && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <Check className="size-3.5" /> נשמר
            </span>
          )}
          {saveState === "error" && (
            <span
              className="text-xs text-destructive font-bold flex items-center gap-1.5"
              title={saveError ?? ""}
            >
              <AlertCircle className="size-3.5" /> שגיאה
            </span>
          )}
          {dirty && saveState === "idle" && (
            <span className="text-xs text-amber-700 font-bold">• שינויים שלא נשמרו</span>
          )}

          {draft.published && (
            <a
              href={`/${draft.slug}`}
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ExternalLink className="size-4" />
              צפייה
            </a>
          )}

          <Button onClick={save} disabled={saveState === "saving"} variant="brand" size="sm">
            {saveState === "saving" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            שמירה
          </Button>

          <button
            onClick={() => setPanelOpen((o) => !o)}
            className={`inline-flex items-center justify-center size-10 rounded-lg ${
              panelOpen ? "bg-brand-primary text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
            aria-label="Toggle settings"
            title="הגדרות"
          >
            <SettingsIcon className="size-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Preview area - the actual template, fully editable inline */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {TemplateComponent ? (
            <EditProvider value={{ enabled: true, config: draft.config, update: updateConfig }}>
              <TemplateComponent config={draft.config} slug={draft.slug} />
            </EditProvider>
          ) : (
            <div className="p-12 text-center text-destructive">
              תבנית לא ידועה: {draft.templateId}
            </div>
          )}
        </div>

        {/* Settings panel (slides in from left) */}
        {panelOpen && (
          <>
            {/* Backdrop on small screens */}
            <button
              onClick={() => setPanelOpen(false)}
              className="lg:hidden absolute inset-0 bg-black/30 z-30"
              aria-label="Close settings"
            />
            <aside className="absolute lg:relative left-0 top-0 bottom-0 w-[400px] max-w-[90vw] shrink-0 bg-white border-l border-slate-200 overflow-y-auto z-40 shadow-2xl lg:shadow-none">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
                <div className="font-extrabold text-slate-900">הגדרות מתקדמות</div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>
              <SettingsPanel draft={draft} onConfig={updateConfig} onPatch={patchDraft} />
            </aside>
          </>
        )}
      </div>

      {/* Floating tip for editing */}
      {!panelOpen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-brand-dark/90 text-white text-sm px-4 py-2 rounded-full backdrop-blur-md shadow-2xl pointer-events-none animate-fade-up font-bold">
          💡 לחצו על כל טקסט או תמונה כדי לערוך
        </div>
      )}
    </div>
  );
}
