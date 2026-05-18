import { NextResponse } from "next/server";
import { SESSION_COOKIE, checkPassword, createSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const { password } = (body || {}) as { password?: string };
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "סיסמה שגויה" }, { status: 401 });
  }
  const { value, maxAge } = await createSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
