"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { PromotionCard } from "@/components/product/PromotionCard";
import { getStorePromotions, mapPromotion } from "@/lib/api";
import { COUPON_HUB_STORES } from "@/lib/mocks";
import type { Promotion } from "@/lib/types";

type Props = {
  store: string;
  storeName: string;
};

export function CouponStoreClient({ store, storeName }: Props) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStorePromotions(store, 50)
      .then((res) => {
        if (!cancelled) setPromotions(res.results.map(mapPromotion));
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
  }, [store]);

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
          Vouchers validados em tempo real via API Limiar (AWIN Promotions).
        </p>

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
                className="h-40 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100"
              />
            ))
          ) : promotions.length > 0 ? (
            promotions.map((promo) => (
              <PromotionCard key={promo.externalId} promotion={promo} />
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Sem cupões ativos para esta loja neste momento.
            </p>
          )}
        </div>

        <p className="mt-10 text-xs text-slate-400">
          Lojas no hub:{" "}
          {COUPON_HUB_STORES.map((s) => s.name).join(" · ")}
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
