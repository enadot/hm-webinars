import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CampaignConfigSchema } from "@/lib/campaign-schema";
import { getTemplate } from "@/lib/templates";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const UpdateSchema = z.object({
  slug: z.string().regex(SLUG_RE),
  name: z.string().min(1),
  templateId: z.string().min(1),
  published: z.boolean(),
  leadsWebhookUrl: z.string().default(""),
  config: CampaignConfigSchema,
});

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (!getTemplate(data.templateId)) {
    return NextResponse.json({ ok: false, error: `תבנית לא ידועה: ${data.templateId}` }, { status: 400 });
  }

  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // Check slug conflict (different campaign with same slug)
  if (data.slug !== existing.slug) {
    const slugTaken = await prisma.campaign.findUnique({ where: { slug: data.slug } });
    if (slugTaken) {
      return NextResponse.json({ ok: false, error: "Slug כבר בשימוש" }, { status: 409 });
    }
  }

  await prisma.campaign.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      templateId: data.templateId,
      published: data.published,
      leadsWebhookUrl: data.leadsWebhookUrl || null,
      config: JSON.stringify(data.config),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
