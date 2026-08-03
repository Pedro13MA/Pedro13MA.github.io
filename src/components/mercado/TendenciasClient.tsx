"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMercadoTendencias, type MarketplaceTrending } from "@/lib/api";
import { MarketProductCard } from "@/components/mercado/MarketCards";

export function TendenciasClient() {
  const [data, setData] = useState<MarketplaceTrending | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    setLoading(true);
    getMercadoTendencias(12)
      .then((d) => {
        if (!c) setData(d);
      })
      .catch(() => {
        if (!c) setError("Não foi possível carregar tendências.");
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <p className="text-xs text-slate-400">
          <Link href="/mercado/" className="hover:underline">
            Mercado
          </Link>{" "}
          / Tendências
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">
          Tendências
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {data?.note ||
            "Apenas actividade observada — sem prever o futuro."}
        </p>
      </div>
      {error ? <p className="text-sm text-amber-800">{error}</p> : null}
      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      ) : data ? (
        <>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold">
              Recentemente adicionados
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.recentlyAdded.map((p) => (
                <MarketProductCard key={`a-${p.slug}`} item={p} />
              ))}
            </div>
          </section>
          {data.mostActivity?.length ? (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold">
                Maior actividade de preços
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.mostActivity.map((p) => (
                  <MarketProductCard key={`m-${p.slug}`} item={p} />
                ))}
              </div>
            </section>
          ) : null}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold">
              Novas promoções observadas
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.newPromotions.map((p) => (
                <MarketProductCard key={`p-${p.slug}`} item={p} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
