"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeHero } from "@/components/home/v2/HomeHero";
import { HomePageBody } from "@/components/home/HomePageBody";
import { CouponHubSection } from "@/components/cupoes/CouponHubSection";
import { getHome, type HomepagePayload } from "@/lib/api";
import { TELEGRAM_CHANNEL } from "@/lib/constants";

function SectionPulse() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

const HomeDeals = dynamic(
  () =>
    import("@/components/home/v2/HomeProductSections").then((m) => m.HomeDeals),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeFeatured = dynamic(
  () =>
    import("@/components/home/v2/HomeProductSections").then(
      (m) => m.HomeFeatured,
    ),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeRecentDrops = dynamic(
  () =>
    import("@/components/home/v2/HomeProductSections").then(
      (m) => m.HomeRecentDrops,
    ),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeDiscovery = dynamic(
  () =>
    import("@/components/home/v2/HomeProductSections").then(
      (m) => m.HomeDiscovery,
    ),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeLatestProducts = dynamic(
  () =>
    import("@/components/home/v2/HomeProductSections").then(
      (m) => m.HomeLatestProducts,
    ),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeCategories = dynamic(
  () =>
    import("@/components/home/v2/HomeMarketSections").then(
      (m) => m.HomeCategories,
    ),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeBrands = dynamic(
  () =>
    import("@/components/home/v2/HomeMarketSections").then((m) => m.HomeBrands),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeStores = dynamic(
  () =>
    import("@/components/home/v2/HomeMarketSections").then((m) => m.HomeStores),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeMarket = dynamic(
  () =>
    import("@/components/home/v2/HomeMarketSections").then((m) => m.HomeMarket),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeCoupons = dynamic(
  () => import("@/components/home/v2/HomeCoupons").then((m) => m.HomeCoupons),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeFollowed = dynamic(
  () =>
    import("@/components/home/v2/HomeFollowed").then((m) => m.HomeFollowed),
  { loading: () => <SectionPulse />, ssr: false },
);
const HomeCanonicalFamilies = dynamic(
  () =>
    import("@/components/home/v2/HomeCanonicalFamilies").then(
      (m) => m.HomeCanonicalFamilies,
    ),
  { loading: () => <SectionPulse />, ssr: false },
);

export function HomePageClient() {
  const [data, setData] = useState<HomepagePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    getHome()
      .then((d) => {
        if (!c) setData(d);
      })
      .catch((err) => {
        if (!c)
          setError(err instanceof Error ? err.message : "Falha ao carregar");
      });
    return () => {
      c = true;
    };
  }, []);

  return (
    <>
      <HomeHero />

      {error ? (
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Não foi possível carregar a descoberta da homepage. As decisões de
            compra abaixo continuam disponíveis.
          </p>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {data ? (
          <>
            <HomeDeals items={data.topDeals} />
            <HomeFeatured items={data.featured} />
            <HomeRecentDrops items={data.recentDrops} />
            <HomeFollowed popularFallback={data.popularProducts} />
            <HomeCanonicalFamilies />
            <HomeCategories items={data.categories} />
            <HomeBrands items={data.trendingBrands} />
            <HomeStores items={data.trendingStores} />
            <HomeMarket summary={data.marketSummary} />
            <HomeCoupons items={data.latestCoupons || []} />
            <HomeDiscovery items={data.recommended} />
            <HomeLatestProducts items={data.latestProducts} />
          </>
        ) : !error ? (
          <SectionPulse />
        ) : null}
      </div>

      {/* Decisões comprar/esperar — eixo do produto (API deals existente) */}
      <HomePageBody decisionsOnly />

      <CouponHubSection />

      <section className="border-t border-slate-200/60 bg-[#FAFAFA]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-white px-6 py-8 sm:flex-row sm:items-center sm:px-10">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Acompanhar no Telegram
              </h2>
              <p className="mt-2 max-w-lg text-sm text-slate-500">
                Oportunidades publicadas no canal — sem substituir a decisão na
                página do produto.
              </p>
            </div>
            <a
              href={TELEGRAM_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-xl bg-sky-700 px-6 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Abrir Telegram
            </a>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            <Link href="/mercado/" className="hover:underline">
              Mercado
            </Link>
            {" · "}
            <Link href="/timeline/" className="hover:underline">
              Timeline
            </Link>
            {" · "}
            <Link href="/minha-area/" className="hover:underline">
              Minha Área
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
