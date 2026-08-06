"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useHomeDeals } from "@/components/home/premium/HomeDealsProvider";
import { formatEUR } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { MiniSparkline } from "@/components/home/premium/illustrations";

function ExampleCard({ p }: { p: Product }) {
  return (
    <li key={p.ean}>
      <Link
        href={`/p/?id=${encodeURIComponent(p.slug)}`}
        className="home-card group block overflow-hidden"
      >
        <div className="flex aspect-square items-center justify-center bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.imageUrl!}
            alt=""
            loading="lazy"
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="border-t border-slate-100 p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-blue-600">
              {p.name}
            </p>
            <MiniSparkline
              min={p.historicalMin ?? p.currentPrice}
              avg={p.avg30d ?? p.currentPrice}
              current={p.currentPrice}
              max={p.historicalMax ?? p.currentPrice}
              className="h-7 w-11 shrink-0"
            />
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {formatEUR(p.currentPrice)}
          </p>
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
            {p.decision.lymiarIndex?.summary || p.decision.reason}
          </p>
        </div>
      </Link>
    </li>
  );
}

function ExampleSkeleton({ id }: { id: string }) {
  return (
    <li key={id}>
      <div className="home-card h-full animate-pulse overflow-hidden">
        <div className="aspect-square bg-slate-100" />
        <div className="space-y-3 border-t border-slate-100 p-5">
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="h-6 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
    </li>
  );
}

export function HomeExamples() {
  const { dealsNow, loading } = useHomeDeals();
  const items = useMemo(
    () => dealsNow.filter((p) => p.imageUrl).slice(0, 4),
    [dealsNow],
  );

  if (!items.length && !loading) return null;

  return (
    <section id="exemplos" className="scroll-mt-20 bg-slate-50">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl">
        <p className="text-sm font-semibold text-blue-600">Casos reais</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Exemplos reais
        </h2>
        <p className="mt-4 max-w-xl text-base text-slate-500">
          Produtos observados agora — com preço, histórico e decisão.
        </p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.length
            ? items.map((p) => <ExampleCard key={p.ean} p={p} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <ExampleSkeleton key={`ex-${i}`} id={`ex-${i}`} />
              ))}
        </ul>
      </div>
    </section>
  );
}
