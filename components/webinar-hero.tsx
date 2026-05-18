import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Users } from "lucide-react";
import { Countdown } from "@/components/countdown";

export function WebinarHero() {
  return (
    <section className="relative overflow-hidden bg-mesh-hero text-white isolate">
      {/* Animated blobs */}
      <div className="absolute -top-32 -right-32 w-[40rem] h-[40rem] bg-brand-purple/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-40 -left-32 w-[40rem] h-[40rem] bg-brand-gold/20 rounded-full blur-3xl animate-blob-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[50rem] h-[50rem] bg-brand-coral/10 rounded-full blur-3xl" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-radial-fade opacity-80" />

      {/* Top logo bar */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-white/10 shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-5 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-hamechadesh.png"
            alt="המחדש"
            className="h-12 md:h-16 w-auto"
          />
        </div>
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-28 lg:py-32">
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
          {/* Zoom Webinar badge */}
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 mb-8 shadow-xl shadow-black/20 ring-1 ring-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zoom-webinar.png"
              alt="Zoom Webinar"
              className="h-8 md:h-10 w-auto"
            />
            <span className="h-6 w-px bg-slate-300" />
            <span className="text-sm md:text-base font-bold text-brand-dark">
              חינמי · מקומות מוגבלים
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-extrabold leading-[0.95] tracking-tight mb-8">
            <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-[8rem]">
              השקעה בנדל&quot;ן
            </span>
            <span className="block text-gradient-cool text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] mt-2 leading-[0.9]">
              בלי פחד
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/95 max-w-4xl mb-6 leading-tight font-bold">
            איך לזהות הזדמנויות תוך ניהול סיכונים
            <br className="hidden md:block" />
            <span className="text-brand-gold-light"> בשוק של היום</span>
          </p>

          <p className="text-lg sm:text-xl md:text-2xl text-white/75 max-w-3xl mb-14 leading-relaxed font-medium">
            כל מה שזוגות צעירים ומשקיעים חייבים לדעת לפני חתימת חוזה
          </p>

          {/* Info pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 w-full max-w-4xl mb-14">
            <InfoPill icon={<Calendar className="size-7" />} title="יום רביעי" subtitle="10 ביוני 2026" />
            <InfoPill icon={<Clock className="size-7" />} title="20:00" subtitle="שעון ישראל" />
            <InfoPill icon={<Video className="size-7" />} title="אונליין" subtitle="מהבית שלכם" />
            <InfoPill icon={<Users className="size-7" />} title="חינם" subtitle="הרשמה מראש" />
          </div>

          {/* Countdown */}
          <div className="mb-14 w-full">
            <p className="text-white/80 text-base sm:text-lg mb-5 font-bold uppercase tracking-widest">
              הוובינר מתחיל בעוד
            </p>
            <Countdown />
          </div>

          {/* CTA */}
          <a href="#register" className="w-full max-w-xl">
            <Button
              size="2xl"
              variant="gold"
              className="w-full"
            >
              אני רוצה להבטיח מקום ←
            </Button>
          </a>
          <p className="text-white/65 text-base mt-5 font-medium">
            הרישום ללא עלות · מספר משתתפים מוגבל
          </p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
    </section>
  );
}

function InfoPill({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="group flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-5 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
      <div className="text-brand-gold-light group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="font-extrabold text-white text-xl md:text-2xl">{title}</div>
      <div className="text-sm md:text-base text-white/70 font-medium">{subtitle}</div>
    </div>
  );
}
