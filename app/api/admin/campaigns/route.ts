import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CampaignConfigSchema } from "@/lib/campaign-schema";
import { getTemplate } from "@/lib/templates";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const CreateSchema = z.object({
  slug: z.string().regex(SLUG_RE, "Slug חייב להיות אותיות/מספרים/מקפים בלבד"),
  name: z.string().min(1),
  templateId: z.string().min(1),
  published: z.boolean().default(true),
  leadsWebhookUrl: z.string().default(""),
  config: CampaignConfigSchema,
});

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

export async function POST(request: Request) {
  if (!(await isAuth())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      },
      { status: 400 }
    );
  }
  const { slug, name, templateId, published, leadsWebhookUrl, config } = parsed.data;

  if (!getTemplate(templateId)) {
    return NextResponse.json({ ok: false, error: `תבנית לא ידועה: ${templateId}` }, { status: 400 });
  }

  const existing = await prisma.campaign.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Slug כבר בשימוש" }, { status: 409 });
  }

  const created = await prisma.campaign.create({
    data: {
      slug,
      name,
      templateId,
      published,
      leadsWebhookUrl: leadsWebhookUrl || null,
      config: JSON.stringify(config),
    },
  });

  return NextResponse.json({ ok: true, id: created.id, slug: created.slug });
}
