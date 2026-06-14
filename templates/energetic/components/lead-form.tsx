"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Rocket } from "lucide-react";
import { useUtm } from "@/lib/use-utm";
import { normalizeIsraeliPhone } from "@/lib/phone-utils";
import { EditableSection } from "@/components/editable/section";
import type { CampaignConfig } from "@/lib/campaign-schema";

const PHONE_RE = /^0\d{8,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "phone" | "email" | "form", string>>;

export function EnergeticLeadForm({
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
    <EditableSection sectionKey={sectionKey} id={sectionId} className="py-12 sm:py-20 md:py-28 bg-yellow-300">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02] mb-4">
              {form.title}{" "}
              {form.titleAccent && (
                <span className="bg-black text-yellow-300 px-3 inline-block -rotate-1">
                  {form.titleAccent}
                </span>
              )}
            </h2>
            {form.description && (
              <p className="text-xl md:text-2xl text-zinc-800 font-bold">{form.description}</p>
            )}
          </div>

          <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={`${idp}name-en`} className="text-base font-extrabold">שם מלא</Label>
                <Input
                  id={`${idp}name-en`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive font-bold">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idp}phone-en`} className="text-base font-extrabold">טלפון</Label>
                <Input
                  id={`${idp}phone-en`}
                  type="tel"
                  dir="ltr"
                  autoComplete="tel-national"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(normalizeIsraeliPhone(e.target.value))}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <p className="text-sm text-destructive font-bold">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idp}email-en`} className="text-base font-extrabold">מייל</Label>
                <Input
                  id={`${idp}email-en`}
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-sm text-destructive font-bold">{errors.email}</p>}
              </div>
              {errors.form && (
                <div className="rounded-xl bg-destructive/10 border-2 border-destructive font-bold p-4 text-destructive">
                  {errors.form}
                </div>
              )}
              <Button
                type="submit"
                size="xl"
                className="w-full bg-black text-yellow-300 hover:bg-zinc-900 hover:scale-[1.02] transition-transform"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="animate-spin" /> : (<><Rocket className="size-6" />{form.buttonText}</>)}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </EditableSection>
  );
}
