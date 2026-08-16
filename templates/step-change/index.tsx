import type { CampaignConfig } from "@/lib/campaign-schema";
import { ScHero } from "./components/hero";
import { ScPain } from "./components/pain";
import { ScBridge } from "./components/bridge";
import { ScAgenda } from "./components/agenda";
import { ScRisk } from "./components/risk";
import { ScSpeakers } from "./components/speakers";
import { ScAudience } from "./components/audience";
import { ScProof } from "./components/proof";
import { ScPerks } from "./components/perks";
import { ScCtaBand } from "./components/cta-band";
import { ScRegister } from "./components/register";
import { ScFaq } from "./components/faq";
import { ScFinal } from "./components/final";
import { ScStickyCta } from "./components/sticky-cta";
import { EditableBanner } from "@/components/editable/banner";

export function StepChangeTemplate({ config, slug }: { config: CampaignConfig; slug?: string }) {
  return (
    <main className="min-h-screen bg-[#162321] text-[#EFEFEF] font-tamo overflow-x-clip scroll-smooth">
      <ScHero config={config} />
      <ScPain config={config} />
      <ScBridge config={config} />
      <ScAgenda config={config} />
      <ScRisk config={config} />
      <ScSpeakers config={config} />
      <ScAudience config={config} />
      <ScProof config={config} />
      <ScPerks config={config} />
      <ScCtaBand config={config} />
      <EditableBanner />
      <ScRegister config={config} slug={slug} />
      <ScFaq config={config} />
      <ScFinal config={config} />
      <ScStickyCta />
    </main>
  );
}
