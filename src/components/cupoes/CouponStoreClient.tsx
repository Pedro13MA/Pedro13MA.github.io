"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CouponCard } from "@/components/cupoes/CouponCard";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { getCoupons, getStoreCampaigns, mapSmartCoupon, smartCouponToPromotion } from "@/lib/api";
import { COUPON_HUB_STORES } from "@/lib/mocks";
import type { Promotion, StoreCampaign } from "@/lib/types";

type Props = {
  store: string;
  storeName: string;
};

export function CouponStoreClient({ store, storeName }: Props) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<StoreCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getCoupons(store).catch(() => ({ store, coupons: [] as never[] })),
      getStoreCampaigns(store).catch(() => ({
        store,
        campaigns: [],
        coupons: [],
      })),
    ])
      .then(([hubRes, campRes]) => {
        if (cancelled) return;
        const promos = (hubRes.coupons || []).map((c) =>
          smartCouponToPromotion(mapSmartCoupon(c), storeName),
        );
        for (const c of campRes.coupons) {
          if (promos.some((p) => p.code && p.code === c.code)) continue;
          promos.push(smartCouponToPromotion(mapSmartCoupon(c), storeName));
        }
        setPromotions(promos);
        setCampaigns(
          campRes.campaigns.map((c) => ({
            storeCode: c.storeCode,
            title: c.title,
            description: c.description,
            rulesSummary: c.rulesSummary,
            appliesTo: c.appliesTo,
            category: c.category,
            couponCode: c.couponCode,
            affiliateUrl: c.affiliateUrl,
            startDate: c.startDate,
            endDate: c.endDate,
            isActive: c.isActive,
          })),
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao carregar cupões");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [store, storeName]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/#cupoes" className="hover:text-slate-800">
            Hub de Cupões
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{storeName}</span>
        </nav>

        <h1 className="font-display text-3xl font-bold text-slate-900">
          Cupões {storeName}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Campanhas e códigos para {storeName}. Copia o código e aplica as condições
          na loja. O preço Limiar não inclui cupões.
        </p>

        {!loading && campaigns.length > 0 ? (
          <div className="mt-8 space-y-3">
            {campaigns.map((c) => (
              <div
                key={`${c.storeCode}-${c.title}`}
                className="rounded-2xl border border-amber-200/90 bg-amber-50/80 px-4 py-3"
              >
                <p className="text-sm font-bold text-amber-900">🔥 {c.title}</p>
                {c.rulesSummary ? (
                  <p className="mt-1 text-sm text-amber-950/85">{c.rulesSummary}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </p>
        ) : null}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-dashed border-slate-200 bg-slate-100"
              />
            ))
          ) : promotions.length > 0 ? (
            promotions.map((promo) => (
              <CouponCard key={promo.externalId} promotion={promo} />
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Sem cupões extra ativos no momento — o valor apresentado é o preço direto na
              loja.
            </p>
          )}
        </div>

        <p className="mt-10 text-xs text-slate-400">
          <Link href="/#cupoes" className="hover:text-slate-600">
            Voltar ao Hub de Cupões
          </Link>
          {" · "}
          {COUPON_HUB_STORES.map((s) => s.name).join(" · ")}
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
