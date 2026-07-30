"use client";

import { useEffect, useMemo, useState } from "react";
import { CouponCard } from "@/components/cupoes/CouponCard";
import {
  getCoupons,
  mapSmartCoupon,
  smartCouponToPromotion,
} from "@/lib/api";
import { normalizeCouponStoreSlug } from "@/lib/coupon-utils";
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

function CouponEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <span className="text-3xl" aria-hidden>
        🏷️
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-slate-900">
        Sem campanhas no momento
      </p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Os cupões são informativos e não alteram o preço Limiar. Volta mais tarde.
      </p>
    </div>
  );
}

export function CouponHubSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const hub = await getCoupons();
        if (cancelled) return;
        const promos = (hub.coupons || []).map((c) =>
          smartCouponToPromotion(mapSmartCoupon(c), c.storeCode || "loja"),
        );
        setPromotions(promos);
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

  return (
    <section id="cupoes" className="scroll-mt-16 border-t border-slate-200/80 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            🎟️ Hub de Cupões
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Campanhas das lojas — informativas. O preço Limiar é sempre o preço real
            publicado.
          </p>
        </div>

        {!loading && (promotions.length > 0 || storeTabs.length > 0) ? (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStoreFilter("all")}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                storeFilter === "all"
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
              )}
            >
              Todas
            </button>
            {storeTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setStoreFilter(t.id)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  storeFilter === t.id
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <SectionSkeleton />
        ) : error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-800">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <CouponEmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <CouponCard
                key={`${p.storeSlug}-${p.code || p.externalId || p.title}`}
                promotion={p}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
