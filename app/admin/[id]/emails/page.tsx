import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft, Mail, ExternalLink, Edit3 } from "lucide-react";
import { EmailsClient, type EmailRow } from "./_emails-client";
import { AdminFooter } from "../../_components/admin-footer";
import { getSendmsgPublicStatus } from "@/lib/app-settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "מיילים | לוח ניהול" };

function nowJerusalemLocal(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export default async function EmailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Reconcile any scheduled emails whose dispatch time has passed: sendmsg
  // ran the dispatch on schedule (or failed silently — we have no API to
  // verify), so we presume sent. scheduledAt is a literal Asia/Jerusalem
  // "YYYY-MM-DDTHH:mm" string, lexical compare works.
  await prisma.emailTemplate.updateMany({
    where: {
      campaignId: id,
      status: "scheduled",
      scheduledAt: { lte: nowJerusalemLocal() },
    },
    data: { status: "sent", sentAt: new Date() },
  });

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      emails: { orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }] },
    },
  });
  if (!campaign) notFound();

  const sendmsg = await getSendmsgPublicStatus();
  const rows: EmailRow[] = campaign.emails.map((e) => ({
    id: e.id,
    name: e.name,
    subject: e.subject,
    html: e.html,
    senderEmail: e.senderEmail,
    senderName: e.senderName,
    scheduledAt: e.scheduledAt,
    sentAt: e.sentAt?.toISOString() ?? null,
    sendmsgMessageId: e.sendmsgMessageId,
    status: e.status as EmailRow["status"],
    errorMessage: e.errorMessage,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            חזרה לקמפיינים
          </Link>
          <div className="flex-1 min-w-0 hidden sm:block">
            <div className="font-extrabold text-slate-900 truncate">{campaign.name}</div>
            <div className="text-xs text-slate-500 font-mono" dir="ltr">/{campaign.slug}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${campaign.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-100"
            >
              <ExternalLink className="size-4" />
              צפייה
            </Link>
            <Link
              href={`/admin/${campaign.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              <Edit3 className="size-4" />
              עריכה
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0">
            <Mail className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">מיילים לקמפיין</h1>
            <p className="text-sm text-slate-600">
              שליחה ותזמון דרך שלח מסר. {sendmsg.configured ? null : (
                <span className="text-amber-700 font-bold">
                  לא מוגדרים אישורים. <Link href="/admin/settings" className="underline">להגדרות</Link>.
                </span>
              )}
            </p>
          </div>
        </div>

        <EmailsClient
          campaignId={campaign.id}
          campaignSlug={campaign.slug}
          campaignName={campaign.name}
          initialEmails={rows}
          sendmsgConfigured={sendmsg.configured}
        />
      </main>

      <AdminFooter />
    </div>
  );
}
