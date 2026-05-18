import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionCookie } from "@/lib/auth";

const TO = process.env.REPORT_TO_EMAIL || "aviv@baram.digital";
const FROM = process.env.REPORT_FROM_EMAIL || "Webinar Admin <onboarding@resend.dev>";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

export async function POST(request: Request) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const { message, context } = (body || {}) as { message?: string; context?: string };
  const text = (message || "").trim();
  if (text.length < 5) {
    return NextResponse.json(
      { ok: false, error: "התיאור קצר מדי" },
      { status: 400 }
    );
  }

  const subject = "דיווח תקלה — מערכת וובינרים";
  const plain = [
    "דיווח תקלה מלוח הניהול:",
    "",
    text,
    "",
    "—",
    `מסך: ${context || "לא צוין"}`,
    `זמן: ${new Date().toLocaleString("he-IL")}`,
    `User-Agent: ${request.headers.get("user-agent") || "—"}`,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: FROM,
        to: TO,
        subject,
        text: plain,
        replyTo: TO,
      });
      if (error) {
        console.error("[report] resend error:", error);
        return NextResponse.json(
          { ok: false, method: "mailto", error: "שליחת המייל נכשלה" },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, method: "email" });
    } catch (err) {
      console.error("[report] resend exception:", err);
      return NextResponse.json(
        { ok: false, method: "mailto", error: "שגיאת שרת בשליחת המייל" },
        { status: 500 }
      );
    }
  }

  // No email provider configured — log it and tell the client to use a mailto fallback
  console.log("[report] (no RESEND_API_KEY) bug report:\n" + plain);
  return NextResponse.json({
    ok: false,
    method: "mailto",
    to: TO,
    subject,
    body: plain,
  });
}
