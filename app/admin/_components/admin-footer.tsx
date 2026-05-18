"use client";

import { useState } from "react";
import { Bug, Loader2, CheckCircle2, X, Mail } from "lucide-react";

const CREDIT =
  "נבנה על ידי אביב אברהם מצוות ברעם דיגיטל · aviv@baram.digital · כל הזכויות שמורות";

type SendState = "idle" | "sending" | "sent" | "error";

export function AdminFooter({ context }: { context?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SendState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function openMailtoFallback(to: string, subject: string, plainBody: string) {
    const href = `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(plainBody)}`;
    window.location.href = href;
  }

  async function submit() {
    if (message.trim().length < 5) {
      setErrorMsg("אנא תארו את התקלה (לפחות כמה מילים)");
      return;
    }
    setState("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          context: context || (typeof window !== "undefined" ? window.location.pathname : ""),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.ok) {
        setState("sent");
        setMessage("");
        setTimeout(() => {
          setOpen(false);
          setState("idle");
        }, 2200);
        return;
      }

      // Server has no email provider → fall back to the user's mail client
      if (data?.method === "mailto") {
        openMailtoFallback(
          data.to || "aviv@baram.digital",
          data.subject || "דיווח תקלה — מערכת וובינרים",
          data.body || message.trim()
        );
        setState("sent");
        setMessage("");
        setTimeout(() => {
          setOpen(false);
          setState("idle");
        }, 2200);
        return;
      }

      setErrorMsg(data?.error || "השליחה נכשלה");
      setState("error");
    } catch {
      // Network failure → mailto fallback
      openMailtoFallback(
        "aviv@baram.digital",
        "דיווח תקלה — מערכת וובינרים",
        message.trim()
      );
      setState("sent");
      setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 2200);
    }
  }

  return (
    <>
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span className="text-center sm:text-start">{CREDIT}</span>
          <button
            onClick={() => {
              setOpen(true);
              setState("idle");
              setErrorMsg(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-slate-700 hover:text-white hover:bg-slate-900 border border-slate-200 transition-colors"
          >
            <Bug className="size-4" />
            זיהיתם תקלה? שלחו פנייה
          </button>
        </div>
      </footer>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-label="סגירה"
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 left-4 size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="size-11 rounded-xl bg-gradient-to-br from-brand-primary to-brand-purple text-white flex items-center justify-center">
                <Bug className="size-6" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">דיווח תקלה</h2>
                <p className="text-sm text-slate-500">הפנייה תישלח לאביב</p>
              </div>
            </div>

            {state === "sent" ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="size-14 text-emerald-600 mx-auto mb-3" />
                <p className="text-lg font-extrabold text-slate-900">תודה! הפנייה נשלחה</p>
                <p className="text-sm text-slate-500 mt-1">נטפל בזה בהקדם</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-bold text-slate-700">
                  מה לא עובד? תארו בקצרה
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder="לדוגמה: בעמוד העריכה, לא נשמרת התמונה של המרצה השני..."
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {errorMsg && (
                  <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                )}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <a
                    href={`mailto:aviv@baram.digital?subject=${encodeURIComponent(
                      "דיווח תקלה — מערכת וובינרים"
                    )}`}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
                  >
                    <Mail className="size-3.5" />
                    או שלחו מייל ישירות
                  </a>
                  <button
                    onClick={submit}
                    disabled={state === "sending"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:brightness-110 disabled:opacity-50"
                  >
                    {state === "sending" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Bug className="size-4" />
                    )}
                    שליחת הפנייה
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
