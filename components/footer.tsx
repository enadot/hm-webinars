import { Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white/80 py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              אומץ
              <span className="text-brand-gold-light">.</span>
            </div>
            <p className="text-base leading-relaxed">
              מלווים אתכם להשקעה בטוחה.
              <br />
              בהנהלת אבינעם הרוש · מ.ר. 3252660
            </p>
          </div>

          <div>
            <div className="text-base font-extrabold text-white mb-4 uppercase tracking-wider">
              צרו קשר
            </div>
            <ul className="space-y-3 text-base md:text-lg">
              <li className="flex items-center gap-3">
                <span className="flex size-10 rounded-full bg-brand-gold/15 items-center justify-center">
                  <Phone className="size-5 text-brand-gold-light" />
                </span>
                <a href="tel:073-000-0000" dir="ltr" className="hover:text-white font-bold">
                  073-000-000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-10 rounded-full bg-brand-gold/15 items-center justify-center">
                  <Mail className="size-5 text-brand-gold-light" />
                </span>
                <a
                  href="mailto:ometzmercaz@gmail.com"
                  className="hover:text-white"
                  dir="ltr"
                >
                  ometzmercaz@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div className="md:text-end">
            <div className="text-base font-extrabold text-white mb-4 uppercase tracking-wider">
              הוובינר
            </div>
            <p className="text-lg md:text-xl text-white font-bold mb-1">
              יום רביעי, 10/6/2026
            </p>
            <p className="text-lg text-brand-gold-light font-bold mb-3">
              ב-20:00
            </p>
            <p className="text-sm text-white/60">
              אונליין מהבית · מספר מקומות מוגבל
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-sm text-white/50 text-center leading-relaxed">
          © {new Date().getFullYear()} כל הזכויות שמורות. אין באמור משום ייעוץ
          השקעות או תחליף לייעוץ פיננסי אישי.
        </div>
      </div>
    </footer>
  );
}
