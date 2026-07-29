"use client";

import { useEffect, useMemo, useState } from "react";
import { CouponCard } from "@/components/cupoes/CouponCard";
import {
  getStoreCampaigns,
  getStorePromotions,
  mapPromotion,
  mapSmartCoupon,
  smartCouponToPromotion,
} from "@/lib/api";
import { normalizeCouponStoreSlug } from "@/lib/coupon-utils";
import type { Promotion, StoreCampaign } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Lojas com API de promoções ativa — usado só para fetch, não para labels das tabs. */
const INTEGRATED_PROMO_STORES = ["worten", "globaldata"] as const;

function SectionSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="h-52 animate-pulse rounded-2xl border border-dashed border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

function CouponEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <span className="text-3xl" aria-hidden>
        🏷️
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-slate-900">
        Sem cupões adicionais no momento
      </p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Os preços listados para esta loja já refletem o melhor valor direto no carrinho.
      </p>
    </div>
  );
}

export function CouponHubSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<StoreCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const batches = await Promise.all(
          INTEGRATED_PROMO_STORES.map(async (slug) => {
            const [promoRes, campRes] = await Promise.all([
              getStorePromotions(slug, 24).catch(() => ({ results: [] as never[] })),
              getStoreCampaigns(slug).catch(() => ({
                store: slug,
                campaigns: [],
                coupons: [],
              })),
            ]);
            return { slug, promoRes, campRes };
          }),
        );
        if (cancelled) return;
        const promos: Promotion[] = [];
        const camps: StoreCampaign[] = [];
        for (const { slug, promoRes, campRes } of batches) {
          promos.push(...promoRes.results.map(mapPromotion));
          for (const c of campRes.coupons) {
            promos.push(smartCouponToPromotion(mapSmartCoupon(c), slug));
          }
          camps.push(...campRes.campaigns.map((c) => ({
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
          })));
        }
        setPromotions(promos);
        setCampaigns(camps);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao carregar cupões");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const storeTabs = useMemo(() => {
    const bySlug = new Map<string, string>();
    for (const promo of promotions) {
      const slug = normalizeCouponStoreSlug(promo.storeSlug);
      if (!slug || bySlug.has(slug)) continue;
      bySlug.set(slug, promo.storeName?.trim() || slug);
    }
    return Array.from(bySlug.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt"));
  }, [promotions]);

  useEffect(() => {
    if (storeFilter === "all") return;
    if (!storeTabs.some((t) => t.id === storeFilter)) {
      setStoreFilter("all");
    }
  }, [storeFilter, storeTabs]);

  const filtered = useMemo(() => {
    if (storeFilter === "all") return promotions;
    return promotions.filter(
      (p) => normalizeCouponStoreSlug(p.storeSlug) === storeFilter,
    );
  }, [promotions, storeFilter]);

  const filteredCampaigns = useMemo(() => {
    if (storeFilter === "all") return campaigns;
    return campaigns.filter(
      (c) => normalizeCouponStoreSlug(c.storeCode) === storeFilter,
    );
  }, [campaigns, storeFilter]);

  return (
    <section id="cupoes" className="scroll-mt-16 border-t border-slate-200/80 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            🎟️ Hub de Cupões Validados
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Campanhas ativas, cupões com regras por loja/categoria/condição — link AWIN.
          </p>
        </div>

        {!loading && filteredCampaigns.length > 0 ? (
          <div className="mb-8 space-y-3">
            {filteredCampaigns.map((c) => (
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

        {!loading && (promotions.length > 0 || storeTabs.length > 0) ? (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStoreFilter("all")}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                storeFilter === "all"
                  ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm",
              )}
            >
              Todas as Lojas
            </button>
            {storeTabs.map((store) => {
              const active = storeFilter === store.id;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setStoreFilter(store.id)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                    active
                      ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm",
                  )}
                >
                  {store.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {error ? (
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </p>
        ) : null}

        {loading ? (
          <SectionSkeleton />
        ) : filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((promo) => (
              <CouponCard key={promo.externalId} promotion={promo} />
            ))}
          </div>
        ) : (
          <CouponEmptyState />
        )}
      </div>
    </section>
  );
}
