"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CouponCard } from "@/components/cupoes/CouponCard";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { getCoupons, mapSmartCoupon, smartCouponToPromotion } from "@/lib/api";
import { COUPON_HUB_STORES, storeLogoUrl } from "@/lib/coupon-stores";
import type { Promotion } from "@/lib/types";

type Props = {
  store: string;
  storeName: string;
};

function StoreHeaderLogo({ slug, name }: { slug: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={storeLogoUrl(slug)}
      alt=""
      width={48}
      height={48}
      className="h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-1.5"
      onError={() => setFailed(true)}
    />
  );
}

export function CouponStoreClient({ store, storeName }: Props) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCoupons(store)
      .then((hubRes) => {
        if (cancelled) return;
        const promos = (hubRes.coupons || []).map((c) =>
          smartCouponToPromotion(mapSmartCoupon(c), storeName),
        );
        setPromotions(promos);
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
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <nav className="mb-8 text-sm text-slate-500">
          <Link href="/#cupoes" className="transition-colors hover:text-slate-800">
            Hub de Cupões
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-800">{storeName}</span>
        </nav>

        <header className="max-w-2xl border-b border-slate-100 pb-10">
          <div className="flex items-center gap-3">
            <StoreHeaderLogo slug={store} name={storeName} />
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              Cupões {storeName}
            </h1>
          </div>
          <p className="mt-5 text-base font-medium leading-snug text-slate-800">
            Todas as campanhas actualmente disponíveis para esta loja.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            O Limiar apresenta as campanhas promocionais activas desta loja. O Índice
            Limiar continua sempre a ser calculado com base no preço real observado,
            independentemente da existência de cupões ou campanhas.
          </p>
        </header>

        {error ? (
          <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </p>
        ) : null}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-dashed border-slate-200 bg-slate-100"
              />
            ))
          ) : promotions.length > 0 ? (
            promotions.map((promo) => (
              <CouponCard
                key={promo.externalId || `${promo.storeSlug}-${promo.title}`}
                promotion={promo}
              />
            ))
          ) : (
            <p className="col-span-full text-[15px] text-slate-500">
              Sem campanhas activas no momento — o valor apresentado é o preço directo
              na loja.
            </p>
          )}
        </div>

        <p className="mt-14 text-sm text-slate-400">
          <Link href="/#cupoes" className="transition-colors hover:text-slate-600">
            ← Voltar ao Hub de Cupões
          </Link>
          {" · "}
          {COUPON_HUB_STORES.filter((s) => s.slug !== store).map((s, i) => (
            <span key={s.slug}>
              {i > 0 ? " · " : null}
              <Link
                href={`/cupoes/${s.slug}/`}
                className="transition-colors hover:text-slate-600"
              >
                {s.name}
              </Link>
            </span>
          ))}
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
