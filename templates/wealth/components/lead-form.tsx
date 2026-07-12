"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Lock, Loader2, TrendingUp } from "lucide-react";
import { EditableText } from "@/components/editable/text";
import { EditableSection } from "@/components/editable/section";
import { useEdit } from "@/lib/edit-context";
import { useUtm } from "@/lib/use-utm";
import { normalizeIsraeliPhone } from "@/lib/phone-utils";
import type { CampaignConfig } from "@/lib/campaign-schema";

type Errors = Partial<Record<"name" | "phone" | "email" | "form", string>>;

const PHONE_RE = /^0\d{8,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WealthLeadForm({
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
  const ctx = useEdit();
  const utm = useUtm();
  const editing = !!ctx?.enabled;
  const { form } = config;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "אנא הזינו שם מלא";
    if (!PHONE_RE.test(phone.trim()))
      next.phone = "אנא הזינו מספר טלפון ישראלי תקין (לדוגמה 0501234567)";
    if (!EMAIL_RE.test(email.trim())) next.email = "אנא הזינו כתובת מייל תקינה";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) return; // No-op in edit mode
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
        setErrors({
          form: data?.error || "אירעה שגיאה בשליחת הטופס. אנא נסו שוב.",
        });
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
      sectionKey={sectionKey}
      id={sectionId}
      className="relative py-12 sm:py-20 md:py-28 lg:py-32 bg-mesh-wealth text-white overflow-hidden"
    >
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-brand-emerald/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-brand-mint/10 rounded-full blur-3xl animate-blob-slow" />
      <div className="absolute inset-0 bg-grid opacity-25" />

      <div className="container relative mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 max-w-7xl mx-auto items-center">
          <div className="lg:col-span-2 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-mint bg-brand-emerald/15 border-2 border-brand-emerald/40 px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
              <TrendingUp className="size-5" />
              <EditableText path="form.eyebrow" as="span" placeholder="באדג'" />
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02] mb-6 tracking-tight">
              <EditableText path="form.title" as="span" placeholder="כותרת" />
              <br />
              <EditableText
                path="form.titleAccent"
                as="span"
                className="text-gradient-emerald"
                placeholder="כותרת מודגשת"
                hideIfEmpty
              />
            </h2>
            <EditableText
              path="form.description"
              as="p"
              multiline
              className="text-xl md:text-2xl text-white/85 mb-8 leading-relaxed"
              placeholder="תיאור"
              hideIfEmpty
            />
            {form.bullets.length > 0 && (
              <ul className="space-y-4 text-white/90">
                {form.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-3 justify-center lg:justify-start text-lg md:text-xl font-medium"
                  >
                    <span className="flex size-9 rounded-full bg-brand-emerald/20 border border-brand-emerald/40 items-center justify-center shrink-0">
                      <CheckCircle2 className="size-5 text-brand-emerald-light" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-3">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-brand-mint via-brand-emerald-light to-brand-emerald" />
              <CardContent className="p-6 sm:p-8 md:p-12">
                <EditableText
                  path="form.cardTitle"
                  as="h3"
                  className="text-2xl md:text-3xl font-extrabold text-brand-forest mb-2"
                  placeholder="כותרת כרטיס"
                />
                <EditableText
                  path="form.cardDescription"
                  as="p"
                  multiline
                  className="text-base md:text-lg text-muted-foreground mb-8"
                  placeholder="תיאור כרטיס"
                  hideIfEmpty
                />

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="space-y-2.5">
                    <Label htmlFor={`${idp}name`} className="text-base md:text-lg font-bold text-brand-forest">
                      שם מלא
                    </Label>
                    <Input
                      id={`${idp}name`}
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={!!errors.name}
                      disabled={editing}
                    />
                    {errors.name && (
                      <p className="text-sm font-medium text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor={`${idp}phone`} className="text-base md:text-lg font-bold text-brand-forest">
                      טלפון
                    </Label>
                    <Input
                      id={`${idp}phone`}
                      name="phone"
                      type="tel"
                      dir="ltr"
                      autoComplete="tel-national"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(normalizeIsraeliPhone(e.target.value))}
                      aria-invalid={!!errors.phone}
                      disabled={editing}
                    />
                    {errors.phone && (
                      <p className="text-sm font-medium text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor={`${idp}email`} className="text-base md:text-lg font-bold text-brand-forest">
                      מייל
                    </Label>
                    <Input
                      id={`${idp}email`}
                      name="email"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!errors.email}
                      disabled={editing}
                    />
                    {errors.email && (
                      <p className="text-sm font-medium text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {errors.form && (
                    <div className="rounded-xl bg-destructive/10 border-2 border-destructive/30 text-destructive font-medium p-4">
                      {errors.form}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="xl"
                    variant="emerald"
                    className="w-full"
                    disabled={submitting || editing}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        שולח...
                      </>
                    ) : (
                      <EditableText
                        path="form.buttonText"
                        as="span"
                        className="inline"
                        placeholder="טקסט כפתור"
                      />
                    )}
                  </Button>

                  <p className="text-sm md:text-base text-muted-foreground flex items-center justify-center gap-2">
                    <Lock className="size-4" />
                    הפרטים שלכם נשמרים בסודיות ולא יועברו לגורם שלישי.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EditableSection>
  );
}
