"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import { useEdit } from "@/lib/edit-context";
import { useUtm } from "@/lib/use-utm";
import { normalizeIsraeliPhone } from "@/lib/phone-utils";
import { Loader2 } from "lucide-react";
import type { CampaignConfig } from "@/lib/campaign-schema";

type Errors = Partial<Record<"name" | "phone" | "email" | "form", string>>;

const PHONE_RE = /^0\d{8,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "bg-[#0a0b0d] border border-white/[0.14] focus:border-[#0052ff] rounded-xl px-4 py-3.5 text-base text-white font-heebo outline-none w-full box-border placeholder:text-[#7c828a] transition-colors";

export function EdRegister({ config, slug }: { config: CampaignConfig; slug?: string }) {
  const router = useRouter();
  const ctx = useEdit();
  const utm = useUtm();
  const editing = !!ctx?.enabled;
  const { webinar } = config;
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
    <EditableSection
      sectionKey="form"
      id="register"
      className="bg-[#0a0b0d] text-white border-t border-white/[0.07] py-24 scroll-mt-5"
    >
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <h2 className="m-0 mb-5 font-medium text-[clamp(30px,4.2vw,54px)] leading-[1.14] tracking-[-1px] [text-wrap:pretty]">
            <EditableText path="form.title" as="span" multiline placeholder="כותרת" />
            <br />
            <EditableText
              path="form.titleAccent"
              as="span"
              className="text-[#3d7bff]"
              placeholder="הדגשה"
              hideIfEmpty
            />
          </h2>
          <EditableText
            path="form.description"
            as="p"
            multiline
            className="m-0 mb-[18px] text-[#a8acb3] text-[17px] leading-[1.7] max-w-[50ch]"
            placeholder="תיאור"
            hideIfEmpty
          />
          {webinar.spotsLimited && (
            <div className="inline-flex items-center gap-2 border border-[#f4b000]/40 text-[#f4b000] rounded-full px-4 py-2 text-[13.5px] font-semibold">
              <EditableText path="editorial.limitedText" as="span" placeholder="מספר המקומות מוגבל" />
            </div>
          )}
        </div>

        {/* Form card */}
        <div className="bg-[#16181c] border border-white/10 rounded-3xl p-8 max-w-[460px] w-full justify-self-center">
          <div className="flex flex-col gap-4">
            <EditableText
              path="form.cardTitle"
              as="div"
              className="font-bold text-[21px]"
              placeholder="כותרת כרטיס"
            />
            <EditableText
              path="webinar.dateLabel"
              as="div"
              className="text-[13.5px] text-[#a8acb3] -mt-2"
              placeholder="מועד"
              hideIfEmpty
            />

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="ed-name" className="text-[13.5px] font-semibold text-[#e6e8eb]">
                  שם מלא
                </label>
                <input
                  id="ed-name"
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
                <label htmlFor="ed-phone" className="text-[13.5px] font-semibold text-[#e6e8eb]">
                  טלפון נייד
                </label>
                <input
                  id="ed-phone"
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
                {errors.phone && (
                  <span className="text-[12.5px] text-[#ff7a86]">{errors.phone}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ed-email" className="text-[13.5px] font-semibold text-[#e6e8eb]">
                  מייל
                </label>
                <input
                  id="ed-email"
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
                {errors.email && (
                  <span className="text-[12.5px] text-[#ff7a86]">{errors.email}</span>
                )}
              </div>

              {errors.form && (
                <div className="rounded-xl bg-[#cf202f]/10 border border-[#cf202f]/40 text-[#ff7a86] text-sm font-medium p-3.5">
                  {errors.form}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || editing}
                className="bg-[#0052ff] hover:bg-[#003ecc] active:scale-[0.99] transition-all text-white border-0 cursor-pointer font-heebo font-bold text-[17px] px-6 py-4 rounded-full w-full flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </div>
    </EditableSection>
  );
}
