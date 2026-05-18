import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft, Users, ExternalLink, Edit3, Phone, Mail } from "lucide-react";
import { ExportCsvButton, type LeadRow } from "./_export-button";

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
    name: l.name,
    phone: l.phone,
    email: l.email,
    createdAt: l.createdAt.toISOString(),
  }));

  const fileSafeSlug = campaign.slug.replace(/[^a-z0-9-]/gi, "-");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
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

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
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
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-lg font-bold">
              <Users className="size-4" />
              {campaign._count.leads} לידים
            </div>
            <ExportCsvButton
              rows={rows}
              filename={`leads-${fileSafeSlug}-${today}.csv`}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center">
            <div className="size-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Users className="size-8" />
            </div>
            <h2 className="text-xl font-extrabold mb-2">אין עדיין לידים</h2>
            <p className="text-slate-600">
              לידים שיירשמו דרך הטופס יופיעו כאן.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="text-start font-bold px-4 py-3 w-12">#</th>
                    <th className="text-start font-bold px-4 py-3">שם</th>
                    <th className="text-start font-bold px-4 py-3">טלפון</th>
                    <th className="text-start font-bold px-4 py-3">מייל</th>
                    <th className="text-start font-bold px-4 py-3">תאריך הרשמה</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.leads.map((l, i) => (
                    <tr
                      key={l.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-slate-400 tabular-nums">
                        {rows.length - i}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {l.name}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${l.phone}`}
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-primary font-mono"
                        >
                          <Phone className="size-3.5 text-slate-400" />
                          {l.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${l.email}`}
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-primary"
                        >
                          <Mail className="size-3.5 text-slate-400" />
                          {l.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {l.createdAt.toLocaleString("he-IL", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
