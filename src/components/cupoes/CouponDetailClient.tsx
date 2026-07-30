"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getCouponProducts,
  mapSmartCoupon,
  summaryToProduct,
  type CouponProductsResponse,
} from "@/lib/api";
import { copyCouponCode } from "@/lib/coupon-utils";
import type { Product, SmartCoupon } from "@/lib/types";
import { cn, formatEUR, limiarIndexTone, SEMAPHORE_LABEL } from "@/lib/utils";

type Props = {
  store: string;
  storeName: string;
  code: string;
};

export function CouponDetailClient({ store, storeName, code }: Props) {
  const [data, setData] = useState<CouponProductsResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupon, setCoupon] = useState<SmartCoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCouponProducts(store, code, 48);
        if (cancelled) return;
        setData(res);
        setCoupon(mapSmartCoupon(res.coupon));
        setProducts(res.results.map(summaryToProduct));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao carregar produtos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [store, code]);

  const handleCopy = useCallback(async () => {
    const ok = await copyCouponCode(code);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  }, [code]);

  const pct = coupon?.discountPct;
  const headline =
    coupon?.title?.trim() ||
    (pct != null ? `${pct}% extra com ${code.toUpperCase()}` : `Cupão ${code.toUpperCase()}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm text-slate-500">
        <Link href={`/cupoes/${store}/`} className="text-sky-700 hover:underline">
          ← Cupões {storeName}
        </Link>
      </p>

      <section className="mt-4 overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-teal-50 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              {storeName}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {headline}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              {coupon?.description ||
                "Produtos elegíveis na base Limiar com preço efetivo após este cupão."}
            </p>
            {data ? (
              <p className="mt-3 text-sm font-medium text-slate-700">
                {data.total} oportunidade{data.total === 1 ? "" : "s"} elegível
                {data.total === 1 ? "" : "eis"}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            {pct != null ? (
              <span className="inline-flex self-start rounded-full bg-teal-600 px-3 py-1 text-sm font-bold text-white sm:self-end">
                −{pct}%
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "rounded-xl px-4 py-2.5 font-mono text-sm font-bold tracking-wide transition",
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-100 text-amber-950 ring-1 ring-amber-300 hover:bg-amber-200",
              )}
            >
              {copied ? "Código copiado ✓" : code.toUpperCase()}
            </button>
            <p className="text-[11px] text-slate-500">Clica para copiar o código</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-800">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            Ainda sem produtos elegíveis para este cupão na base Limiar.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const listPrice = product.listPrice ?? product.currentPrice;
              const tone = limiarIndexTone(product.decision.limiarIndex.value);
              const sem = SEMAPHORE_LABEL[product.decision.semaphore];
              const offerUrl = product.offers[0]?.url;

              return (
                <article
                  key={product.ean}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <Link
                    href={`/p/?id=${encodeURIComponent(product.slug)}`}
                    className="relative flex h-44 items-center justify-center bg-white p-3"
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width:768px) 100vw, 33vw"
                        unoptimized
                      />
                    ) : null}
                    <span
                      className={cn(
                        "absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-xs font-bold ring-1 ring-slate-200",
                        tone.text,
                      )}
                    >
                      {product.decision.limiarIndex.value}/100
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{sem.short}</p>
                    <div className="mt-auto">
                      <p className="font-display text-2xl font-bold text-slate-900">
                        {formatEUR(listPrice)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Preço da loja · cupão informativo
                      </p>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Link
                        href={`/p/?id=${encodeURIComponent(product.slug)}`}
                        className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Detalhe Limiar
                      </Link>
                      {offerUrl ? (
                        <a
                          href={offerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-lg bg-sky-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-sky-700"
                        >
                          Ver Oferta
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
