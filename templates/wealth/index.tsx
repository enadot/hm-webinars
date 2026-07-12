import type { CampaignConfig } from "@/lib/campaign-schema";
import { WealthHero } from "./components/hero";
import { WealthIntro } from "./components/intro";
import { WealthSpeakers } from "./components/speakers";
import { WealthBullets } from "./components/bullets";
import { WealthCommitments } from "./components/commitments";
import { WealthLeadForm } from "./components/lead-form";
import { WealthFooter } from "./components/footer";
import { EditableBanner } from "@/components/editable/banner";

export function WealthTemplate({ config, slug }: { config: CampaignConfig; slug?: string }) {
  return (
    <main className="min-h-screen bg-white overflow-x-clip">
      <WealthHero config={config} />
      <WealthLeadForm config={config} slug={slug} placement="top" />
      {config.intro && <WealthIntro intro={config.intro} />}
      <WealthSpeakers config={config} />
      <WealthBullets config={config} />
      {config.commitments && <WealthCommitments commitments={config.commitments} />}
      <EditableBanner />
      <WealthLeadForm config={config} slug={slug} />
      <WealthFooter config={config} />
    </main>
  );
}
