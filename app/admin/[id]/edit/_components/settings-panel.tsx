"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  Settings,
  Type,
  Palette,
  Phone,
  Calendar,
  Globe,
  Trash,
  Sparkles,
  BookOpen,
  Zap,
  Check,
  Mail,
  TrendingUp,
} from "lucide-react";
import { listTemplates } from "@/lib/templates";
import type { CampaignDraft } from "./visual-editor";

type Props = {
  draft: CampaignDraft;
  onConfig: (path: string, value: unknown) => void;
  onPatch: <K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) => void;
};

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  "bold-hero": <Sparkles className="size-5" />,
  editorial: <BookOpen className="size-5" />,
  energetic: <Zap className="size-5" />,
  wealth: <TrendingUp className="size-5" />,
};

const TEMPLATE_GRADIENTS: Record<string, string> = {
  "bold-hero": "from-brand-primary via-brand-purple to-brand-coral",
  editorial: "from-stone-700 to-stone-900",
  energetic: "from-fuchsia-500 via-pink-500 to-amber-400",
  wealth: "from-brand-forest via-emerald-700 to-brand-emerald",
};

export function SettingsPanel({ draft, onConfig, onPatch }: Props) {
  const router = useRouter();

  async function deleteCampaign() {
    if (!confirm(`למחוק את "${draft.name}"? פעולה לא הפיכה.`)) return;
    const res = await fetch(`/api/admin/campaigns/${draft.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin");
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed bg-blue-50 border border-blue-200 rounded-lg p-3">
        💡 לעריכת טקסטים ותמונות - לחצו ישירות על הדף משמאל. הפאנל הזה למה שלא מוצג בדף.
      </p>

      <Section title="פרסום" icon={<Globe className="size-4" />} defaultOpen>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold">דף פעיל</div>
            <div className="text-xs text-slate-500">כשכבוי - הדף יחזיר 404 לציבור</div>
          </div>
          <Toggle checked={draft.published} onChange={(v) => onPatch("published", v)} />
        </div>
      </Section>

      <Section title="תבנית עיצוב" icon={<Palette className="size-4" />}>
        <div className="grid grid-cols-2 gap-2">
          {listTemplates().map((t) => {
            const selected = draft.templateId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onPatch("templateId", t.id)}
                className={`relative text-start p-1 rounded-xl border-2 transition ${
                  selected
                    ? "border-brand-primary shadow-md"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`h-14 rounded-lg bg-gradient-to-br ${TEMPLATE_GRADIENTS[t.id]} text-white flex items-center justify-center`}
                >
                  {TEMPLATE_ICONS[t.id]}
                </div>
                <div className="px-1 pt-1.5 pb-1">
                  <div className="text-[11px] font-extrabold leading-tight">{t.name}</div>
                </div>
                {selected && (
                  <span className="absolute top-1 left-1 size-5 rounded-full bg-brand-primary text-white flex items-center justify-center">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="תאריך ושעה" icon={<Calendar className="size-4" />} defaultOpen>
        <CompactField label="תאריך ושעה">
          <DateTimePicker
            value={draft.config.webinar.dateISO}
            onChange={(iso) => onConfig("webinar.dateISO", iso)}
          />
        </CompactField>
        <CompactField label="תאריך לתצוגה" hint='לדוגמה: יום רביעי, 10 ביוני 2026'>
          <CompactInput
            value={draft.config.webinar.dateLabel}
            onChange={(v) => onConfig("webinar.dateLabel", v)}
          />
        </CompactField>
        <div className="grid grid-cols-3 gap-2">
          <CompactField label="יום">
            <CompactInput
              value={draft.config.webinar.dayShort}
              onChange={(v) => onConfig("webinar.dayShort", v)}
            />
          </CompactField>
          <CompactField label="תאריך">
            <CompactInput
              value={draft.config.webinar.dateShort}
              onChange={(v) => onConfig("webinar.dateShort", v)}
            />
          </CompactField>
          <CompactField label="שעה">
            <CompactInput value={draft.config.webinar.time} onChange={(v) => onConfig("webinar.time", v)} />
          </CompactField>
        </div>
        <CompactField label="מיקום (קצר)">
          <CompactInput
            value={draft.config.webinar.venueShort}
            onChange={(v) => onConfig("webinar.venueShort", v)}
          />
        </CompactField>
        <CompactField label="מיקום (מלא)">
          <CompactInput value={draft.config.webinar.venue} onChange={(v) => onConfig("webinar.venue", v)} />
        </CompactField>
      </Section>

      <Section title="צבעים" icon={<Palette className="size-4" />}>
        <ColorField label="ראשי" value={draft.config.theme.primary} onChange={(v) => onConfig("theme.primary", v)} />
        <ColorField
          label="הדגשה (זהב)"
          value={draft.config.theme.accent}
          onChange={(v) => onConfig("theme.accent", v)}
        />
        <ColorField
          label="זהב בהיר"
          value={draft.config.theme.accentLight}
          onChange={(v) => onConfig("theme.accentLight", v)}
        />
        <ColorField label="סגול" value={draft.config.theme.purple} onChange={(v) => onConfig("theme.purple", v)} />
      </Section>

      <Section title="כתובת URL" icon={<Globe className="size-4" />}>
        <CompactField label="שם פנימי">
          <CompactInput value={draft.name} onChange={(v) => onPatch("name", v)} />
        </CompactField>
        <CompactField label="Slug" hint="אותיות אנגלית, מספרים, מקפים">
          <CompactInput
            dir="ltr"
            value={draft.slug}
            onChange={(v) => onPatch("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          />
          <div className="text-[10px] text-slate-500 mt-1 font-mono" dir="ltr">
            /{draft.slug}
          </div>
        </CompactField>
      </Section>

      <Section title="SEO" icon={<Type className="size-4" />}>
        <CompactField label="כותרת לדפדפן">
          <CompactInput value={draft.config.meta.title} onChange={(v) => onConfig("meta.title", v)} />
        </CompactField>
        <CompactField label="תיאור לדפדפן">
          <CompactTextarea
            rows={2}
            value={draft.config.meta.description}
            onChange={(v) => onConfig("meta.description", v)}
          />
        </CompactField>
      </Section>

      <Section title="לידים & Webhook" icon={<Settings className="size-4" />}>
        <CompactField label="Webhook URL" hint="הריק = משתמש ב-LEADS_WEBHOOK_URL הגלובלי">
          <CompactInput
            dir="ltr"
            value={draft.leadsWebhookUrl}
            placeholder="https://hooks.zapier.com/..."
            onChange={(v) => onPatch("leadsWebhookUrl", v)}
          />
        </CompactField>
      </Section>

      <Section title="שלח מסר" icon={<Mail className="size-4" />}>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-bold">סנכרון לידים אוטומטי</Label>
          <Toggle
            checked={draft.config.integrations?.sendmsg?.enabled !== false}
            onChange={(v) => onConfig("integrations.sendmsg.enabled", v)}
          />
        </div>
        <CompactField
          label="שם רשימת תפוצה"
          hint={`ריק = שם הקמפיין ("${draft.name || "ללא שם"}").`}
        >
          <CompactInput
            value={draft.config.integrations?.sendmsg?.listName || ""}
            placeholder={draft.name || "שם הקמפיין"}
            onChange={(v) => onConfig("integrations.sendmsg.listName", v)}
          />
        </CompactField>
        {draft.config.integrations?.sendmsg?.listId ? (
          <p className="text-[11px] text-slate-500 font-mono" dir="ltr">
            list_id: {draft.config.integrations.sendmsg.listId}
          </p>
        ) : (
          <p className="text-[11px] text-slate-500">
            רשימה תיווצר אוטומטית בעת קליטת הליד הראשון.
          </p>
        )}
        <p className="text-[11px] text-slate-500">
          הגדרת אישורי החיבור ב-<a href="/admin/settings" className="text-brand-primary hover:underline">הגדרות</a>.
        </p>
      </Section>

      <Section title="בולטים בטופס" icon={<Phone className="size-4" />}>
        <p className="text-xs text-slate-500 mb-2">
          הבולטים שמופיעים ליד הטופס (לידי קמפיין/CRM).
        </p>
        <CompactField label="בולטים (אחד בשורה)">
          <CompactTextarea
            rows={3}
            value={draft.config.form.bullets.join("\n")}
            onChange={(v) => onConfig("form.bullets", v.split("\n").filter(Boolean))}
          />
        </CompactField>
      </Section>

      <div className="pt-4 mt-4 border-t border-slate-200">
        <button
          onClick={deleteCampaign}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-lg"
        >
          <Trash className="size-4" />
          מחיקת קמפיין
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          {icon && <span className="text-slate-500">{icon}</span>}
          {title}
        </div>
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="p-3 pt-2 space-y-3 border-t border-slate-200">{children}</div>}
    </div>
  );
}

function CompactField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-bold text-slate-700">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-slate-500 leading-tight">{hint}</p>}
    </div>
  );
}

function CompactInput({
  value,
  onChange,
  dir,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
}) {
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      dir={dir}
      placeholder={placeholder}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    />
  );
}

function CompactTextarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-brand-primary" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-white shadow transition ${
          checked ? "-translate-x-1" : "-translate-x-6"
        }`}
      />
    </button>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-9 rounded-md border border-slate-200 cursor-pointer shrink-0"
      />
      <div className="flex-1">
        <div className="text-xs font-bold text-slate-700">{label}</div>
        <input
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs font-mono text-slate-500 bg-transparent focus:outline-none"
        />
      </div>
    </div>
  );
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  function isoToLocal(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function localToISO(local: string): string {
    if (!local) return "";
    return new Date(local).toISOString();
  }
  return (
    <input
      type="datetime-local"
      value={isoToLocal(value)}
      onChange={(e) => onChange(localToISO(e.target.value))}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    />
  );
}
