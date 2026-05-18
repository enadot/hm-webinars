"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Lock, Loader2, Sparkles } from "lucide-react";

type Errors = Partial<Record<"name" | "phone" | "email" | "form", string>>;

const PHONE_RE = /^0\d{8,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadForm() {
  const router = useRouter();
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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErrors({
          form:
            data?.error ||
            "אירעה שגיאה בשליחת הטופס. אנא נסו שוב או צרו קשר טלפוני.",
        });
        setSubmitting(false);
        return;
      }
      router.push("/thank-you");
    } catch {
      setErrors({
        form: "אירעה שגיאת רשת. אנא נסו שוב.",
      });
      setSubmitting(false);
    }
  }

  return (
    <section
      id="register"
      className="relative py-20 md:py-28 lg:py-32 bg-mesh-hero text-white overflow-hidden"
    >
      <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-brand-gold/25 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-brand-purple/30 rounded-full blur-3xl animate-blob-slow" />
      <div className="absolute inset-0 bg-grid opacity-25" />

      <div className="container relative mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 max-w-7xl mx-auto items-center">
          <div className="lg:col-span-2 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-gold-light bg-brand-gold/15 border-2 border-brand-gold/40 px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
             
              הרשמה לוובינר
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02] mb-6 tracking-tight">
              הבטיחו לכם מקום
              <br />
              <span className="text-gradient-cool">לפני שייגמרו</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/85 mb-8 leading-relaxed">
              השאירו פרטים, נחזור אליכם עם פרטי ההתחברות
              ותזכורת קצרה לפני שמתחילים.
            </p>
            <ul className="space-y-4 text-white/90">
              {[
                "מקומות מוגבלים - הרישום נסגר עם מילוי הקבוצה",
                "תקבלו לינק ישיר למייל ולטלפון",
                "ללא עלות, ללא התחייבות",
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-3 justify-center lg:justify-start text-lg md:text-xl font-medium"
                >
                  <span className="flex size-9 rounded-full bg-brand-gold/20 border border-brand-gold/40 items-center justify-center shrink-0">
                    <CheckCircle2 className="size-5 text-brand-gold-light" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-brand-gold-light via-brand-coral to-brand-purple-2" />
              <CardContent className="p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-2">
                שמרו לי מקום בוובינר!
                </h3>
                <p className="text-base md:text-lg text-muted-foreground mb-8">
           הזינו את הפרטים שלכם למטה ותקבלו את כל המידע ותזכורות לוובינר:
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-base md:text-lg font-bold text-brand-dark">
                      שם מלא
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      autoComplete="name"
                  
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-sm font-medium text-destructive">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="phone" className="text-base md:text-lg font-bold text-brand-dark">
                      טלפון
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      dir="ltr"
                      autoComplete="tel"
                      inputMode="tel"
                 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-sm font-medium text-destructive">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-base md:text-lg font-bold text-brand-dark">
                      מייל
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                   
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm font-medium text-destructive">
                        {errors.email}
                      </p>
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
                    variant="gold"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        שולח...
                      </>
                    ) : (
                      "הבטיחו לי מקום עכשיו ←"
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
    </section>
  );
}
