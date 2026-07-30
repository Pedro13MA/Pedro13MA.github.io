import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { HomePageBody } from "@/components/home/HomePageBody";
import { HomeStatsStrip } from "@/components/home/HomeStatsStrip";
import { LimiarLogo } from "@/components/ui/LimiarLogo";
import { BRAND_SUBTITLE, BRAND_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-visible border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-blue-50/30">
          <div className="relative mx-auto max-w-6xl overflow-visible px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
            <div className="mb-6 flex items-center gap-3">
              <LimiarLogo size={40} />
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
                Limiar
              </p>
            </div>
            <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              {BRAND_TAGLINE}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
              {BRAND_SUBTITLE}
            </p>
            <div className="mt-10 max-w-2xl">
              <SearchBar autoFocus />
            </div>
          </div>
        </section>

        <HomeStatsStrip />
        <HomePageBody />
      </main>
      <SiteFooter />
    </>
  );
}
