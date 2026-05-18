import { Mail, Phone } from "lucide-react";
import { EditableText } from "@/components/editable/text";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function BoldFooter({ config }: { config: CampaignConfig }) {
  const { footer, webinar } = config;

  return (
    <footer className="bg-brand-dark text-white/80 py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              <EditableText path="brand.name" as="span" placeholder="שם המותג" />
              <span className="text-brand-gold-light">.</span>
            </div>
            <EditableText
              path="brand.tagline"
              as="p"
              multiline
              className="text-base leading-relaxed"
              placeholder="טאג-ליין"
              hideIfEmpty
            />
          </div>

          <div>
            <div className="text-base font-extrabold text-white mb-4 uppercase tracking-wider">צרו קשר</div>
            <ul className="space-y-3 text-base md:text-lg">
              <li className="flex items-center gap-3">
                <span className="flex size-10 rounded-full bg-brand-gold/15 items-center justify-center">
                  <Phone className="size-5 text-brand-gold-light" />
                </span>
                <EditableText
                  path="footer.phone"
                  as="span"
                  className="font-bold"
                  placeholder="טלפון"
                />
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-10 rounded-full bg-brand-gold/15 items-center justify-center">
                  <Mail className="size-5 text-brand-gold-light" />
                </span>
                <EditableText path="footer.email" as="span" placeholder="מייל" />
              </li>
            </ul>
          </div>

          <div className="md:text-end">
            <div className="text-base font-extrabold text-white mb-4 uppercase tracking-wider">הוובינר</div>
            <p className="text-lg md:text-xl text-white font-bold mb-1">{webinar.dateLabel || "—"}</p>
            <p className="text-lg text-brand-gold-light font-bold mb-3">ב-{webinar.time || "—"}</p>
            <p className="text-sm text-white/60">{webinar.venue || ""}</p>
          </div>
        </div>

        <EditableText
          path="footer.legal"
          as="div"
          multiline
          className="border-t border-white/10 mt-12 pt-8 text-sm text-white/50 text-center leading-relaxed"
          placeholder="טקסט משפטי"
          hideIfEmpty
        />
      </div>
    </footer>
  );
}
