import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import {
  getSendmsgConfig,
  getSendmsgPublicStatus,
  setSendmsgConfig,
} from "@/lib/app-settings";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const sendmsg = await getSendmsgPublicStatus();
  return NextResponse.json({ ok: true, sendmsg });
}

// The password may be sent as null/empty to clear it, or "" to keep existing.
// "" means "no change"; explicit null means delete; a string means set.
const PatchSchema = z.object({
  sendmsg: z.object({
    siteId: z.union([z.number().int().positive(), z.null()]).optional(),
    password: z.union([z.string(), z.null()]).optional(),
  }),
});

export async function PATCH(request: Request) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }
  const { sendmsg } = parsed.data;

  // Preserve the existing password when the client sends "" or omits it
  // (so the form doesn't have to round-trip the secret).
  const current = await getSendmsgConfig();
  const nextSiteId = sendmsg.siteId === undefined ? current?.siteId ?? null : sendmsg.siteId;
  const nextPassword =
    sendmsg.password === undefined || sendmsg.password === ""
      ? current?.password ?? null
      : sendmsg.password; // null clears, non-empty sets

  await setSendmsgConfig({ siteId: nextSiteId, password: nextPassword });

  const updated = await getSendmsgPublicStatus();
  return NextResponse.json({ ok: true, sendmsg: updated });
}
