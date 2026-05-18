import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, Video } from "lucide-react";

export const metadata = {
  title: "תודה על ההרשמה | וובינר השקעה בנדל\"ן בלי פחד",
  description: "ההרשמה לוובינר הושלמה. נחזור אליכם עם פרטי ההתחברות.",
};

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-mesh-hero relative overflow-hidden flex items-center justify-center px-4 py-16">
      <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-brand-gold/25 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-brand-purple/30 rounded-full blur-3xl animate-blob-slow" />

      <div className="relative max-w-3xl w-full bg-white rounded-4xl shadow-2xl p-10 md:p-16 text-center">
        <div className="size-24 md:size-28 rounded-full bg-gradient-to-br from-brand-gold-light to-brand-gold mx-auto flex items-center justify-center mb-8 shadow-glow-gold">
          <CheckCircle2 className="size-14 md:size-16 text-brand-dark" strokeWidth={2.5} />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark mb-5 tracking-tight leading-[1.05]">
          המקום שלכם
          <br />
          <span className="text-gradient-gold">נשמר!</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
          קיבלנו את הפרטים שלכם. נחזור אליכם בקרוב עם פרטי ההתחברות
          ותזכורת קצרה לפני שמתחילים.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <InfoBox icon={<Calendar className="size-7" />} title="יום רביעי" subtitle="10/6/2026" />
          <InfoBox icon={<Clock className="size-7" />} title="20:00" subtitle="שעון ישראל" />
          <InfoBox icon={<Video className="size-7" />} title="אונליין" subtitle="מהבית" />
        </div>

        <div className="rounded-2xl bg-brand-gold/10 border-2 border-brand-gold/30 p-5 md:p-6 mb-10 text-start">
          <p className="text-base md:text-lg text-brand-dark leading-relaxed">
            <strong className="text-brand-primary">טיפ:</strong> שמרו את התאריך
            ביומן שלכם עכשיו, כדי לוודא שלא תפספסו. הוובינר מוגבל למשתתפים
            שנרשמו מראש.
          </p>
        </div>

        <Link href="/">
          <Button variant="outline" size="lg">
            חזרה לדף הבית
          </Button>
        </Link>
      </div>
    </main>
  );
}

function InfoBox({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
      <div className="text-brand-primary">{icon}</div>
      <div className="text-lg font-extrabold text-brand-dark">{title}</div>
      <div className="text-sm text-muted-foreground font-medium">{subtitle}</div>
    </div>
  );
}
