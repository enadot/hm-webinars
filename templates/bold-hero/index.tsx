import type { CampaignConfig } from "@/lib/campaign-schema";
import { BoldHero } from "./components/hero";
import { BoldIntro } from "./components/intro";
import { BoldSpeakers } from "./components/speakers";
import { BoldBullets } from "./components/bullets";
import { BoldCommitments } from "./components/commitments";
import { BoldLeadForm } from "./components/lead-form";
import { BoldFooter } from "./components/footer";

export function BoldHeroTemplate({ config, slug }: { config: CampaignConfig; slug?: string }) {
  return (
    <main className="min-h-screen bg-white">
      <BoldHero config={config} />
      {config.intro && <BoldIntro intro={config.intro} />}
      <BoldSpeakers config={config} />
      <BoldBullets config={config} />
      {config.commitments?.enabled && config.commitments.imageUrl && (
        <BoldCommitments commitments={config.commitments} />
      )}
      <BoldLeadForm config={config} slug={slug} />
      <BoldFooter config={config} />
    </main>
  );
}
