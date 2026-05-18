import type { CampaignConfig } from "@/lib/campaign-schema";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/templates/bold-hero/components/countdown";
import { Zap, Rocket, Star, Calendar, Clock, Video } from "lucide-react";
import { EnergeticLeadForm } from "./components/lead-form";

export function EnergeticTemplate({
  config,
  slug,
}: {
  config: CampaignConfig;
  slug?: string;
}) {
  const { hero, webinar, speakers, bullets, brand, intro } = config;

  return (
    <main className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
      {/* Hero - big color block */}
      <section className="relative bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400 text-white overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full blur-3xl opacity-50 animate-blob" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-300 rounded-full blur-3xl opacity-50 animate-blob-slow" />

        {brand.logoUrl && (
          <div className="relative bg-white">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logoUrl} alt={brand.name} className="h-12 md:h-14 w-auto" />
            </div>
          </div>
        )}

        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-black text-yellow-300 px-5 py-2.5 rounded-full font-extrabold text-base mb-8 shadow-2xl">
              <Zap className="size-5 fill-yellow-300" />
              {hero.eyebrow || "וובינר חינמי"}
              <Zap className="size-5 fill-yellow-300" />
            </div>

            <h1 className="font-extrabold leading-[0.9] tracking-tighter mb-6">
              <span className="block text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] -rotate-1 drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
                {hero.headline}
              </span>
              {hero.headlineAccent && (
                <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-yellow-300 mt-4 rotate-1 drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
                  {hero.headlineAccent}!
                </span>
              )}
            </h1>

            <p className="text-2xl md:text-3xl lg:text-4xl font-bold mb-12 max-w-3xl mx-auto leading-tight">
              {hero.subheadline}
            </p>

            <div className="bg-white text-black rounded-3xl p-6 md:p-8 mb-10 inline-flex flex-wrap gap-6 md:gap-10 items-center justify-center shadow-2xl">
              <PillBlack icon={<Calendar className="size-6" />} text={webinar.dateLabel} />
              <div className="w-px h-8 bg-zinc-300" />
              <PillBlack icon={<Clock className="size-6" />} text={webinar.time} />
              <div className="w-px h-8 bg-zinc-300" />
              <PillBlack icon={<Video className="size-6" />} text={webinar.venueShort} />
            </div>

            <div className="mb-10">
              <Countdown targetISO={webinar.dateISO} />
            </div>

            <a href="#register">
              <Button
                size="2xl"
                className="bg-black text-yellow-300 hover:bg-zinc-900 hover:scale-105 transition-transform shadow-2xl"
              >
                <Rocket className="size-7" />
                {hero.ctaText}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Intro */}
      {intro && (
        <section className="py-20 md:py-28 bg-yellow-50">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-[1.05]">
              {intro.title}{" "}
              {intro.titleAccent && (
                <span className="bg-fuchsia-500 text-white px-3 -rotate-1 inline-block">
                  {intro.titleAccent}
                </span>
              )}
            </h2>
            <p className="text-xl md:text-2xl text-zinc-700 leading-relaxed">{intro.body}</p>
          </div>
        </section>
      )}

      {/* Speakers */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-4">
              {speakers.title}{" "}
              {speakers.titleAccent && (
                <span className="bg-amber-300 text-zinc-900 px-3 inline-block">
                  {speakers.titleAccent}
                </span>
              )}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {speakers.list.map((s, i) => (
              <div
                key={i}
                className="relative bg-gradient-to-br from-fuchsia-500 to-amber-400 p-1 rounded-3xl hover:scale-[1.02] transition-transform"
              >
                <div className="bg-white rounded-[20px] p-6 md:p-8 h-full">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold mb-2">{s.name}</h3>
                  <p className="text-base font-bold text-fuchsia-600 mb-4">{s.role}</p>
                  <p className="text-base md:text-lg text-zinc-700 leading-relaxed">{s.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bullets - cards on color */}
      <section className="py-20 md:py-28 bg-fuchsia-500 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-black text-yellow-300 px-4 py-1.5 rounded-full font-extrabold mb-4">
              {bullets.eyebrow}
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
              {bullets.title}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {bullets.items.map((item, i) => (
              <div
                key={i}
                className="bg-white text-zinc-900 rounded-3xl p-7 md:p-9 hover:rotate-1 transition-transform shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="size-12 rounded-full bg-amber-300 text-zinc-900 flex items-center justify-center font-extrabold text-2xl">
                    {i + 1}
                  </span>
                  <Star className="size-7 fill-fuchsia-500 text-fuchsia-500" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold mb-3">{item.title}</h3>
                <p className="text-base md:text-lg text-zinc-700 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EnergeticLeadForm config={config} slug={slug} />

      <footer className="bg-black text-zinc-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-extrabold text-yellow-300 mb-2">{brand.name}</div>
          {brand.tagline && <p className="text-sm">{brand.tagline}</p>}
          {config.footer.legal && (
            <p className="mt-6 text-xs text-zinc-500 max-w-2xl mx-auto">{config.footer.legal}</p>
          )}
        </div>
      </footer>
    </main>
  );
}

function PillBlack({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 font-extrabold text-base md:text-lg">
      <span className="text-fuchsia-500">{icon}</span>
      {text}
    </div>
  );
}
