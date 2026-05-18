"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setError(data?.error || "סיסמה שגויה");
      setSubmitting(false);
      return;
    }
    router.push(from);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-mesh-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-purple text-white flex items-center justify-center mb-4 shadow-glow-brand">
            <Lock className="size-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark mb-2">לוח ניהול</h1>
          <p className="text-muted-foreground">הזינו סיסמה כדי להמשיך</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-bold">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <div className="rounded-xl bg-destructive/10 border-2 border-destructive/30 text-destructive font-medium p-3 text-sm">
              {error}
            </div>
          )}
          <Button type="submit" size="lg" variant="brand" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : "כניסה"}
          </Button>
        </form>
      </div>
    </main>
  );
}
