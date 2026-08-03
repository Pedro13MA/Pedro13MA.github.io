"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getLoja, type MarketplaceStoreDetail } from "@/lib/api";
import { MarketProductCard, MarketStat } from "@/components/mercado/MarketCards";
import { WatchButton } from "@/components/watchlists/WatchButton";
import { EntityActivityTimeline } from "@/components/watchlists/EntityActivityTimeline";
import { baselineFromStore } from "@/lib/watchlists";
import { formatEUR } from "@/lib/utils";

function StoreInner() {
  const params = useSearchParams();
  const id = (params.get("id") || "").trim();
  const [data, setData] = useState<MarketplaceStoreDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let c = false;
    getLoja(id)
      .then((d) => {
        if (!c) setData(d);
      })
      .catch(() => {
        if (!c) setError("Loja não encontrada.");
      });
    return () => {
      c = true;
    };
  }, [id]);

  if (!id) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="text-slate-500">Indica uma loja (?id=…).</p>
        <Link href="/mercado/lojas/" className="mt-4 inline-block text-sky-700">
          Ver lojas
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
          <Link href="/mercado/lojas/" className="hover:underline">
            Lojas
          </Link>{" "}
          / {data?.name || id}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">
          {data?.name || (error ? "Loja" : "A carregar")}
        </h1>
        {data ? (
          <div className="mt-3">
            <WatchButton
              kind="STORE"
              target={{
                key: data.slug,
                label: data.name,
                href: `/mercado/loja/?id=${encodeURIComponent(data.slug)}`,
              }}
              baseline={baselineFromStore(data)}
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
            <MarketStat label="Promoções" value={String(data.promotions)} />
            <MarketStat
              label="Última update"
              value={(data.lastUpdate || "—").toString().slice(0, 16)}
            />
          </div>
          <EntityActivityTimeline kind="STORE" targetKey={data.slug} />
          {data.categories.length ? (
            <section>
              <h2 className="font-display text-lg font-bold">Categorias</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {data.categories.map((c) => (
                  <li
                    key={c.slug}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
                  >
                    {c.slug} · {c.products}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold">Últimos produtos</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.recentProducts.map((p) => (
                <MarketProductCard key={p.slug} item={p} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

export function LojaDetailClient() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-400">A carregar…</p>}>
      <StoreInner />
    </Suspense>
  );
}
