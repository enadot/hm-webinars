import type { CampaignConfig } from "@/lib/campaign-schema";
import { Calendar, Clock, Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/templates/bold-hero/components/countdown";
import { EditorialLeadForm } from "./components/lead-form";

export function EditorialTemplate({
  config,
  slug,
}: {
  config: CampaignConfig;
  slug?: string;
}) {
  const { hero, webinar, speakers, bullets, brand, intro } = config;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {/* Top bar */}
      {brand.logoUrl && (
        <header className="border-b border-stone-200 bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logoUrl} alt={brand.name} className="h-10 md:h-12 w-auto" />
            <a
              href="#register"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-stone-900 hover:text-stone-600"
            >
              לרישום
              <ArrowLeft className="size-4" />
            </a>
          </div>
        </header>
      )}

      {/* Hero - editorial style */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="text-sm md:text-base font-bold text-stone-500 tracking-[0.2em] uppercase mb-6">
              {hero.eyebrow || "וובינר חינמי"} · {webinar.dateLabel}
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.02] tracking-tight mb-6 text-stone-900">
              {hero.headline}
              {hero.headlineAccent && (
                <>
                  {" "}
                  <em
                    className="not-italic"
                    style={{ color: config.theme.primary }}
                  >
                    {hero.headlineAccent}
                  </em>
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-stone-700 leading-relaxed mb-8 max-w-2xl">
              {hero.subheadline}
            </p>
            {hero.description && (
              <p className="text-lg text-stone-600 leading-relaxed mb-10 max-w-2xl">
                {hero.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 mb-10">
              <Pill icon={<Calendar className="size-5" />} text={webinar.dateLabel} />
              <Pill icon={<Clock className="size-5" />} text={webinar.time} />
              <Pill icon={<Video className="size-5" />} text={webinar.venueShort} />
            </div>

            <a href="#register">
              <Button size="xl" variant="brand" className="text-lg">
                {hero.ctaText} ←
              </Button>
            </a>
          </div>

          {/* Right column: Speaker photos collage */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              {speakers.list.slice(0, 2).map((s, i) => (
                <div
                  key={i}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-200 ${
                    i === 0 ? "mt-8" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <div className="text-white font-bold text-lg">{s.name}</div>
                    <div className="text-white/80 text-sm">{s.role}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3 justify-center">
              <Countdown targetISO={webinar.dateISO} />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-stone-200" />

      {/* Intro */}
      {intro && (
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            {intro.eyebrow && (
              <div className="text-sm font-bold text-stone-500 tracking-[0.2em] uppercase mb-6">
                {intro.eyebrow}
              </div>
            )}
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 mb-8 leading-[1.1]">
              {intro.title}{" "}
              {intro.titleAccent && (
                <em className="not-italic" style={{ color: config.theme.primary }}>
                  {intro.titleAccent}
                </em>
              )}
            </h2>
            <p className="text-xl md:text-2xl text-stone-700 leading-[1.6]">{intro.body}</p>
          </div>
        </section>
      )}

      {/* Speakers - full bio */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="text-sm font-bold text-stone-500 tracking-[0.2em] uppercase mb-4">
              {speakers.eyebrow}
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.05]">
              {speakers.title}{" "}
              {speakers.titleAccent && (
                <em className="not-italic" style={{ color: config.theme.primary }}>
                  {speakers.titleAccent}
                </em>
              )}
            </h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-16 md:space-y-24">
            {speakers.list.map((s, i) => (
              <div
                key={i}
                className={`grid md:grid-cols-5 gap-8 md:gap-12 items-center ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className={`md:col-span-2 ${i % 2 === 1 ? "md:order-last" : ""}`}>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-stone-200 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <h3 className="font-serif text-4xl md:text-5xl font-extrabold text-stone-900 mb-2">
                    {s.name}
                  </h3>
                  <p
                    className="text-lg md:text-xl font-bold mb-5"
                    style={{ color: config.theme.primary }}
                  >
                    {s.role}
                  </p>
                  <p className="text-lg md:text-xl text-stone-700 leading-[1.7]">{s.bio}</p>
                  {s.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {s.highlights.map((h, j) => (
                        <span
                          key={j}
                          className="text-sm font-bold px-3 py-1.5 bg-white border border-stone-200 rounded-full text-stone-700"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bullets */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="text-sm font-bold text-stone-500 tracking-[0.2em] uppercase mb-4">
              {bullets.eyebrow}
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.05]">
              {bullets.title}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-stone-200">
            {bullets.items.map((item, i) => (
              <div key={i} className="py-8 flex gap-8 items-start">
                <div
                  className="font-serif text-5xl md:text-6xl font-extrabold leading-none tabular-nums shrink-0"
                  style={{ color: config.theme.primary }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-stone-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-lg md:text-xl text-stone-700 leading-[1.65]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EditorialLeadForm config={config} slug={slug} />

      <footer className="bg-stone-900 text-stone-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="font-serif text-2xl font-bold text-white mb-2">{brand.name}</div>
          {brand.tagline && <p className="text-stone-400">{brand.tagline}</p>}
          {config.footer.legal && (
            <p className="mt-8 text-xs text-stone-500 max-w-2xl mx-auto">{config.footer.legal}</p>
          )}
        </div>
      </footer>
    </main>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-base font-bold text-stone-700">
      <span className="text-stone-500">{icon}</span>
      {text}
    </span>
  );
}
