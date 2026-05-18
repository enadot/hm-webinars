import Link from "next/link";
import { prisma } from "@/lib/db";
import { getTemplate } from "@/lib/templates";
import { ArrowLeft, Settings } from "lucide-react";

export default async function Home() {
  const campaigns = await prisma.campaign.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  // If there's exactly one published campaign, redirect to it (most common case)
  if (campaigns.length === 1) {
    const { redirect } = await import("next/navigation");
    redirect(`/${campaigns[0].slug}`);
  }

  return (
    <main className="min-h-screen bg-mesh-hero text-white p-8 md:p-16">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-3">
              <span className="text-gradient-gold">קמפיינים פעילים</span>
            </h1>
            <p className="text-white/70 text-lg">בחרו וובינר להירשם</p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl hover:bg-white/15 font-bold transition"
          >
            <Settings className="size-5" />
            ניהול
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-12 text-center">
            <p className="text-2xl font-bold mb-4">אין קמפיינים פעילים עדיין</p>
            <p className="text-white/70 mb-8">צור קמפיין חדש דרך לוח הניהול</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-dark font-bold rounded-xl hover:brightness-110 transition"
            >
              לוח ניהול ←
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((c) => {
              const t = getTemplate(c.templateId);
              return (
                <Link
                  key={c.id}
                  href={`/${c.slug}`}
                  className="group bg-white/10 backdrop-blur-md border-2 border-white/20 hover:border-brand-gold/50 rounded-3xl p-7 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-2xl font-extrabold leading-tight">{c.name}</h2>
                    <ArrowLeft className="size-6 text-white/50 group-hover:text-brand-gold transition" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span className="px-2 py-1 rounded bg-white/10">{t?.name ?? c.templateId}</span>
                    <span>·</span>
                    <span dir="ltr" className="font-mono">/{c.slug}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
