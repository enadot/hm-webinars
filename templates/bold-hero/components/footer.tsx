import { EditableText } from "@/components/editable/text";
import type { CampaignConfig } from "@/lib/campaign-schema";

export function BoldFooter({ config }: { config: CampaignConfig }) {
  void config;
  return (
    <footer className="bg-brand-dark text-white/50 py-10">
      <div className="container mx-auto px-4">
        <EditableText
          path="footer.legal"
          as="div"
          multiline
          className="text-sm text-center leading-relaxed max-w-3xl mx-auto"
          placeholder="© 2026 כל הזכויות שמורות. אין באמור משום ייעוץ השקעות או תחליף לייעוץ פיננסי אישי."
        />
      </div>
    </footer>
  );
}
