import type { CampaignConfig } from "@/lib/campaign-schema";
import { EdHero } from "./components/hero";
import { EdQuestions } from "./components/questions";
import { EdWhatYouGet } from "./components/what-you-get";
import { EdAi } from "./components/ai";
import { EdPresenter } from "./components/presenter";
import { EdAudience } from "./components/audience";
import { EdOpenQa } from "./components/open-qa";
import { EdRegister } from "./components/register";
import { EdFaq } from "./components/faq";
import { EdFinal } from "./components/final";
import { EdStickyCta } from "./components/sticky-cta";
import { EdExitPopup } from "./components/exit-popup";
import { EditableBanner } from "@/components/editable/banner";

export function EditorialDarkTemplate({ config, slug }: { config: CampaignConfig; slug?: string }) {
  return (
    <main className="min-h-screen bg-[#0a0b0d] text-white font-heebo overflow-x-clip">
      <EdHero config={config} />
      <EdQuestions config={config} />
      <EdWhatYouGet config={config} />
      <EdAi config={config} />
      <EdPresenter config={config} />
      <EdAudience config={config} />
      <EdOpenQa config={config} />
      <EditableBanner />
      <EdRegister config={config} slug={slug} />
      <EdFaq config={config} />
      <EdFinal config={config} />
      <EdStickyCta />
      <EdExitPopup config={config} slug={slug} />
    </main>
  );
}
