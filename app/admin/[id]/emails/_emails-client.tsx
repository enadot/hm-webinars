"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Sparkles,
  Send,
  Calendar,
  Edit3,
  Trash2,
  ArrowRight,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  X,
  Activity,
} from "lucide-react";

export type EmailStatus = "draft" | "scheduled" | "sent" | "failed";

export type EmailRow = {
  id: string;
  name: string;
  subject: string;
  html: string;
  senderEmail: string | null;
  senderName: string | null;
  scheduledAt: string | null;       // "YYYY-MM-DDTHH:mm" (Asia/Jerusalem local)
  sentAt: string | null;
  sendmsgMessageId: number | null;
  status: EmailStatus;
  errorMessage: string | null;
  createdAt: string;
};

type Editing =
  | { mode: "create" }
  | { mode: "edit"; email: EmailRow }
  | null;

type ClientProps = {
  campaignId: string;
  campaignSlug: string;
  campaignName: string;
  initialEmails: EmailRow[];
  sendmsgConfigured: boolean;
};

export function EmailsClient({
  campaignId,
  campaignSlug,
  campaignName,
  initialEmails,
  sendmsgConfigured,
}: ClientProps) {
  const router = useRouter();
  const [emails, setEmails] = useState<EmailRow[]>(initialEmails);
  const [editing, setEditing] = useState<Editing>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [presetBusy, setPresetBusy] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function createPresets() {
    if (!confirm("ליצור סט תזכורות סטנדרטי לוובינר? קיימים יישמרו.")) return;
    setPresetBusy(true);
    const res = await fetch(`/api/admin/campaigns/${campaignId}/emails/presets`, {
      method: "POST",
    });
    const json = await res.json().catch(() => ({}));
    setPresetBusy(false);
    if (!res.ok || !json?.ok) {
      alert(json?.error || "יצירת תזכורות נכשלה");
      return;
    }
    if (json.created?.length) {
      setEmails((prev) => [...json.created, ...prev]);
    }
    refresh();
  }

  async function removeEmail(id: string) {
    if (!confirm("למחוק את התבנית? פעולה לא הפיכה.")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/campaigns/${campaignId}/emails/${id}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok || !json?.ok) {
      alert(json?.error || "מחיקה נכשלה");
      return;
    }
    setEmails((prev) => prev.filter((e) => e.id !== id));
    refresh();
  }

  async function dispatch(id: string) {
    if (!sendmsgConfigured) {
      alert("שלח מסר אינו מוגדר. עברו ל-/admin/settings.");
      return;
    }
    const email = emails.find((e) => e.id === id);
    if (!email) return;
    const scheduled = !!email.scheduledAt;
    const msg = scheduled
      ? `לתזמן את "${email.name}" ל-${formatDateTime(email.scheduledAt!)}?`
      : `לשלוח עכשיו את "${email.name}" לרשימה?`;
    if (!confirm(msg)) return;
    setBusyId(id);
    const res = await fetch(
      `/api/admin/campaigns/${campaignId}/emails/${id}/send`,
      { method: "POST" },
    );
    const json = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok || !json?.ok) {
      alert(json?.error || "שליחה נכשלה");
      setEmails((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "failed", errorMessage: json?.error ?? null } : e,
        ),
      );
      return;
    }
    setEmails((prev) => prev.map((e) => (e.id === id ? json.email : e)));
    refresh();
  }

  async function saveEditor(draft: EmailDraft, andSend: boolean) {
    const editId = editing?.mode === "edit" ? editing.email.id : null;
    const url = editId
      ? `/api/admin/campaigns/${campaignId}/emails/${editId}`
      : `/api/admin/campaigns/${campaignId}/emails`;
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.ok) {
      alert(json?.error || "שמירה נכשלה");
      return;
    }
    const saved: EmailRow = json.email;
    setEmails((prev) => {
      const i = prev.findIndex((e) => e.id === saved.id);
      if (i === -1) return [saved, ...prev];
      const next = [...prev];
      next[i] = saved;
      return next;
    });
    setEditing(null);
    refresh();
    if (andSend) {
      await dispatch(saved.id);
    }
  }

  if (editing) {
    return (
      <EmailEditor
        campaignName={campaignName}
        campaignSlug={campaignSlug}
        initial={editing.mode === "edit" ? editing.email : null}
        onCancel={() => setEditing(null)}
        onSubmit={saveEditor}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setEditing({ mode: "create" })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-bold hover:brightness-110 text-sm"
        >
          <Plus className="size-4" />
          מייל חדש
        </button>
        <button
          type="button"
          onClick={createPresets}
          disabled={presetBusy}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-100 disabled:opacity-50 text-sm"
          title="יוצר אישור הרשמה + תזכורות 24h/1h + מתחילים + פוסט-וובינר"
        >
          {presetBusy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          סט תזכורות לוובינר
        </button>
        <button
          type="button"
          onClick={() => setDebugOpen(true)}
          disabled={!sendmsgConfigured}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-100 disabled:opacity-50 text-sm ms-auto"
          title="בודק את שרשרת הסנכרון מול שלח מסר ומציג תגובות גולמיות"
        >
          <Activity className="size-4" />
          בדיקת סנכרון
        </button>
      </div>

      {debugOpen && (
        <SyncDebugDialog
          campaignId={campaignId}
          campaignName={campaignName}
          onClose={() => setDebugOpen(false)}
        />
      )}

      {emails.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <Mail2 />
          <h3 className="text-lg font-extrabold mb-1">אין מיילים עדיין</h3>
          <p className="text-sm text-slate-600">
            צרו מייל חדש או הפעילו את סט התזכורות לוובינר.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((e) => (
            <EmailRowCard
              key={e.id}
              email={e}
              busy={busyId === e.id}
              sendmsgConfigured={sendmsgConfigured}
              onEdit={() => setEditing({ mode: "edit", email: e })}
              onDelete={() => removeEmail(e.id)}
              onSend={() => dispatch(e.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Mail2() {
  return (
    <div className="size-12 mx-auto mb-3 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
      <Send className="size-6" />
    </div>
  );
}

function EmailRowCard({
  email,
  busy,
  sendmsgConfigured,
  onEdit,
  onDelete,
  onSend,
}: {
  email: EmailRow;
  busy: boolean;
  sendmsgConfigured: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
}) {
  const canEdit = email.status !== "sent";
  const canSend = email.status !== "sent" && sendmsgConfigured;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-extrabold text-slate-900 truncate">{email.name}</h3>
            <StatusBadge status={email.status} />
            {email.scheduledAt && email.status !== "sent" && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                <Calendar className="size-3" />
                {formatDateTime(email.scheduledAt)}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600 truncate">{email.subject}</div>
          {email.errorMessage && email.status === "failed" && (
            <div className="mt-1.5 text-xs text-destructive flex items-start gap-1">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
              <span className="break-all">{email.errorMessage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            disabled={!canEdit}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            title="עריכה"
          >
            <Edit3 className="size-4" />
            <span className="hidden md:inline">עריכה</span>
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend || busy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold bg-brand-primary text-white rounded-lg hover:brightness-110 disabled:opacity-50"
            title={email.scheduledAt ? "תזמן" : "שלח עכשיו"}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : email.scheduledAt ? (
              <Calendar className="size-4" />
            ) : (
              <Send className="size-4" />
            )}
            <span className="hidden md:inline">{email.scheduledAt ? "תזמן" : "שלח"}</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center justify-center size-9 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50"
            title="מחיקה"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: EmailStatus }) {
  const map: Record<EmailStatus, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
    draft: { label: "טיוטה", cls: "bg-slate-100 text-slate-600 border-slate-200", Icon: Edit3 },
    scheduled: { label: "מתוזמן", cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Clock },
    sent: { label: "נשלח", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: Check },
    failed: { label: "נכשל", cls: "bg-red-50 text-red-700 border-red-200", Icon: AlertCircle },
  };
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold border rounded-full px-2 py-0.5 ${cls}`}>
      <Icon className="size-3" />
      {label}
    </span>
  );
}

// ---------------- Editor ----------------

type EmailDraft = {
  name: string;
  subject: string;
  html: string;
  senderEmail: string | null;
  senderName: string | null;
  scheduledAt: string | null;
};

function EmailEditor({
  campaignName,
  campaignSlug,
  initial,
  onCancel,
  onSubmit,
}: {
  campaignName: string;
  campaignSlug: string;
  initial: EmailRow | null;
  onCancel: () => void;
  onSubmit: (draft: EmailDraft, andSend: boolean) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [html, setHtml] = useState(initial?.html ?? defaultSkeleton(campaignName, campaignSlug));
  const [senderEmail, setSenderEmail] = useState(initial?.senderEmail ?? "");
  const [senderName, setSenderName] = useState(initial?.senderName ?? "");
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt ?? "");
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);

  async function save(andSend: boolean) {
    if (!name.trim()) {
      alert("שם תבנית נדרש");
      return;
    }
    if (!subject.trim()) {
      alert("נושא נדרש");
      return;
    }
    if (!html.trim()) {
      alert("תוכן ה-HTML נדרש");
      return;
    }
    setSaving(true);
    await onSubmit(
      {
        name: name.trim(),
        subject: subject.trim(),
        html,
        senderEmail: senderEmail.trim() || null,
        senderName: senderName.trim() || null,
        scheduledAt: scheduledAt || null,
      },
      andSend,
    );
    setSaving(false);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowRight className="size-4" />
          חזרה לרשימה
        </button>
        <div className="text-sm font-bold text-slate-700">
          {initial ? "עריכת מייל" : "מייל חדש"}
        </div>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {showPreview ? "הסתר תצוגה" : "הצג תצוגה"}
        </button>
      </div>

      <div className={`grid gap-0 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        <div className="p-5 space-y-4 border-b lg:border-b-0 lg:border-l border-slate-100">
          <Field label="שם תבנית (לפנים)" hint="לשימוש פנימי בלבד">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="תזכורת 24 שעות"
              className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </Field>

          <Field label="נושא המייל">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="תזכורת: הוובינר מתחיל מחר"
              className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="שם השולח" hint="אופציונלי">
              <input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={campaignName}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </Field>
            <Field label="אימייל השולח" hint="חייב להיות מאומת בשלח מסר">
              <input
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                dir="ltr"
                placeholder="webinar@example.com"
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </Field>
          </div>

          <Field label="תוכן HTML">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={14}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              dir="ltr"
            />
          </Field>

          <Field
            label="תזמון (אופציונלי)"
            hint="הזמן מתפרש כשעון ישראל. השאירו ריק כדי לשלוח מיידית בלחיצה על 'שלח'."
          >
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="flex-1 h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {scheduledAt && (
                <button
                  type="button"
                  onClick={() => setScheduledAt("")}
                  className="inline-flex items-center justify-center size-9 text-slate-500 hover:bg-slate-100 rounded-lg"
                  title="נקה תזמון"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </Field>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              שמירה
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-brand-primary text-white rounded-lg hover:brightness-110 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : scheduledAt ? (
                <Calendar className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {scheduledAt ? "שמירה ותזמון" : "שמירה ושליחה"}
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="p-5 bg-slate-50">
            <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">תצוגה מקדימה</div>
            <iframe
              srcDoc={html}
              title="email preview"
              className="w-full h-[600px] bg-white border border-slate-200 rounded-lg"
              sandbox=""
            />
          </div>
        )}
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

function defaultSkeleton(campaignName: string, campaignSlug: string): string {
  return `<!doctype html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;direction:rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="padding:32px">
          <h1 style="font-size:24px;font-weight:800;margin:0 0 16px;color:#0B1437">היי [שם]</h1>
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px;color:#1f2937">תוכן המייל כאן…</p>
          <a href="https://hm-webinars.vercel.app/${escapeAttr(campaignSlug)}" style="display:inline-block;background:#F5B500;color:#0B1437;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:10px">לעמוד הוובינר</a>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#0B1437;color:#cbd5e1;text-align:center;font-size:13px">
          ${escapeText(campaignName)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeText(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
function escapeAttr(s: string): string {
  return s.replace(/["&]/g, (c) => ({ "\"": "&quot;", "&": "&amp;" }[c]!));
}

function formatDateTime(iso: string): string {
  // "YYYY-MM-DDTHH:mm" → "DD/MM/YYYY HH:mm"
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`;
}

// ---------------- Debug dialog: sync round-trip ----------------

type DebugStep = {
  step: string;
  ok: boolean;
  info?: string;
  error?: string;
  raw?: unknown;
};
type DebugResult = { ok: boolean; steps: DebugStep[]; listId?: number | null };

function SyncDebugDialog({
  campaignId,
  campaignName,
  onClose,
}: {
  campaignId: string;
  campaignName: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/sendmsg-debug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const json = (await res.json()) as DebugResult & { error?: string };
      if (!res.ok && !json?.steps) {
        setFetchError(json?.error || `HTTP ${res.status}`);
      } else {
        setResult(json);
      }
    } catch (e) {
      setFetchError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900">בדיקת סנכרון — {campaignName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="סגור"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            הבדיקה תאמת טוקן, תוודא שיש רשימה לקמפיין (תיצור אם אין), ואם תזינו אימייל
            — תוסיף משתמש בדיקה לרשימה. כל התגובות הגולמיות יוצגו למטה.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">אימייל (אופציונלי)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                placeholder="test@example.com"
                className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">שם</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ישראל ישראלי"
                className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">טלפון</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                placeholder="0501234567"
                className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={run}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-bold hover:brightness-110 disabled:opacity-50 text-sm"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Activity className="size-4" />}
              הרץ בדיקה
            </button>
          </div>

          {fetchError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{fetchError}</span>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <div
                className={`text-xs font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                  result.ok
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {result.ok ? <Check className="size-3" /> : <AlertCircle className="size-3" />}
                {result.ok ? "כל השלבים עברו" : "אחד או יותר נכשל"}
                {result.listId != null && <span className="ms-2 font-mono">listId={result.listId}</span>}
              </div>
              <ol className="space-y-2">
                {result.steps.map((s, i) => (
                  <li
                    key={i}
                    className={`rounded-lg border p-3 text-sm ${
                      s.ok
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-red-200 bg-red-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {s.ok ? (
                        <Check className="size-4 text-emerald-700" />
                      ) : (
                        <AlertCircle className="size-4 text-red-700" />
                      )}
                      <span>{s.step}</span>
                    </div>
                    {s.info && <p className="mt-1 text-slate-700">{s.info}</p>}
                    {s.error && (
                      <p className="mt-1 text-destructive break-all" dir="ltr">
                        {s.error}
                      </p>
                    )}
                    {s.raw !== undefined && s.raw !== null && (
                      <pre
                        dir="ltr"
                        className="mt-2 text-[11px] font-mono bg-white border border-slate-200 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto"
                      >
                        {JSON.stringify(s.raw, null, 2)}
                      </pre>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
