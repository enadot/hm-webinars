import { Card, CardContent } from "@/components/ui/card";
import { Award, Briefcase, TrendingUp, Building2, Users2 } from "lucide-react";

type Speaker = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  photoBgClass: string;
  highlights: { icon: React.ReactNode; text: string }[];
  accent: "gold" | "purple";
};

const speakers: Speaker[] = [
  {
    name: "אבינעם הרוש",
    role: "מומחה להשקעות נדל\"ן · יועץ אסטרטגי",
    bio: "מעל 12 שנות ניסיון בליווי יזמים ומשקיעים. שילוב ייחודי של ראייה עסקית רחבה ומומחיות מעשית בשטח. כיהן בתפקידי מפתח כמנהל פיתוח עסקי וכמנהל סוכנים במשרדי תיווך מובילים, ובהם ליווה מאות עסקאות נדל\"ן.",
    photo: "/avinoam.jpeg",
    photoBgClass: "bg-gradient-to-br from-brand-primary via-brand-primary-2 to-brand-purple",
    highlights: [
      { icon: <TrendingUp className="size-5" />, text: "12+ שנות ניסיון" },
      { icon: <Briefcase className="size-5" />, text: "מאות עסקאות" },
      { icon: <Award className="size-5" />, text: "יועץ אסטרטגי" },
    ],
    accent: "purple",
  },
  {
    name: "משה אדרי",
    role: "מומחה למשכנתאות מורכבות",
    bio: "לאחר עשור של מצוינות פיתח גישה חדשה שמובילה את מנהלי הבנקים לאשר גם לקוחות שלפני כן לא היו מוכנים להסתכל עליהם. השילוב של איש מספרים, מנתח פיננסי מנוסה ומומחה משכנתאות - הוא המודל שהביא למאות משפחות את האישור המיוחל.",
    photo: "/moshe.png",
    photoBgClass: "bg-gradient-to-br from-brand-gold-light via-brand-gold to-amber-600",
    highlights: [
      { icon: <Building2 className="size-5" />, text: "משכנתאות מורכבות" },
      { icon: <Award className="size-5" />, text: "10+ שנות מצוינות" },
      { icon: <Users2 className="size-5" />, text: "מאות משפחות" },
    ],
    accent: "gold",
  },
];

export function Speakers() {
  return (
    <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
            המרצים
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark mb-6 leading-[1.05] tracking-tight">
            שני מומחים.
            <br />
            <span className="text-gradient-gold">שיטה אחת מוכחת.</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            לראשונה - השילוב בין מומחה ההשקעות למומחה המשכנתאות,
            במפגש אחד שייתן לכם תמונה מלאה.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {speakers.map((s) => (
            <SpeakerCard key={s.name} speaker={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const accentBar =
    speaker.accent === "gold"
      ? "bg-gradient-to-r from-brand-gold-light to-brand-gold"
      : "bg-gradient-to-r from-brand-purple-2 to-brand-purple";
  const chipClass =
    speaker.accent === "gold"
      ? "bg-brand-gold/10 text-brand-dark border-brand-gold/40"
      : "bg-brand-purple/10 text-brand-purple border-brand-purple/30";
  const roleClass =
    speaker.accent === "gold" ? "text-amber-600" : "text-brand-purple";

  return (
    <Card className="group overflow-hidden border-0 shadow-card-lift hover:shadow-glow-brand transition-all duration-500 hover:-translate-y-2 rounded-3xl">
      <div className={`h-2 w-full ${accentBar}`} />
      <CardContent className="p-0">
        <div className={`relative ${speaker.photoBgClass} px-6 pt-10 pb-8 overflow-hidden`}>
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="relative aspect-[4/5] max-h-96 mx-auto rounded-2xl overflow-hidden bg-white shadow-2xl ring-4 ring-white/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={speaker.photo}
              alt={speaker.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
        <div className="p-8 md:p-10">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-dark mb-2 tracking-tight">
            {speaker.name}
          </h3>
          <p className={`text-lg md:text-xl font-bold mb-5 ${roleClass}`}>
            {speaker.role}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground leading-[1.65] mb-7">
            {speaker.bio}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {speaker.highlights.map((h, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-2 text-sm md:text-base font-bold px-4 py-2 rounded-full border-2 ${chipClass}`}
              >
                {h.icon}
                {h.text}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
