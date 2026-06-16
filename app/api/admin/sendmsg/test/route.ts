import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { getSendmsgConfig } from "@/lib/app-settings";
import { testConnection } from "@/lib/sendmsg";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

const BodySchema = z
  .object({
    siteId: z.number().int().positive().optional(),
    password: z.string().min(1).optional(),
  })
  .optional();

export async function POST(request: Request) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown = undefined;
  try {
    const txt = await request.text();
    body = txt ? JSON.parse(txt) : undefined;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }

  // Prefer the inline creds from the form (so the user can test before
  // saving), fall back to stored creds.
  let creds = parsed.data?.siteId && parsed.data?.password
    ? { siteId: parsed.data.siteId, password: parsed.data.password }
    : null;
  if (!creds) creds = await getSendmsgConfig();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "No credentials provided or saved" },
      { status: 400 },
    );
  }

  const result = await testConnection(creds);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
