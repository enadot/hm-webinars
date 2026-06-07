"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { useUtm } from "@/lib/use-utm";
import { normalizeIsraeliPhone } from "@/lib/phone-utils";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

const PHONE_RE = /^0\d{8,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "phone" | "email" | "form", string>>;

export function EditorialLeadForm({
  config,
  slug,
  placement = "bottom",
}: {
  config: CampaignConfig;
  slug?: string;
  placement?: "top" | "bottom";
}) {
  const idp = placement === "top" ? "top-" : "";
  const sectionId = placement === "top" ? "register-top" : "register";
  const sectionKey = placement === "top" ? "form-top" : "form";
  const router = useRouter();
  const utm = useUtm();
  const { form } = config;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "אנא הזינו שם מלא";
    if (!PHONE_RE.test(phone.trim())) next.phone = "מספר טלפון לא תקין";
    if (!EMAIL_RE.test(email.trim())) next.email = "כתובת מייל לא תקינה";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        setErrors({ form: data?.error || "אירעה שגיאה. נסו שוב." });
        setSubmitting(false);
        return;
      }
      router.push(slug ? `/${slug}/thank-you` : "/thank-you");
    } catch {
      setErrors({ form: "אירעה שגיאת רשת." });
      setSubmitting(false);
    }
  }

  return (
    <EditableSection
      sectionKey={sectionKey}
      id={sectionId}
      className="py-20 md:py-28"
      style={{ backgroundColor: config.theme.primary }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-2xl">
          <div className="text-sm font-bold text-stone-500 tracking-[0.2em] uppercase mb-3">
            {form.eyebrow}
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-stone-900 mb-3 leading-[1.05]">
            {form.title}{" "}
            {form.titleAccent && (
              <em className="not-italic" style={{ color: config.theme.primary }}>
                {form.titleAccent}
              </em>
            )}
          </h2>
          {form.description && (
            <p className="text-lg text-stone-600 mb-8">{form.description}</p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor={`${idp}name-e`} className="text-base font-bold">שם מלא</Label>
              <Input
                id={`${idp}name-e`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idp}phone-e`} className="text-base font-bold">טלפון</Label>
              <Input
                id={`${idp}phone-e`}
                type="tel"
                dir="ltr"
                autoComplete="tel-national"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(normalizeIsraeliPhone(e.target.value))}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idp}email-e`} className="text-base font-bold">מייל</Label>
              <Input
                id={`${idp}email-e`}
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            {errors.form && (
              <div className="rounded-xl bg-destructive/10 border-2 border-destructive/30 text-destructive font-medium p-4">
                {errors.form}
              </div>
            )}
            <Button
              type="submit"
              size="xl"
              className="w-full text-white"
              style={{ backgroundColor: config.theme.primary }}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="animate-spin" /> : form.buttonText}
            </Button>
            <p className="text-sm text-stone-500 flex items-center justify-center gap-2">
              <Lock className="size-4" />
              הפרטים שלכם נשמרים בסודיות
            </p>
          </form>
        </div>
      </div>
    </EditableSection>
  );
}
