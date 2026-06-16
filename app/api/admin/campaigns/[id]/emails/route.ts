import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  html: z.string().min(1),
  senderEmail: z.string().email().nullable().optional(),
  senderName: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(), // "YYYY-MM-DDTHH:mm"
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!campaign) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const emails = await prisma.emailTemplate.findMany({
    where: { campaignId: id },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ ok: true, emails });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!campaign) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }

  const created = await prisma.emailTemplate.create({
    data: {
      campaignId: id,
      name: parsed.data.name,
      subject: parsed.data.subject,
      html: parsed.data.html,
      senderEmail: parsed.data.senderEmail ?? null,
      senderName: parsed.data.senderName ?? null,
      scheduledAt: parsed.data.scheduledAt ?? null,
    },
  });
  return NextResponse.json({ ok: true, email: created });
}
