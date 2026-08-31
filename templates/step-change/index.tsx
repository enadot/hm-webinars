import type { CampaignConfig } from "@/lib/campaign-schema";
import { ScHero } from "./components/hero";
import { ScAgenda } from "./components/agenda";
import { ScRisk } from "./components/risk";
import { ScSpeakers } from "./components/speakers";
import { ScAudience } from "./components/audience";
import { ScRegister } from "./components/register";
import { ScFaq } from "./components/faq";
import { ScFinal } from "./components/final";
import { ScStickyCta } from "./components/sticky-cta";
import { EditableBanner } from "@/components/editable/banner";

export function StepChangeTemplate({ config, slug }: { config: CampaignConfig; slug?: string }) {
  return (
    <main className="min-h-screen bg-[#162321] text-[#EFEFEF] font-tamo overflow-x-clip scroll-smooth">
      {/*
        Order and section set follow the client's revision: hero with the
        webinar details, who is running it, what the meeting covers, then the
        risk conversation, who it suits, signup, FAQ, close.

        Deliberately not rendered any more — each was a duplicate of something
        stronger elsewhere, and cutting them is most of the ~25-30% shortening
        that was asked for:
          ScPain    — same job as ScAudience; the client kept the audience one.
          ScBridge  — restated the hero.
          ScProof   — repeated the speakers' credentials; merged into ScSpeakers.
          ScPerks   — its live-only message now lives in one place, the FAQ.
          ScCtaBand — a third CTA between two others.
        The components and their config still exist, so any of them can be put
        back by adding one line here.
      */}
      <ScHero config={config} />
      <ScSpeakers config={config} />
      <ScAgenda config={config} />
      <ScRisk config={config} />
      <ScAudience config={config} />
      <EditableBanner />
      <ScRegister config={config} slug={slug} />
      <ScFaq config={config} />
      <ScFinal config={config} />
      <ScStickyCta />
    </main>
  );
}
