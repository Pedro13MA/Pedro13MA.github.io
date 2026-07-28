"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CouponCard } from "@/components/cupoes/CouponCard";
import { getStorePromotions, mapPromotion } from "@/lib/api";
import {
  COUPON_FILTER_STORES,
  normalizeCouponStoreSlug,
  type CouponStoreFilterId,
} from "@/lib/coupon-utils";
import { COUPON_HUB_STORES } from "@/lib/mocks";
import type { Promotion } from "@/lib/types";
import { cn } from "@/lib/utils";

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

export function CouponHubSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState<CouponStoreFilterId>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [worten, globaldata] = await Promise.all([
          getStorePromotions("worten", 24).catch(() => ({ results: [] as never[] })),
          getStorePromotions("globaldata", 24).catch(() => ({ results: [] as never[] })),
        ]);
        if (cancelled) return;
        setPromotions(
          [...worten.results, ...globaldata.results].map(mapPromotion),
        );
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

  const filtered = useMemo(() => {
    if (storeFilter === "all") return promotions;
    return promotions.filter(
      (p) => normalizeCouponStoreSlug(p.storeSlug) === storeFilter,
    );
  }, [promotions, storeFilter]);

  return (
    <section id="cupoes" className="border-t border-slate-200/80 bg-slate-50 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            🎟️ Hub de Cupões Validados
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Copia o código e abre a loja parceira com link AWIN — um clique.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {COUPON_FILTER_STORES.map((store) => {
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

        <div className="mb-8 flex flex-wrap gap-3">
          {COUPON_HUB_STORES.map((store) => (
            <Link
              key={store.slug}
              href={store.href}
              className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-all hover:shadow-md"
            >
              Ver todos — {store.name}
            </Link>
          ))}
        </div>

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
          <p className="text-sm text-slate-500">
            Sem cupões extra ativos para este filtro — o valor apresentado é o preço
            direto na loja.
          </p>
        )}
      </div>
    </section>
  );
}
