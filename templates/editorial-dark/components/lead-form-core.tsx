"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditableText } from "@/components/editable/text";
import { useEdit } from "@/lib/edit-context";
import { useUtm } from "@/lib/use-utm";
import { normalizeIsraeliPhone } from "@/lib/phone-utils";
import { Loader2 } from "lucide-react";

type Errors = Partial<Record<"name" | "phone" | "email" | "form", string>>;

const PHONE_RE = /^0\d{8,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "bg-[#16181c] border border-white/[0.14] focus:border-[#0052ff] rounded-xl px-4 py-4 text-[17px] text-white font-heebo outline-none w-full box-border placeholder:text-[#7c828a] transition-colors";

/** Shared registration form (fields + submit) used by the register section and the exit popup. */
export function LeadFormCore({ slug, idPrefix = "" }: { slug?: string; idPrefix?: string }) {
  const router = useRouter();
  const ctx = useEdit();
  const utm = useUtm();
  const editing = !!ctx?.enabled;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "נא להזין שם מלא";
    if (!PHONE_RE.test(phone.trim()))
      next.phone = "נא להזין מספר טלפון ישראלי תקין (לדוגמה 0501234567)";
    if (!EMAIL_RE.test(email.trim())) next.email = "נא להזין כתובת מייל תקינה";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) return;
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          campaignSlug: slug,
          ...utm.get(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErrors({ form: data?.error || "אירעה שגיאה בשליחת הטופס. אנא נסו שוב." });
        setSubmitting(false);
        return;
      }
      router.push(slug ? `/${slug}/thank-you` : "/thank-you");
    } catch {
      setErrors({ form: "אירעה שגיאת רשת. אנא נסו שוב." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}ed-name`} className="text-[15px] font-semibold text-[#e6e8eb]">
          שם מלא
        </label>
        <input
          id={`${idPrefix}ed-name`}
          name="name"
          autoComplete="name"
          placeholder="ישראל ישראלי"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          disabled={editing}
          className={inputClass}
        />
        {errors.name && <span className="text-[12.5px] text-[#ff7a86]">{errors.name}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}ed-phone`} className="text-[15px] font-semibold text-[#e6e8eb]">
          טלפון נייד
        </label>
        <input
          id={`${idPrefix}ed-phone`}
          name="phone"
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="050-0000000"
          value={phone}
          onChange={(e) => setPhone(normalizeIsraeliPhone(e.target.value))}
          aria-invalid={!!errors.phone}
          disabled={editing}
          className={`${inputClass} font-tam text-right`}
        />
        {errors.phone && <span className="text-[12.5px] text-[#ff7a86]">{errors.phone}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}ed-email`} className="text-[15px] font-semibold text-[#e6e8eb]">
          מייל
        </label>
        <input
          id={`${idPrefix}ed-email`}
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          disabled={editing}
          className={`${inputClass} text-right`}
        />
        {errors.email && <span className="text-[12.5px] text-[#ff7a86]">{errors.email}</span>}
      </div>

      {errors.form && (
        <div className="rounded-xl bg-[#cf202f]/10 border border-[#cf202f]/40 text-[#ff7a86] text-sm font-medium p-3.5">
          {errors.form}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || editing}
        className="bg-[#0052ff] hover:bg-[#003ecc] active:scale-[0.99] transition-all text-white border-0 cursor-pointer font-heebo font-bold text-[17px] sm:text-lg px-6 py-[18px] rounded-full w-full flex items-center justify-center gap-2.5 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            שולח...
          </>
        ) : (
          <>
            <EditableText path="form.buttonText" as="span" placeholder="טקסט כפתור" />
            <span aria-hidden>&#8592;</span>
          </>
        )}
      </button>
      <EditableText
        path="form.cardDescription"
        as="div"
        className="text-[12.5px] text-[#7c828a] text-center"
        placeholder="הערה מתחת לכפתור"
        hideIfEmpty
      />
    </form>
  );
}
