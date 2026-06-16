import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSendmsgConfig } from "@/lib/app-settings";
import { addUserToList } from "@/lib/sendmsg";
import { ensureCampaignList, logSendmsg } from "@/lib/sendmsg-campaign";

const PHONE_RE = /^0\d{8,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    name,
    phone,
    email,
    campaignSlug,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
  } = (body || {}) as {
    name?: string;
    phone?: string;
    email?: string;
    campaignSlug?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  };

  const cleanName = (name || "").trim();
  const cleanPhone = (phone || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();

  const utm = (v?: string) => {
    const s = (v || "").trim().slice(0, 255);
    return s.length ? s : null;
  };
  const utmData = {
    utmSource: utm(utmSource),
    utmMedium: utm(utmMedium),
    utmCampaign: utm(utmCampaign),
    utmContent: utm(utmContent),
    utmTerm: utm(utmTerm),
  };

  if (cleanName.length < 2) {
    return NextResponse.json({ ok: false, error: "שם מלא חסר או קצר מדי" }, { status: 400 });
  }
  if (!PHONE_RE.test(cleanPhone)) {
    return NextResponse.json({ ok: false, error: "מספר טלפון לא תקין" }, { status: 400 });
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ ok: false, error: "כתובת מייל לא תקינה" }, { status: 400 });
  }

  let campaign = null as {
    id: string;
    slug: string;
    name: string;
    leadsWebhookUrl: string | null;
    config: string;
  } | null;
  if (campaignSlug) {
    campaign = await prisma.campaign.findUnique({
      where: { slug: campaignSlug },
      select: { id: true, slug: true, name: true, leadsWebhookUrl: true, config: true },
    });
  }

  // Persist lead (only if we have a campaign)
  if (campaign) {
    await prisma.lead.create({
      data: {
        campaignId: campaign.id,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        ...utmData,
        userAgent: request.headers.get("user-agent") || null,
      },
    });
  }

  // Forward to webhook (campaign's URL takes precedence over global default)
  const payload = {
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    campaignSlug: campaign?.slug ?? campaignSlug ?? null,
    ...utmData,
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || null,
  };

  const webhookUrl = campaign?.leadsWebhookUrl || process.env.LEADS_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error(`[leads] webhook ${res.status}: ${await res.text()}`);
      }
    } catch (err) {
      console.error("[leads] webhook error:", err);
    }
  } else {
    console.log("[leads] (no webhook configured) new lead:", payload);
  }

  // Auto-sync to שלח מסר mailing list (per-campaign, never fails the request).
  if (campaign) {
    syncLeadToSendmsg(campaign, {
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
    }).catch((err) => console.error("[leads] sendmsg sync error:", err));
  }

  return NextResponse.json({ ok: true });
}

async function syncLeadToSendmsg(
  campaign: { id: string; slug: string; name: string; config: string },
  lead: { name: string; phone: string; email: string },
): Promise<void> {
  const creds = await getSendmsgConfig();
  if (!creds) return;

  const listId = await ensureCampaignList(creds, campaign);
  if (!listId) return;

  // Split "first last" — sendmsg has separate fields.
  const space = lead.name.indexOf(" ");
  const firstName = space === -1 ? lead.name : lead.name.slice(0, space);
  const lastName = space === -1 ? "" : lead.name.slice(space + 1);

  try {
    await addUserToList(creds, listId, {
      email: lead.email,
      firstName,
      lastName,
      phone: lead.phone,
    });
  } catch (e) {
    logSendmsg("addUserToList", e);
  }
}
