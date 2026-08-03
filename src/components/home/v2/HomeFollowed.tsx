"use client";

/**
 * Mais seguidos — watchlists locais; fallback para popularidade factual.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MarketplaceProductCard } from "@/lib/api";
import { listWatches, type WatchItem } from "@/lib/watchlists";
import {
  HomeEmpty,
  HomeProductCard,
  HomeScroller,
  HomeSection,
} from "@/components/home/v2/HomeShared";

export function HomeFollowed({
  popularFallback,
}: {
  popularFallback: MarketplaceProductCard[];
}) {
  const [watches, setWatches] = useState<WatchItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void listWatches(true).then((w) => {
      setWatches(w.filter((x) => x.kind === "PRODUCT").slice(0, 12));
      setReady(true);
    });
  }, []);

  const usingWatch = ready && watches.length > 0;

  return (
    <HomeSection
      title="Mais seguidos"
      subtitle={
        usingWatch
          ? "Produtos que estás a seguir neste dispositivo."
          : "Ainda sem follows — a mostrar produtos com mais lojas (popularidade observada)."
      }
      href={usingWatch ? "/timeline/" : "/mercado/"}
    >
      {!ready ? (
        <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
      ) : usingWatch ? (
        <HomeScroller>
          {watches.map((w) => (
            <Link
              key={w.id}
              href={w.target.href}
              className="w-40 shrink-0 snap-start rounded-xl border border-sky-100 bg-sky-50/50 p-3 shadow-sm hover:border-sky-200"
            >
              <p className="line-clamp-2 text-xs font-medium text-slate-900">
                {w.target.label}
              </p>
              {w.baseline?.price != null ? (
                <p className="mt-1 text-sm font-bold tabular-nums">
                  {w.baseline.price.toFixed(2)} €
                </p>
              ) : null}
            </Link>
          ))}
        </HomeScroller>
      ) : popularFallback.length ? (
        <HomeScroller>
          {popularFallback.map((p) => (
            <HomeProductCard key={p.slug || p.ean} item={p} />
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Segue produtos para os veres aqui." />
      )}
    </HomeSection>
  );
}
