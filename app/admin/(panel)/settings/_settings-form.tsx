"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Check, AlertCircle, Loader2, ExternalLink } from "lucide-react";

type SendmsgStatus = { configured: boolean; siteId: number | null };

export function SettingsForm({ sendmsg }: { sendmsg: SendmsgStatus }) {
  const router = useRouter();
  const [siteId, setSiteId] = useState<string>(sendmsg.siteId?.toString() ?? "");
  const [password, setPassword] = useState<string>("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testState, setTestState] = useState<
    | { kind: "idle" }
    | { kind: "testing" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    const sid = siteId.trim();
    const sidNum = sid === "" ? null : Number(sid);
    if (sidNum !== null && !Number.isFinite(sidNum)) {
      setError("Site ID חייב להיות מספר");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sendmsg: {
          siteId: sidNum,
          password: password, // "" means keep existing
        },
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) {
      setError(json?.error || "שמירה נכשלה");
      setSaving(false);
      return;
    }
    setSavedAt(Date.now());
    setPassword(""); // clear password field after save
    setSaving(false);
    startTransition(() => router.refresh());
  }

  async function test() {
    setTestState({ kind: "testing" });
    const sid = siteId.trim();
    const sidNum = sid === "" ? undefined : Number(sid);
    const body: Record<string, unknown> = {};
    if (sidNum !== undefined && Number.isFinite(sidNum)) body.siteId = sidNum;
    if (password.trim() !== "") body.password = password;
    const res = await fetch("/api/admin/sendmsg/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (json?.ok) setTestState({ kind: "ok" });
    else setTestState({ kind: "error", message: json?.error || `HTTP ${res.status}` });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <span className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0">
          <Mail className="size-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-slate-900">שלח מסר (sendmsg)</div>
          <div className="text-xs text-slate-500">
            סנכרון אוטומטי של לידים לרשימת תפוצה לפי שם הקמפיין.{" "}
            <a
              href="https://sendmsgapi.docs.apiary.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-primary hover:underline"
            >
              API docs
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
        {sendmsg.configured ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            <Check className="size-3.5" />
            מחובר
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
            לא מוגדר
          </span>
        )}
      </div>

      <div className="px-6 py-5 space-y-4">
        <Field label="Site ID" hint="המספר של חשבון שלח מסר (siteID)">
          <input
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            inputMode="numeric"
            dir="ltr"
            placeholder="1687"
            className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </Field>

        <Field
          label="סיסמת API"
          hint={
            sendmsg.configured
              ? "סיסמה כבר נשמרה. השאירו ריק לשמירה ללא שינוי, או הזינו חדשה להחלפה."
              : "סיסמת חשבון שלח מסר (כפי שנקבעה במערכת)"
          }
        >
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            dir="ltr"
            placeholder={sendmsg.configured ? "••••••••" : "סיסמה"}
            className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </Field>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-bold hover:brightness-110 disabled:opacity-50 text-sm"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            שמירה
          </button>
          <button
            type="button"
            onClick={test}
            disabled={testState.kind === "testing"}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 disabled:opacity-50 text-sm"
          >
            {testState.kind === "testing" && <Loader2 className="size-4 animate-spin" />}
            בדיקת חיבור
          </button>
          {savedAt && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <Check className="size-3.5" /> נשמר
            </span>
          )}
          {testState.kind === "ok" && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <Check className="size-3.5" /> חיבור תקין
            </span>
          )}
          {testState.kind === "error" && (
            <span
              className="inline-flex items-center gap-1 text-xs text-destructive font-bold"
              title={testState.message}
            >
              <AlertCircle className="size-3.5" /> חיבור נכשל
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
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
      <label className="text-sm font-bold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500 leading-snug">{hint}</p>}
    </div>
  );
}
