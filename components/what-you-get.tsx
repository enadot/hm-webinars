import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, Target, Wrench } from "lucide-react";

const items = [
  {
    icon: TrendingUp,
    title: "ניתוח מגמות שוק 2026",
    body:
      "היכן כדאי להשקיע עכשיו, ומה הטעויות הקריטיות שמשקיעים מתחילים עושים בלי לדעת.",
    gradient: "from-blue-500 to-brand-primary",
  },
  {
    icon: Shield,
    title: 'מודל "כיפת ברזל" לסיכונים',
    body:
      "כלים פרקטיים שפותחו לאורך 12 שנים כדי להבטיח שהצעד שלכם מחושב ומגובה בנתונים.",
    gradient: "from-emerald-500 to-teal-700",
  },
  {
    icon: Target,
    title: "מודל זיהוי הזדמנויות",
    body:
      "איך לסנן רעשי רקע ולמצוא נכסים עם פוטנציאל רווח אמיתי בשוק הנוכחי.",
    gradient: "from-brand-purple-2 to-brand-purple",
  },
  {
    icon: Wrench,
    title: "ארגז כלים יישומי",
    body:
      "כלים מעולם הייעוץ העסקי שיעזרו לכם לבנות אסטרטגיה שמתאימה לאופי וליכולות שלכם.",
    gradient: "from-brand-gold-light to-amber-600",
  },
];

export function WhatYouGet() {
  return (
    <section className="relative py-20 md:py-28 lg:py-32 bg-brand-dark text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-brand-gold/15 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-gold-light bg-brand-gold/15 border border-brand-gold/30 px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
            מה תקבלו בהרצאה
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
            4 כלים שישנו לכם
            <br />
            <span className="text-gradient-gold">את כללי המשחק</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 leading-relaxed">
            לא תיאוריות. רק שיטות מוכחות שעובדות בשטח,
            <br className="hidden md:block" />
            מבוססות על ליווי של מאות עסקאות.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 lg:gap-7 max-w-6xl mx-auto">
          {items.map((item, i) => (
            <Card
              key={item.title}
              className="group relative border-2 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/[0.08] hover:border-brand-gold/40 transition-all duration-500 overflow-hidden hover:-translate-y-1"
            >
              <CardContent className="p-7 md:p-9 flex gap-6 items-start">
                <div className="shrink-0">
                  <div
                    className={`relative flex items-center justify-center size-20 md:size-24 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-2xl`}
                  >
                    <item.icon className="size-10 md:size-12" />
                    <span className="absolute -top-2 -left-2 size-9 rounded-full bg-brand-dark border-2 border-brand-gold text-brand-gold-light text-base font-extrabold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-lg md:text-xl text-white/75 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
