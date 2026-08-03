"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMarca, type MarketplaceBrandDetail } from "@/lib/api";
import { MarketProductCard, MarketStat } from "@/components/mercado/MarketCards";
import { WatchButton } from "@/components/watchlists/WatchButton";
import { EntityActivityTimeline } from "@/components/watchlists/EntityActivityTimeline";
import { baselineFromBrand } from "@/lib/watchlists";
import { formatEUR } from "@/lib/utils";

function BrandInner() {
  const params = useSearchParams();
  const id = (params.get("id") || "").trim();
  const [data, setData] = useState<MarketplaceBrandDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let c = false;
    getMarca(id)
      .then((d) => {
        if (!c) setData(d);
      })
      .catch(() => {
        if (!c) setError("Marca não encontrada.");
      });
    return () => {
      c = true;
    };
  }, [id]);

  if (!id) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="text-slate-500">Indica uma marca (?id=…).</p>
        <Link href="/mercado/marcas/" className="mt-4 inline-block text-sky-700">
          Ver marcas
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <p className="text-xs text-slate-400">
          <Link href="/mercado/" className="hover:underline">
            Mercado
          </Link>{" "}
          /{" "}
          <Link href="/mercado/marcas/" className="hover:underline">
            Marcas
          </Link>{" "}
          / {data?.name || id}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">
          {data?.name || (error ? "Marca" : "A carregar")}
        </h1>
        {data ? (
          <div className="mt-3">
            <WatchButton
              kind="BRAND"
              target={{
                key: data.slug,
                label: data.name,
                href: `/mercado/marca/?id=${encodeURIComponent(data.slug)}`,
              }}
              baseline={baselineFromBrand(data)}
            />
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-amber-800">{error}</p> : null}
      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MarketStat label="Produtos" value={String(data.products)} />
            <MarketStat
              label="Preço médio"
              value={data.avgPrice != null ? formatEUR(data.avgPrice) : "—"}
            />
            <MarketStat label="Categorias" value={String(data.categories)} />
            <MarketStat
              label="Mínimo"
              value={data.minPrice != null ? formatEUR(data.minPrice) : "—"}
            />
          </div>
          <EntityActivityTimeline kind="BRAND" targetKey={data.slug} />
          {data.bestOpportunity ? (
            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold">
                Melhor oportunidade
              </h2>
              <div className="max-w-xs">
                <MarketProductCard item={data.bestOpportunity} />
              </div>
            </section>
          ) : null}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold">Económicos</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.economical.map((p) => (
                <MarketProductCard key={p.slug} item={p} />
              ))}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold">Premium</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.premium.map((p) => (
                <MarketProductCard key={p.slug} item={p} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

export function MarcaDetailClient() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-400">A carregar…</p>}>
      <BrandInner />
    </Suspense>
  );
}
