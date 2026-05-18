import { ShieldCheck } from "lucide-react";

export function Commitments() {
  return (
    <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
            <ShieldCheck className="size-5" />
            המחויבות שלנו אליכם
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark mb-6 leading-[1.05] tracking-tight">
            10 הדברות
            <br />
            <span className="text-gradient-gold">של אומץ</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            לפני שאתם רושמים מקום - חשוב שתדעו במה אנחנו מחויבים.
            <br className="hidden md:block" />
            <strong className="text-brand-dark">בלי כוכביות.</strong>
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-card-lift ring-1 ring-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/commitments.png"
            alt="10 הדברות שלנו - המחויבות של אומץ ללקוחות"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
