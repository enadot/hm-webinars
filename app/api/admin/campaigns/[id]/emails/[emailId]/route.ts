import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

const PatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(500).optional(),
  html: z.string().min(1).optional(),
  senderEmail: z.string().email().nullable().optional(),
  senderName: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; emailId: string }> },
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, emailId } = await params;
  const email = await prisma.emailTemplate.findFirst({
    where: { id: emailId, campaignId: id },
  });
  if (!email) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, email });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; emailId: string }> },
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, emailId } = await params;
  const existing = await prisma.emailTemplate.findFirst({
    where: { id: emailId, campaignId: id },
    select: { id: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (existing.status === "sent") {
    return NextResponse.json(
      { ok: false, error: "Cannot edit a message that was already sent" },
      { status: 400 },
    );
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

  const updated = await prisma.emailTemplate.update({
    where: { id: emailId },
    data: parsed.data,
  });
  return NextResponse.json({ ok: true, email: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; emailId: string }> },
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, emailId } = await params;
  const res = await prisma.emailTemplate.deleteMany({
    where: { id: emailId, campaignId: id },
  });
  if (res.count === 0) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
