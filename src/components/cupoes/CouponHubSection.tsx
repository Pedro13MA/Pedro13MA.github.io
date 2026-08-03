"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CouponCard } from "@/components/cupoes/CouponCard";
import {
  getCoupons,
  mapSmartCoupon,
  smartCouponToPromotion,
} from "@/lib/api";
import { COUPON_HUB_STORES, storeLogoUrl } from "@/lib/coupon-stores";
import { normalizeCouponStoreSlug, resolveStoreLabel } from "@/lib/coupon-utils";
import type { Promotion } from "@/lib/types";
import { cn } from "@/lib/utils";

function SectionSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-2xl border border-dashed border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

function CouponEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <span className="text-3xl" aria-hidden>
        🎟️
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-slate-900">
        Sem campanhas no momento
      </p>
      <p className="mt-2 max-w-md text-[15px] text-slate-500">
        O preço apresentado pelo Limiar continua sempre baseado no preço real
        encontrado.
      </p>
    </div>
  );
}

function StoreLogoChip({ slug, name }: { slug: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const logo = storeLogoUrl(slug);
  if (failed) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt=""
      width={24}
      height={24}
      className="h-6 w-6 rounded-md border border-slate-200 bg-white object-contain p-0.5"
      onError={() => setFailed(true)}
    />
  );
}

/** Resumo de campanhas na homepage — detalhe por loja em /cupoes/[store]. */
export function CouponHubSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const hub = await getCoupons();
        if (cancelled) return;
        const promos = (hub.coupons || []).map((c) => {
          const mapped = mapSmartCoupon(c);
          const slug = normalizeCouponStoreSlug(mapped.storeCode);
          return smartCouponToPromotion(
            { ...mapped, storeCode: slug },
            resolveStoreLabel(slug, mapped.storeName || c.store || c.storeCode),
          );
        });
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

  const countsByStore = useMemo(() => {
    const map = new Map<string, number>();
    for (const promo of promotions) {
      const slug = normalizeCouponStoreSlug(promo.storeSlug);
      map.set(slug, (map.get(slug) || 0) + 1);
    }
    return map;
  }, [promotions]);

  const storeTabs = useMemo(() => {
    const fromData = new Map<string, string>();
    for (const promo of promotions) {
      const slug = normalizeCouponStoreSlug(promo.storeSlug);
      if (!slug || fromData.has(slug)) continue;
      fromData.set(slug, resolveStoreLabel(slug, promo.storeName));
    }
    const tabs = COUPON_HUB_STORES.map((s) => ({
      id: s.slug,
      label: s.name,
      count: countsByStore.get(s.slug) || 0,
    })).filter((t) => t.count > 0 || fromData.has(t.id));

    for (const [id, label] of fromData) {
      if (tabs.some((t) => t.id === id)) continue;
      tabs.push({ id, label, count: countsByStore.get(id) || 0 });
    }
    return tabs;
  }, [promotions, countsByStore]);

  // Homepage: resumo — no máximo 8 campanhas; o resto nas páginas de loja
  const summary = useMemo(() => promotions.slice(0, 8), [promotions]);

  return (
    <section id="cupoes" className="scroll-mt-16 border-t border-slate-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Cupões
          </h2>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-slate-500">
            Campanhas activas nas lojas. O preço Limiar continua baseado no preço observado —
            o cupão é ajuda à parte, nunca misturado como se já estivesse aplicado.
          </p>
        </div>

        {!loading && storeTabs.length > 0 ? (
          <div className="mb-10 flex flex-wrap items-center gap-2">
            {storeTabs.map((t) => (
              <Link
                key={t.id}
                href={`/cupoes/${encodeURIComponent(t.id)}/`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700",
                  "transition-colors duration-150 hover:border-sky-300 hover:text-sky-900",
                )}
              >
                <StoreLogoChip slug={t.id} name={t.label} />
                {t.label}
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {t.count}
                </span>
              </Link>
            ))}
          </div>
        ) : null}

        {loading ? (
          <SectionSkeleton />
        ) : error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-800">
            {error}
          </p>
        ) : summary.length === 0 ? (
          <CouponEmptyState />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {summary.map((p) => (
                <CouponCard
                  key={`${p.storeSlug}-${p.code || p.externalId || p.title}`}
                  promotion={p}
                />
              ))}
            </div>
            {promotions.length > summary.length || storeTabs.length > 0 ? (
              <p className="mt-8 text-center text-sm text-slate-500">
                Escolhe uma loja acima para ver todas as campanhas disponíveis.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
