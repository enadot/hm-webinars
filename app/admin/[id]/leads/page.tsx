import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft, Users, ExternalLink, Edit3 } from "lucide-react";
import { LeadsTable, type LeadRow } from "./_leads-table";
import { AdminFooter } from "../../_components/admin-footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "לידים | לוח ניהול" };

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      leads: { orderBy: { createdAt: "desc" } },
      _count: { select: { leads: true } },
    },
  });
  if (!campaign) notFound();

  const rows: LeadRow[] = campaign.leads.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    utmSource: l.utmSource,
    utmMedium: l.utmMedium,
    utmCampaign: l.utmCampaign,
    utmContent: l.utmContent,
    utmTerm: l.utmTerm,
    createdAt: l.createdAt.toISOString(),
  }));

  const fileSafeSlug = campaign.slug.replace(/[^a-z0-9-]/gi, "-");

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
          <div className="flex items-center gap-2">
            <Link
              href={`/${campaign.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ExternalLink className="size-4" />
              צפייה בדף
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

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1">לידים</h1>
            <p className="text-slate-600">
              <span className="font-bold">{campaign.name}</span>
              <span className="mx-2">·</span>
              <span className="font-mono text-sm" dir="ltr">
                /{campaign.slug}
              </span>
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-lg font-bold self-start">
            <Users className="size-4" />
            {campaign._count.leads} סה״כ
          </div>
        </div>

        <LeadsTable allRows={rows} filenameBase={`leads-${fileSafeSlug}`} />
      </main>
      <AdminFooter context={`/admin/${campaign.id}/leads`} />
    </div>
  );
}
