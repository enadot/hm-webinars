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
  "bg-[#162321] border border-white/[0.14] focus:border-[#74DF93] rounded-xl p-4 text-base text-[#EFEFEF] outline-none w-full box-border transition-colors";

/** Registration form for the Step Change template — posts to /api/leads with UTM. */
export function ScLeadForm({ slug }: { slug?: string }) {
  const router = useRouter();
  const ctx = useEdit();
  const utm = useUtm();
  const editing = !!ctx?.enabled;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "נשמח לדעת איך לפנות אליכם";
    if (!phone.trim()) next.phone = "צריך מספר טלפון כדי לשלוח לכם את הקישור";
    else if (!PHONE_RE.test(phone.trim())) next.phone = "המספר לא נראה תקין. אפשר לבדוק שוב?";
    if (!email.trim()) next.email = "צריך אימייל כדי לשלוח את ההקלטה ואת מסמך המושגים";
    else if (!EMAIL_RE.test(email.trim())) next.email = "חסר משהו בכתובת. אפשר לבדוק שוב?";
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

  const err = "text-[13.5px] text-[#F87171]";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sc-name" className="text-[14.5px] font-bold">
          שם מלא
        </label>
        <input
          id="sc-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          disabled={editing}
          className={inputClass}
        />
        {errors.name && <span className={err}>{errors.name}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sc-phone" className="text-[14.5px] font-bold">
          טלפון נייד
        </label>
        <input
          id="sc-phone"
          name="phone"
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel-national"
          value={phone}
          onChange={(e) => setPhone(normalizeIsraeliPhone(e.target.value))}
          aria-invalid={!!errors.phone}
          disabled={editing}
          className={`${inputClass} font-tae text-right`}
        />
        <span className="text-[13px] text-[#9CAFA5]">לשליחת הקישור ותזכורת לפני השידור</span>
        {errors.phone && <span className={err}>{errors.phone}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sc-email" className="text-[14.5px] font-bold">
          אימייל
        </label>
        <input
          id="sc-email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          disabled={editing}
          className={`${inputClass} font-tae text-right`}
        />
        {errors.email && <span className={err}>{errors.email}</span>}
      </div>

      <label className="flex items-start gap-2.5 text-[14.5px] text-[#9CAFA5] leading-[1.5] cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          disabled={editing}
          className="size-5 accent-[#74DF93] shrink-0 m-0"
        />
        <span>אני מאשר/ת קבלת עדכונים על המפגש והקלטתו.</span>
      </label>

      {errors.form && (
        <div className="rounded-xl bg-[#F87171]/10 border border-[#F87171]/40 text-[#F87171] text-sm font-medium p-3.5">
          {errors.form}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || editing}
        className="bg-[#74DF93] hover:bg-[#A1F0B8] active:scale-[0.99] transition-all text-[#162321] border-0 cursor-pointer font-extrabold text-lg px-6 py-[18px] rounded-full w-full min-h-14 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            רגע, שומרים לכם מקום...
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
        className="text-[13px] text-[#9CAFA5] text-center leading-[1.6]"
        placeholder="הערה מתחת לכפתור"
        hideIfEmpty
      />
      <EditableText
        path="stepChange.register.legal"
        as="div"
        multiline
        className="text-[12.5px] text-[#9CAFA5] leading-[1.6]"
        placeholder="גילוי נאות"
        hideIfEmpty
      />
    </form>
  );
}
