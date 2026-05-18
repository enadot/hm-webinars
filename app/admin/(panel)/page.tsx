import Link from "next/link";
import { prisma } from "@/lib/db";
import { getTemplate } from "@/lib/templates";
import { ExternalLink, Edit3, Users, Plus, Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">קמפיינים</h1>
          <p className="text-slate-600">
            {campaigns.length === 0
              ? "עדיין אין קמפיינים. צרו את הראשון!"
              : `${campaigns.length} קמפיינים`}
          </p>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center">
          <div className="size-20 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-purple text-white flex items-center justify-center mx-auto mb-5">
            <Plus className="size-10" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2">צרו קמפיין חדש</h2>
          <p className="text-slate-600 mb-6">בחרו תבנית, מלאו פרטים, ופרסמו תוך דקות.</p>
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:brightness-110"
          >
            <Plus className="size-5" />
            התחילו עכשיו
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const t = getTemplate(c.templateId);
            return (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-extrabold text-slate-900 truncate">{c.name}</h3>
                      {c.published ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          <Eye className="size-3" />
                          פעיל
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                          <EyeOff className="size-3" />
                          טיוטה
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                      <span className="font-mono" dir="ltr">/{c.slug}</span>
                      <span>·</span>
                      <span>{t?.name ?? c.templateId}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {c._count.leads} לידים
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${c.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <ExternalLink className="size-4" />
                      צפייה
                    </Link>
                    <Link
                      href={`/admin/${c.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit3 className="size-4" />
                      עריכה
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
