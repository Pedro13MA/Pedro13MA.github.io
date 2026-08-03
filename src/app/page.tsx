import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { HomePageBody } from "@/components/home/HomePageBody";
import { LimiarLogo } from "@/components/ui/LimiarLogo";
import { BRAND_METHOD, BRAND_SUBTITLE, BRAND_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section
          className="relative overflow-visible border-b border-slate-200/60"
          style={{
            background:
              "linear-gradient(180deg, #ffffff 0%, #f3f8fc 48%, #ffffff 100%)",
          }}
        >
          <div className="relative mx-auto max-w-6xl overflow-visible px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
            <div className="mb-8 flex items-center gap-3">
              <LimiarLogo size={40} />
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700">
                Limiar
              </p>
            </div>
            <h1 className="font-display max-w-2xl text-[2.25rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl md:text-[3.25rem]">
              {BRAND_TAGLINE}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              {BRAND_SUBTITLE}
            </p>
            <div className="mt-10 max-w-xl sm:mt-12 sm:max-w-2xl">
              <SearchBar autoFocus />
            </div>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-slate-500">
              {BRAND_METHOD}
            </p>
          </div>
        </section>

        <HomePageBody />
      </main>
      <SiteFooter />
    </>
  );
}
