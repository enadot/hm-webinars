import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";
import { safeParseConfig } from "@/lib/campaign-schema";
import { getSendmsgConfig } from "@/lib/app-settings";
import {
  addUserToList,
  createMailingList,
  getToken,
  SendmsgError,
} from "@/lib/sendmsg";

async function isAuth() {
  const c = await cookies();
  return await verifySessionCookie(c.get(SESSION_COOKIE)?.value);
}

type Step = {
  step: string;
  ok: boolean;
  info?: string;
  error?: string;
  raw?: unknown;
};

/**
 * POST /api/admin/campaigns/[id]/sendmsg-debug
 *
 * Exercises the full sendmsg sync pipeline and returns step-by-step results
 * with raw response bodies, so failures surface in the admin UI instead of
 * disappearing into Vercel logs.
 *
 * Body (all optional): { email, name, phone }
 *   - If `email` is provided, also attempts to add that user to the list.
 *   - Otherwise just exercises token + list-creation.
 */
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
    select: { id: true, slug: true, name: true, config: true },
  });
  if (!campaign) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const creds = await getSendmsgConfig();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "שלח מסר אינו מוגדר. עברו ל-/admin/settings." },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    phone?: string;
  };

  const steps: Step[] = [];

  // Step 1: token
  try {
    await getToken(creds);
    steps.push({ step: "אימות (טוקן)", ok: true, info: "התקבל טוקן" });
  } catch (e) {
    steps.push({ step: "אימות (טוקן)", ok: false, error: errMsg(e), raw: errBody(e) });
    return NextResponse.json({ ok: false, steps });
  }

  // Step 2: ensure list
  const parsed = safeParseConfig(JSON.parse(campaign.config));
  if (!parsed.ok) {
    steps.push({ step: "קונפיג קמפיין", ok: false, error: parsed.error });
    return NextResponse.json({ ok: false, steps });
  }

  let listId: number | null = parsed.data.integrations?.sendmsg?.listId ?? null;
  if (listId) {
    steps.push({
      step: "רשימת תפוצה",
      ok: true,
      info: `השתמשנו ברשימה קיימת ID=${listId} (מטמון בקונפיג הקמפיין).`,
    });
  } else {
    const listName =
      (parsed.data.integrations?.sendmsg?.listName || "").trim() ||
      campaign.name ||
      campaign.slug;
    try {
      const created = await createMailingList(
        creds,
        listName,
        `Auto-created from /${campaign.slug}`,
      );
      listId = created.listId;
      steps.push({
        step: "רשימת תפוצה",
        ok: true,
        info: `נוצרה רשימה חדשה ID=${created.listId} בשם "${listName}".`,
        raw: created.raw,
      });
      // Cache the listId on the campaign config (same as the lead-sync path).
      const nextConfig = {
        ...parsed.data,
        integrations: {
          ...(parsed.data.integrations ?? { sendmsg: { enabled: true, listName: "" } }),
          sendmsg: {
            ...(parsed.data.integrations?.sendmsg ?? { enabled: true, listName: "" }),
            listId: created.listId,
          },
        },
      };
      await prisma.campaign.update({
        where: { id },
        data: { config: JSON.stringify(nextConfig) },
      });
    } catch (e) {
      steps.push({
        step: "רשימת תפוצה",
        ok: false,
        error: errMsg(e),
        raw: errBody(e),
      });
      return NextResponse.json({ ok: false, steps, listId });
    }
  }

  // Step 3: add user (only if email supplied)
  if (body.email && listId) {
    const fullName = (body.name || "").trim();
    const space = fullName.indexOf(" ");
    const firstName = space === -1 ? fullName : fullName.slice(0, space);
    const lastName = space === -1 ? "" : fullName.slice(space + 1);
    try {
      const raw = await addUserToList(creds, listId, {
        email: body.email.trim(),
        firstName,
        lastName,
        phone: body.phone?.trim() || undefined,
      });
      steps.push({
        step: "הוספת משתמש",
        ok: true,
        info: `${body.email} נוסף לרשימה ID=${listId}.`,
        raw,
      });
    } catch (e) {
      steps.push({
        step: "הוספת משתמש",
        ok: false,
        error: errMsg(e),
        raw: errBody(e),
      });
    }
  } else {
    steps.push({
      step: "הוספת משתמש",
      ok: true,
      info: "לא הוזן אימייל — דילגנו.",
    });
  }

  const allOk = steps.every((s) => s.ok);
  return NextResponse.json({ ok: allOk, steps, listId });
}

function errMsg(e: unknown): string {
  if (e instanceof SendmsgError) return e.message;
  return e instanceof Error ? e.message : String(e);
}
function errBody(e: unknown): unknown {
  if (e instanceof SendmsgError) return e.body;
  return null;
}
