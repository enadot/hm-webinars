"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Sparkles, BookOpen, Zap, Check, TrendingUp, Newspaper } from "lucide-react";
import { listTemplates } from "@/lib/templates";
import { starterConfigFor } from "@/lib/template-starter";

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  "bold-hero": <Sparkles className="size-6" />,
  editorial: <BookOpen className="size-6" />,
  energetic: <Zap className="size-6" />,
  wealth: <TrendingUp className="size-6" />,
  "editorial-dark": <Newspaper className="size-6" />,
};

const TEMPLATE_GRADIENTS: Record<string, string> = {
  "bold-hero": "from-brand-primary via-brand-purple to-brand-coral",
  editorial: "from-stone-700 to-stone-900",
  energetic: "from-fuchsia-500 via-pink-500 to-amber-400",
  wealth: "from-brand-forest via-emerald-700 to-brand-emerald",
  "editorial-dark": "from-[#0a0b0d] via-[#16181c] to-[#0052ff]",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['"׳״]/g, "")
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    // strip Hebrew for slugs (keep only ascii)
    .replace(/[֐-׿]+/g, "")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function NewCampaignWizard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [templateId, setTemplateId] = useState("bold-hero");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function create() {
    setError(null);
    if (name.trim().length < 2) return setError("שם הקמפיין חייב להיות לפחות 2 תווים");
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "");
    if (!cleanSlug) return setError("Slug חייב להכיל אותיות באנגלית או מספרים");

    setCreating(true);
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: cleanSlug,
        name: name.trim(),
        templateId,
        published: false,
        leadsWebhookUrl: "",
        config: starterConfigFor(templateId),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) {
      setError(json?.error || "יצירה נכשלה");
      setCreating(false);
      return;
    }
    router.push(`/admin/${json.id}/edit`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="size-4" />
        חזרה לקמפיינים
      </Link>

      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">קמפיין חדש</h1>
      <p className="text-slate-600 mb-10">
        3 פרטים ואתם בעורך הוויזואלי. את שאר התוכן ממלאים תוך כדי.
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-7">
        <div className="space-y-2">
          <Label className="text-base font-bold">שם הקמפיין</Label>
          <Input
            placeholder='לדוגמה: "וובינר נדל"ן יוני 2026"'
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-slate-500">לשימוש פנימי בלבד.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-bold">כתובת ה-URL</Label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-mono shrink-0" dir="ltr">your.site/</span>
            <Input
              dir="ltr"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
              }}
              placeholder="real-estate-2026"
              className="font-mono"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-bold">בחרו עיצוב</Label>
          <div className="grid sm:grid-cols-2 gap-3">
            {listTemplates().map((t) => {
              const selected = templateId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={`group relative text-start p-1 rounded-2xl border-2 transition ${
                    selected
                      ? "border-brand-primary shadow-glow-brand"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`h-24 rounded-xl bg-gradient-to-br ${TEMPLATE_GRADIENTS[t.id]} text-white flex items-center justify-center`}
                  >
                    <div className="text-white">{TEMPLATE_ICONS[t.id]}</div>
                  </div>
                  <div className="p-3">
                    <div className="font-extrabold text-sm mb-1">{t.name}</div>
                    <div className="text-xs text-slate-600 leading-snug line-clamp-2">
                      {t.description.split(".")[0]}.
                    </div>
                  </div>
                  {selected && (
                    <span className="absolute top-2 left-2 size-7 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg">
                      <Check className="size-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border-2 border-destructive/30 text-destructive font-medium p-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
            ביטול
          </Link>
          <Button onClick={create} disabled={creating} variant="brand" size="lg">
            {creating ? <Loader2 className="animate-spin" /> : null}
            ליצירה ועריכה ויזואלית ←
          </Button>
        </div>
      </div>
    </div>
  );
}
